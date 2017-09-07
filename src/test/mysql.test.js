const test = require('ava');
const path = require('path');

require('dotenv').config({
  path: path.join(path.resolve(), '/env/mysql.env')
});

const SequelizeModels = require('../sequelize-models');

test('Some mysql fake test', async t => {

  let sequelizeModels = new SequelizeModels({
    connection: {
      host     : process.env.MYSQL_HOST,
      dialect  : 'mysql',
      username : process.env.MYSQL_USER,
      schema   : process.env.MYSQL_DATABASE,
      password : process.env.MYSQL_PASSWORD
    }
  });

  let tables = await sequelizeModels.getSchema();

  console.info(tables);

  t.pass();


});