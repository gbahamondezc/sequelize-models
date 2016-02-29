"use strict";

const debug     = require("debug")("sequelize-models");
const Sequelize = require("sequelize");
const _         = require("lodash");
const path      = require("path");
const co        = require("co");
const Promise   = require("bluebird");

const readdir   = Promise.promisify(
  require("readdir-plus")
);


/**
 * SequelizeModels
 */

class SequelizeModels {

  /**
   * SequelizeModels constructor.
   * @constructor
   * @param {Object} opts - configuration options
   * @param {Object} opts.database - all database params
   * @param {Object} opts.sequelizeOptions - parameters that will be passed directly to sequelize
   * constructor
   */

  constructor(opts) {

    debug("constructor %o", opts);

    this.opts = opts || {};

    if (!this.opts.connection) {
      throw new Error("Connection configuration is required");
    }
    if (!this.opts.connection.host) {
      throw new Error("Connection host is required");
    }
    if (!this.opts.connection.dialect) {
      throw new Error("Connection dialect is required");
    }
    if (!this.opts.connection.username) {
      throw new Error("Connection username is required");
    }
    if (this.opts.connection.password === undefined) {
      throw new Error("Connection password is required");
    }
    if (!this.opts.connection.schema) {
      throw new Error("Connection schema name is required");
    }
    if (this.opts.connection.dialect.toLowerCase() !== "mysql") {
      throw new Error("Only MySQL is supported for now");
    }
  }


  /**
   * Get Sequelize Database instance
   * @return {Object} a sequelize instance already connected to database.
   */

  getSequelizeInstance() {

    debug("getSequelizeInstance");

    var dbOptions = {
      host    : this.opts.connection.host,
      dialect : this.opts.connection.dialect,
      logging : false
    };

    var sequelizeOptions = _.merge(
      this.opts.sequelizeOptions,
      dbOptions
    );

    return new Sequelize(
      this.opts.connection.schema,
      this.opts.connection.username,
      this.opts.connection.password,
      sequelizeOptions
    );
  }


  /**
   * Read and load models definition from directory
   * @return {Promise} a priise wich will be resolved with all models defs
   */

  getModelDefinitions() {

    debug("getModelDefinitions");

    var modelsDefs = [];

    if (!this.opts.models || !this.opts.models.defineFrom) {
      return Promise.resolve( modelsDefs );
    }

    return new Promise( resolve => {
      readdir( this.opts.models.defineFrom, {
        recursive : this.opts.models.recursiveLoad || false,
        return    : "fullPaths",
        filter    : {
          file  : /\.(js)$/i
        }
      })
      .then( files => {
        modelsDefs = files.map( file => {
          return {
            name   : path.basename(/^(.+?).js$/.exec(file)),
            object : require( file )
          };
        });
        return resolve( modelsDefs );
      })
      .catch( err => {
        throw err;
      });
    });
  }


  /**
   * Get Models
   * @return {Promise} get all models from the database schema
   */

  getSchema() {

    debug("getSchema");

    var _this = this;

    let dialectPath = path.join(
      __dirname, "dialects",
      this.opts.connection.dialect
    );

    let Dialect     = require( dialectPath );
    let dbInstance  = this.getSequelizeInstance();

    let dialect = new Dialect(
      Sequelize, dbInstance,
      this.opts.connection
    );

    return co( function *() {

      let modelDefs = yield _this.getModelDefinitions();
      let options   = {};

      // Default autoload and autoassoc if options are not passed
      options.autoLoad = (_this.opts.models && _this.opts.models.autoLoad !== undefined) ?
        _this.opts.models.autoLoad : true;

      options.autoAssoc = (_this.opts.models && _this.opts.models.autoAssoc !== undefined) ?
        _this.opts.models.autoAssoc : true;

      debug("options passed to load models %o", options);

      let models    = yield dialect.loadModels( modelDefs, options);

      return {
        models : models,
        db     : dbInstance
      };

    });
  }

}

module.exports = SequelizeModels;
