"use strict";

const debug = require("debug")("sequelize-models:psql");
const _ = require("lodash");
const co = require("co");
const utils = require("../utils.js");

/**
 * MySQL adapter
 */

class PSQLDialect {
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
      string: Sequelize.STRING,
      date: Sequelize.DATE,
      integer: Sequelize.INTEGER,
      "timestamp with time zone": Sequelize.DATE,
      "timestamp without time zone": Sequelize.DATE,
      "character varying": Sequelize.STRING,
      bigint: Sequelize.BIGINT,
      bit: Sequelize.INTEGER,
      boolean: Sequelize.BOOLEAN,
      character: Sequelize.CHAR,
      "double precision": Sequelize.DOUBLE,
      json: Sequelize.STRING,
      jsonb: Sequelize.JSONB,
      money: Sequelize.INTEGER,
      numeric: Sequelize.INTEGER,
      real: Sequelize.FLOAT,
      smallint: Sequelize.INTEGER,
      time: Sequelize.TIME,
      timestamp: Sequelize.DATE,
      uuid: Sequelize.UUID,
      xml: Sequelize.TEXT,
      array: Sequelize.ARRAY
    };

    /** Sequelize connected instance */
    this.connection = connection;

    /** MySQL query to get all table information */
    this.tablesQuery = `SELECT table_name AS name, column_name, data_type, column_default as column_key
      FROM information_schema.columns WHERE table_schema = 'public'`;

    this.relationsQuery = `SELECT
      tc.constraint_name AS CONSTRAINT_NAME,
      tc.table_name AS TABLE_NAME,
      kcu.column_name AS COLUMN_NAME,
      ccu.table_name AS REFERENCED_TABLE_NAME,
      ccu.column_name AS REFERENCED_COLUMN_NAME
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE constraint_type = 'FOREIGN KEY'`;
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
      schemaData.associations.forEach(association => {
        let modelName = utils.camelize(association.table_name);
        let attribute = association.column_name;
        let referencedModelName = utils.camelize(
          association.referenced_table_name
        );

        // let referencedAttribute = association["REFERENCED_COLUMN_NAME"];

        _this.models[modelName].belongsTo(_this.models[referencedModelName], {
          foreignKey: { name: attribute }
        });

        _this.models[referencedModelName].hasMany(_this.models[modelName]);
      });

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
              "Target Model [" +
              assoc.target +
              "] Not found for association " +
              assoc.type +
              " with [" +
              modelDef.name +
              "] model."
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
      if (name !== "pg_stat_statements") {
        results.map(res => {
          attribs[res.column_name] = {
            type: this.typeMap[res.data_type],
            primaryKey: res.column_key &&
              res.column_key.indexOf("nextval") !== -1,
            autoIncrement: (res.column_key && res.column_key.indexOf("nextval") !== -1)
          };
        });
      }
      models[utils.camelize(name)] = this.connection.define(name, attribs);
    });

    // From model files reading
    modelDefs.forEach(modelDef => {
      var attributes = Object.keys(modelDef.object.attributes);

      attributes.forEach(attr => {
        const TYPE = modelDef.object.attributes[attr].type;

        if (TYPE.match(/array/)) {
          const type = TYPE.split("|")[1];

          modelDef.object.attributes[attr].type = this.typeMap["array"](
            this.typeMap[type]
          );
        } else {
          modelDef.object.attributes[attr].type = this.typeMap[
            modelDef.object.attributes[attr].type
          ];
        }
      });

      models[modelDef.name] = this.connection.define(
        modelDef.object.tableName,
        modelDef.object.attributes,
        {
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
module.exports = PSQLDialect;
