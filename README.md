# sequelize-models  [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage Status](https://coveralls.io/repos/github/gbahamondez/sequelize-models/badge.svg?branch=master)](https://coveralls.io/github/gbahamondez/sequelize-models?branch=master)

Node.js SequelizeJS ORM model utilities



### Warning
**Node.js 4.0** or latest is required  to use this module.

### Installation

```sh
$ npm install --save sequelize-models
```

### Features

* Auto load of Sequelize models from database schema.
* Auto load models associations from database schema.
* Simplified and meaningful model files syntax.
* One place models and associations definitions.
* MySQL support only for now (support for PostgreSQL and MSSQL as soon as possible!).


### Usage

```js

const SequelizeModels = require("sequelize-models");

var seqModels  = new SequelizeModels({
  // Database connection options
  "connection" : {
    "host"     : "127.0.0.1",
    "dialect"  : "mysql",
    "username" : "root",
    "schema"   : "sequelize_test",
    "password" : ""
  },

  // Models loading options
  "models" : {
    "autoLoad"          : true,
    "autoAssoc"         : true,
    "defineFrom"        : "./models"
  },

  // Sequelize options passed directly to Sequelize constructor
  "sequelizeOptions" : {
    "define" : {
      "freezeTableName" : true,
      "underscored"     : true
    }
  }
});


seqModels.getSchema().then( schema => {

  // schema.models && schema.db available here
})
.catch( err => {
  // throwing error out of the promise
  setTimeout( () => { throw err });
});
```


### Build and open code documentation
```bash
$ npm install -g gulp && gulp docs
```

### Run Tests
You need  edit **examples/config.json** with your own database connection params, before run the steps below.

```bash
$ npm install gulp -g && npm install -g sequelize-cli
$ gulp config
$ cd examples/mysql
$ sequelize db:migrate
$ npm test
```


## License

MIT © [Gonzalo Bahamondez](https://github.com/gbahamondez)


[travis-image]: https://travis-ci.org/gbahamondez/sequelize-models.svg?branch=master
[travis-url]: https://travis-ci.org/gbahamondez/sequelize-models
[daviddm-image]: https://david-dm.org/gbahamondez/sequelize-models.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/gbahamondez/sequelize-models
[coveralls-image]: https://coveralls.io/repos/gbahamondez/sequelize-models/badge.svg
[coveralls-url]: https://coveralls.io/r/gbahamondez/sequelize-models