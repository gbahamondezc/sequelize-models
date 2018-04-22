# sequelize-models
[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage Status](https://coveralls.io/repos/github/gbahamondezc/sequelize-models/badge.svg?branch=master)](https://coveralls.io/github/gbahamondezc/sequelize-models?branch=master) [![bitHound Code](https://www.bithound.io/github/gbahamondezc/sequelize-models/badges/code.svg)](https://www.bithound.io/github/gbahamondezc/sequelize-models)

Node.js SequelizeJS ORM model utilities.

sequelize-models will try to load all your database tables and associations as Sequelize JS models automatically, but if you want define your models explicitly, just need to create a model file and sequelize-models will skip the models automatic definition for that table and will use your model file, use models.path to specify the models directory to read.


### Warnings
**Node.js 4.0** or latest is required  to use this module.

**Sequelize Models Version 1.4.0** uses SequelizeJS **4.37.x which is the current stable version**

sequelize-models is a bit old project, and i'm planning rewrite from scratch to use the latest language features, feel free to suggest features creating a issue with the respective description.



### Installation

```sh
$ npm install --save sequelize-models

# MySQL
$ npm install --save mysql2

# PostgreSQL
$ npm install --save pg
$ npm install --save pg-hstore
```

### Features

* Auto load of Sequelize models from database schema.

* Auto load models associations from database schema.

* Simplified and meaningful model files syntax.

* One place models and associations definitions.

* MySQL and PSQL support for now (support for MSSQL as soon as possible).


### Usage

Config and get schema

```js

const SequelizeModels = require("sequelize-models");

var seqModels  = new SequelizeModels({
  // Database connection options
  connection : {
    host     : "127.0.0.1",
    dialect  : "mysql",
    username : "root",
    schema   : "sequelize_test",
    password : ""
  },

  // Models loading options
  models : {
    autoLoad : true,
    path     : "/models"
  },

  // Sequelize options passed directly to Sequelize constructor
  sequelizeOptions : {
    define : {
      freezeTableName : true,
      underscored     : true
    }
  }
});


seqModels.getSchema().then( schema => {
  // schema.models and schema.db available here
})
.catch( err => {
  // throwing error out of the promise
  setTimeout( () => { throw err });
});
```

Model Definition , file **models/User.js**

```js
module.exports = {

  // Following http://docs.sequelizejs.com/en/latest/docs/models-definition/
  tableName : "user",

  attributes : {
    name : {
      type : "string"
    },
    last_name : {
      type : "string"
    },
    born_date : {
      type : "date"
    }
  },


  // Associations -> http://docs.sequelizejs.com/en/latest/docs/scopes/#associations
  associations : [{
    type    : "belongsTo",
    target  : "Profile",
    options : {
      foreignKey : "profile_id"
    }
  }],

  validate : {},
  indexes  : []
};
```


### Contributing
Feel free to submit a PR or create an issue for any bug fixes or feature requests, just remember if you add new features or fix a bug, **please provide the respective tests for the case**.


### Build and open code documentation
```bash
$ npm install -g gulp && gulp docs
```


### Run Tests
You need  edit **test/mysql/config.js** and **test/psql/config.js** with your own databases connection params, before run the steps below which are assuming that you will create a database with the name sequelize_test on each database.

```bash
$ npm install gulp -g && npm install

# Create and start development docker databases (needs docker  & docker-compose installed)
$ npm run db:up

# create mysql config files
$ gulp config-mysql

# test data for mysql
$ ./node_modules/sequelize-cli/bin/sequelize db:migrate

# create psql config files
$ gulp config-psql

# test data for postgres
$ ./node_modules/sequelize-cli/bin/sequelize db:migrate

# run test
$ gulp test
```


## License
MIT

[npm-image]: https://badge.fury.io/js/sequelize-models.svg
[npm-url]: https://npmjs.org/package/sequelize-models
[travis-image]: https://travis-ci.org/gbahamondezc/sequelize-models.svg?branch=master
[travis-url]: https://travis-ci.org/gbahamondezc/sequelize-models
[daviddm-image]: https://david-dm.org/gbahamondezc/sequelize-models.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/gbahamondezc/sequelize-models
[coveralls-image]: https://coveralls.io/repos/gbahamondezc/sequelize-models/badge.svg
[coveralls-url]: https://coveralls.io/r/gbahamondezc/sequelize-models
