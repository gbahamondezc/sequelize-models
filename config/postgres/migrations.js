const path = require('path');

require('dotenv').config({
  path: path.join(path.resolve(), '/env/postgres.env')
});

module.exports = {
  'development': {
    'username': process.env.POSTGRES_USER,
    'password': process.env.POSTGRES_PASSWORD,
    'database': process.env.POSTGRES_DB,
    'host': process.env.LOCAL ? 'localhost' : process.env.POSTGRES_HOST,
    'dialect': 'postgres'
  }
};