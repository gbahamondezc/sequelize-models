const test = require('ava');
const path = require('path');

require('dotenv').config({
  path: path.join(path.resolve(), '/env/postgres.env')
});

const SequelizeModels = require('../sequelize-models');

test.skip('Some postgres fake test', async t => {

  let sequelizeModels = new SequelizeModels({
    connection: {
      host     : process.env.POSTGRES_HOST,
      dialect  : 'postgres',
      username : process.env.POSTGRES_USER,
      schema   : process.env.POSTGRES_DB,
      password: process.env.POSTGRES_PASSWORD,
      port : 5432
    }
  });

  let tables = await sequelizeModels.getSchema();

  console.info(tables);

  t.pass();

});