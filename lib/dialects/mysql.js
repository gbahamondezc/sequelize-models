"use strict";

const debug = require("debug")("sequelize-models:mysql");
const _ = require("lodash");
const co = require("co");
const utils = require("../utils.js");
const CustomTypes = require("./custom-datatypes.js");

/**
 * MySQL adapter
 */

class MySQLDialect {


  /**
   * MySQL Adapter constructor
   * @param {Object} Sequelize a sequelize js instance
   * @param {Object} connection a db connections created with sequelize
   * @param {Object} options a set of configuration options
   * @constructor
   */

  constructor(Sequelize, connection, opts) {

    debug("constructor");

    this.models = {};
    this.config = opts;

    this.typeMap = {
      varchar: Sequelize.STRING,
      text: Sequelize.TEXT,
      int: Sequelize.INTEGER,
      datetime: Sequelize.DATE,
      decimal: Sequelize.DECIMAL,
      double: Sequelize.DOUBLE,
      string: Sequelize.STRING,
      date: Sequelize.DATE,
      integer: Sequelize.INTEGER,
      tinyint: Sequelize.BOOLEAN,
      timestamp: CustomTypes.TIMESTAMP,
      char: Sequelize.CHAR,
      float: Sequelize.FLOAT,
      time: Sequelize.TIME,
      smallint: Sequelize.INTEGER,
      mediumint: Sequelize.INTEGER,
      bigint: Sequelize.BIGINT,
      year: Sequelize.INTEGER,
      blob: Sequelize.INTEGER,
      tinyblob: Sequelize.INTEGER,
      enum: Sequelize.ENUM
    };

    /** Sequelize connected instance */
    this.connection = connection;

    /** MySQL query to get all table information */
    this.tablesQuery = "SELECT a.table_name as name, a.column_name, \
        data_type, column_key, extra, column_comment, table_comment \
      FROM INFORMATION_SCHEMA.COLUMNS a \
        INNER JOIN INFORMATION_SCHEMA.TABLES b \
          ON a.TABLE_CATALOG = b.TABLE_CATALOG \
          AND a.TABLE_SCHEMA = b.TABLE_SCHEMA \
          AND a.TABLE_NAME = b.TABLE_NAME \
      WHERE a.TABLE_SCHEMA = ?";

    /** MySql query to get all relation information */
    this.relationsQuery = "SELECT * FROM INFORMATION_SCHEMA.key_column_usage \
      WHERE referenced_table_schema = ?";

    this.indexQuery = "SELECT column_name, index_comment FROM INFORMATION_SCHEMA.STATISTICS \
      WHERE seq_in_index = 1 AND TABLE_NAME = ?"
  }



  /**
   * Fetch data of tables, relations, and attributes from MySQL Schema.
   * @param {Array} modelDefs - model definitions obtained from the defined models path
   * @param {Boolean} autoLoad - flag which indicates if  the schema should be read automatically or not
   * @return {Promise} a promise that will be resolved when all data is  fetched.
   */

  loadModels(modelDefs, autoload) {

    debug("loadModels %o", autoload);

    var _this = this;

    return co(function* () {

      var yieldable = {
        tables: [],
        associations: []
      };

      if (autoload) {
        yieldable.tables = _this.connection.query(_this.tablesQuery, {
          replacements: [_this.config.schema],
          type: _this.connection.QueryTypes.SELECT
        });

        yieldable.associations = _this.connection.query(_this.relationsQuery, {
          replacements: [_this.config.schema],
          type: _this.connection.QueryTypes.SELECT
        });
      }

      var schemaData = yield yieldable;


      /** Get schema tables and relations in parallel */
      _this.models = _this.getModels(schemaData.tables, modelDefs);

      // associations from schema
      let belongsToMany = {};

      schemaData.associations.forEach(association => {

        let modelName = utils.camelize(association.TABLE_NAME);
        let attribute = association.COLUMN_NAME;
        let referencedModelName = utils.camelize(
          association.REFERENCED_TABLE_NAME
        );

        // let referencedAttribute = association["REFERENCED_COLUMN_NAME"];

        let model = _this.models[modelName];
        let refModel = _this.models[referencedModelName];

        if (model.primaryKeyAttributes.length === 1) {

          model.belongsTo(refModel, {
            foreignKey: { name: attribute }
          });

          refModel.hasMany(
            model
          );

        } else {

          let def = { fk: attribute, pk: association.REFERENCED_COLUMN_NAME, model, refModel };
          if (belongsToMany[association.TABLE_NAME]) {
            belongsToMany[association.TABLE_NAME].push(def);
          } else {
            belongsToMany[association.TABLE_NAME] = [def];
          }

        }

      });

      for (let tableName in belongsToMany) {
        let indexes = yield _this.connection.query(_this.indexQuery, {
          replacements: [tableName],
          type: _this.connection.QueryTypes.SELECT
        });
        indexes = indexes.reduce((a, e) => { a[e.column_name] = e.index_comment; return a; }, {});
        let lookupTable = belongsToMany[tableName];
        lookupTable.forEach(foreign => {
          if (indexes.hasOwnProperty(foreign.fk)) {
            lookupTable.forEach(other => {
              if (foreign !== other) {

                let fkComment = foreign.model.attributes[other.fk].comment;
                try {
                  fkComment = JSON.parse(fkComment);
                } catch (err) {
                  fkComment = { as: fkComment };
                }

                let names = [fkComment.as, other.refModel.name].filter(e => e);
                let name = null;
                let i = 1;
                while (true) {
                  try {
                    let as = names.length ? (name = names.shift()) : (name + i++);
                    foreign.refModel.belongsToMany(other.refModel, {
                      through: foreign.model,
                      field: other.fk,
                      foreignKey: {
                        name: foreign.fk,
                        fieldName: foreign.fk
                      },
                      otherKey: {
                        name: other.fk,
                        fieldName: other.fk
                      },
                      as
                    });
                    break;
                  } catch (err) {
                    console.error(err);
                    if (i > 20) {
                      console.error("Too many errors");
                      break;
                    }
                  }
                }
              }
            });
          }
        });
      }

      // Associations from model file
      modelDefs.forEach(modelDef => {

        if (!modelDef.object.associations) {
          return;
        }

        modelDef.object.associations.forEach(assoc => {

          var mainModel = _this.models[modelDef.name];
          var targetModel = _this.models[assoc.target];

          if (!mainModel) {
            throw new Error("Model [" + modelDef.name + "] Not found.");
          }

          if (!targetModel) {
            throw new Error(
              "Target Model [" + assoc.target + "] Not found for association " + assoc.type + " with [" +
              modelDef.name + "] model."
            );
          }

          _this.models[modelDef.name][assoc.type](
            _this.models[assoc.target],
            assoc.options
          );

        });
      });
      return _this.models;
    });
  }


  /**
   * Build and return Sequelize Models instances from MySQL Database
   * @param  {Array} tables - Array of tables => attributes obtained autmatically from the schema
   * @param  {Array} modelDefs - model definitions obtained from the defined models path
   * @return {Object} a  object with each model wich represent a database table (key name)
   */

  getModels(tables, modelDefs) {

    debug("getModels");
    var excludeTables = _.map(modelDefs, "object.tableName");
    tables = utils.filterTables(tables, excludeTables);

    let tableNames = _.uniq(_.map(tables, "name"));
    let models = {};

    // Direct from database schema
    tableNames.map(name => {

      let results = _.filter(tables, { name: name });
      let attribs = {};

      results.map(res => {
        attribs[res.column_name] = {
          type: this.typeMap[res.data_type],
          primaryKey: (res.column_key === "PRI"),
          autoIncrement: (res.extra === "auto_increment"),
          comment: res.column_comment
        };
      });

      models[utils.camelize(name)] = this.connection.define(
        name, attribs, { comment: results[0].table_comment }
      );
    });



    // From model files reading
    modelDefs.forEach(modelDef => {

      var attributes = Object.keys(modelDef.object.attributes);

      attributes.forEach(attr => {
        modelDef.object.attributes[attr].type =
          this.typeMap[modelDef.object.attributes[attr].type];
      });

      models[modelDef.name] = this.connection.define(
        modelDef.object.tableName,
        modelDef.object.attributes, {
          validate: modelDef.object.validate || {},
          getterMethods: modelDef.object.getterMethods || {},
          setterMethods: modelDef.object.setterMethods || {},
          indexes: modelDef.object.indexes || []
        }
      );
    });

    return models;
  }

}


/** Expose class */
module.exports = MySQLDialect;
