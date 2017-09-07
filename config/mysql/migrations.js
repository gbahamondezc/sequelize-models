const path = require('path');

require('dotenv').config({
  path: path.join(path.resolve(), '/env/mysql.env')
});

module.exports = {
  'development': {
    'username': process.env.MYSQL_USER,
    'password': process.env.MYSQL_PASSWORD,
    'database': process.env.MYSQL_DATABASE,
    'host': process.env.LOCAL ? 'localhost' : process.env.MYSQL_HOST,
    'dialect': 'mysql'
  }
};