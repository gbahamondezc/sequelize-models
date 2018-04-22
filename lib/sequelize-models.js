"use strict";

const debug = require("debug")("sequelize-models");
const Sequelize = require("sequelize");
const _ = require("lodash");
const path = require("path");
const co = require("co");
const Promise = require("bluebird");

const utils = require("./utils.js");
const fs = require("fs");

const readdir = Promise.promisify(
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
   * @param {Object} opts.connection - database  connections params
   * @param {Srtring} opts.connection.host - hostname or ipadress of the server runing database instance
   * @param {Srtring} opts.connection.dialect - dialect of database engine to use
   * @param {Srtring} opts.connection.username - username to connect with the database instance
   * @param {Srtring} opts.connection.password - password to connect with the database instance
   * @param {Srtring} opts.connection.schema - database schema name to use with the connection
   * @param {Srtring} opts.connection.port - database instance server running port default 3306
   * @param {Object} opts.models - options to models definition
   * @param {String} opts.models.path - path to read the model definitions
   * @param {Boolean} opts.models.autoLoad - enable or disable autoloading models from database
   * @param {Object} opts.sequelizeOptions - parameters that will be passed directly to Sequelize
   * constructor
   */

  constructor(opts) {

    debug("constructor %o", opts);
    this.opts = opts || {};

    if (!this.opts.connection.port) {
      this.opts.connection.port = 3306;
    }
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
    if (undefined === this.opts.connection.password) {
      throw new Error("Connection password is required");
    }
    if (!this.opts.connection.schema) {
      throw new Error("Connection schema name is required");
    }
    if ("mysql" !== this.opts.connection.dialect.toLowerCase() &&
      "postgres" !== this.opts.connection.dialect.toLowerCase()) {
      throw new Error("Only MySQL and PSQL dialects are supported");
    }
  }


  /**
   * Get Sequelize Database instance passing all args in this.opts.sequelizeOptions
   * @return {Object} a sequelize instance already connected to database.
   */

  getSequelizeInstance() {

    debug("getSequelizeInstance");

    var dbOptions = {
      host: this.opts.connection.host,
      dialect: this.opts.connection.dialect,
      port: this.opts.connection.port
    };

    
    // Default pool configuration
    dbOptions.pool = {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    };

    var sequelizeOptions = _.extend(
      this.opts.sequelizeOptions,
      dbOptions
    );

    sequelizeOptions.operatorsAliases = false;

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

    if (!this.opts.models || !this.opts.models.path) {
      return Promise.resolve(modelsDefs);
    }


    var modelsDirectory = path.join(path.resolve(), this.opts.models.path);

    try {
      fs.accessSync(modelsDirectory, fs.F_OK);
    } catch (e) {
      return Promise.resolve(modelsDefs);
    }

    return new Promise(resolve => {
      readdir(modelsDirectory, {
        recursive: false,
        return: "fullPaths",
        filter: {
          file: /\.(js)$/i
        }
      })
        .then(files => {
          modelsDefs = files.map(file => {
            return {
              name: utils.camelize(path.basename(/^(.+?).js$/.exec(file)[1])),
              object: require(file)
            };
          });

          return resolve(modelsDefs);
        });
    });
  }


  /**
   * Get Sequelize model definitions ready.
   * @return {Promise} get all models from the database schema
   */

  getSchema() {

    debug("getSchema");

    var _this = this;

    let dialectPath = path.join(
      __dirname, "dialects",
      this.opts.connection.dialect
    );

    let Dialect = require(dialectPath);
    let dbInstance = this.getSequelizeInstance();

    let dialect = new Dialect(
      Sequelize, dbInstance,
      this.opts.connection
    );

    return co(function* () {

      let modelDefs = yield _this.getModelDefinitions();
      let autoload = true;

      if (false === _this.opts.models.autoLoad) {
        autoload = false;
      }

      debug("options passed to load models");

      let models = yield dialect.loadModels(modelDefs, autoload);

      return {
        models: models,
        db: dbInstance
      };

    });
  }

}

module.exports = SequelizeModels;
