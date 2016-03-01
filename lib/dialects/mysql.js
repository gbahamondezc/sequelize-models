"use strict";

const debug = require("debug")("sequelize-models:mysql");
const _     = require("lodash");
const co    = require("co");
const utils = require("../utils.js");


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
      varchar  : Sequelize.STRING,
      text     : Sequelize.TEXT,
      int      : Sequelize.INTEGER,
      datetime : Sequelize.DATE,
      decimal  : Sequelize.DECIMAL,
      string   : Sequelize.STRING,
      date     : Sequelize.DATE,
      interger : Sequelize.INTEGER
    };

    /** Sequelize connected instance */
    this.connection = connection;

    /** MySQL query to get all table information */
    this.tablesQuery = "SELECT table_name as name, column_name, \
      data_type, column_key, extra  FROM \
      INFORMATION_SCHEMA.COLUMNS  WHERE TABLE_SCHEMA = ?";


    /** MySql query to get all relation information */
    this.relationsQuery = "SELECT * FROM INFORMATION_SCHEMA.key_column_usage \
      WHERE referenced_table_schema = ?";
  }



  /**
   * Fetch data of tables, relations, and attributes from MySQL Schema.
   * @return {Promise} a promise that will be resolved when all data is  fetched.
   */

  loadModels( modelDefs, opts ) {

    debug("loadModels %o", opts);

    var _this = this;

    return co( function *() {

      var yieldable = {
        tables       : [],
        associations : []
      };

      if (opts.autoLoad) {
        yieldable.tables = _this.connection.query( _this.tablesQuery, {
          replacements : [ _this.config.schema ],
          type         : _this.connection.QueryTypes.SELECT
        });
      }

      if (opts.autoAssoc) {
        yieldable.associations  = _this.connection.query( _this.relationsQuery, {
          replacements : [ _this.config.schema ],
          type         : _this.connection.QueryTypes.SELECT
        });
      }

      var schemaData = yield yieldable;


      /** Get schema tables and relations in parallel */

      // console.log("model defs yeah --> ", JSON.stringify(modelDefs.attributes, null, 4));
      _this.models = _this.getModels( schemaData.tables, modelDefs );

      // console.log("this models -->", _this.models);

      // console.log("shcema data -->", schemaData);

      // associations from schema
      schemaData.associations.forEach( association => {

        let modelName = utils.camelize( association.TABLE_NAME);
        let attribute = association.COLUMN_NAME;
        let referencedModelName = utils.camelize(
          association.REFERENCED_TABLE_NAME
        );

        // let referencedAttribute = association["REFERENCED_COLUMN_NAME"];

        _this.models[ modelName ].belongsTo(_this.models[ referencedModelName ], {
          foreignKey : { name : attribute }
        });

        _this.models[ referencedModelName ].hasMany(
          _this.models[ modelName ]
        );

      });

      // Associations from model file
      // console.log("model defs --> ", modelDefs);
      modelDefs.forEach( modelDef => {

        if (!modelDef.object.associations) {
          return;
        }

        modelDef.object.associations.forEach( assoc => {

          var mainModel =  _this.models[ modelDef.name ];
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

          _this.models[ modelDef.name ][ assoc.type ](
            _this.models[ assoc.target ],
            assoc.options
          );

        });
      });

      // console.log("tis models --> ", _this.models);
      return _this.models;
    });
  }


  /**
   * Build and return Sequelize Models instances from MySQL Database
   * @return {Object} a  object with each model wich represent a database table (key name)
   */

  getModels( tables, modelDefs ) {

    debug("getModels");
    var excludeTables = _.map( modelDefs, "object.tableName" );
    tables = utils.filterTables( tables, excludeTables );

    let tableNames = _.uniq( _.map( tables, "name" ));
    let models     = {};

    // Direct from database schema
    tableNames.map( name => {

      let results = _.filter( tables, { name : name });
      let attribs = {};

      results.map( res => {

        // console.log("data type -->", res.data_type);
        // console.log("type parsed -->", this.typeMap[ res.data_type ]);
        // Parsing attributes

        // console.log("table name --> ", name);
        // console.log("table attrs--> ", {
        //   type          : this.typeMap[ res.data_type ],
        //   primaryKey    : (res.column_key === "PRI"),
        //   autoIncrement : (res.extra === "auto_increment")
        // });

        attribs[ res.column_name ] = {
          type          : this.typeMap[ res.data_type ],
          primaryKey    : (res.column_key === "PRI"),
          autoIncrement : (res.extra === "auto_increment")
        };
      });

      // console.log("attribs ", attribs);
      models[ utils.camelize(name) ] = this.connection.define(
        name, attribs
      );
    });



    // From model files reading
    modelDefs.forEach( modelDef => {

      // console.log("attributes ", modelDef.object.attributes);
      var attributes = Object.keys( modelDef.object.attributes );

      attributes.forEach( attr => {

        // console.log("which attr? ", attr);
        // console.log("attr type -->", modelDef.object.attributes[ attr ].type);

        modelDef.object.attributes[ attr ].type =
          this.typeMap[ modelDef.object.attributes[ attr ].type ];
      });

      models[ modelDef.name ] = this.connection.define(
        modelDef.object.tableName,
        modelDef.object.attributes, {
          validate : modelDef.object.validate || {},
          indexes  : modelDef.object.indexes  || {}
        }
      );
    });

    return models;
  }

}


/** Expose class */
module.exports = MySQLDialect;
