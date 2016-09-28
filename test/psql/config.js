
module.exports = {
  connection : {
    host     : "127.0.0.1",
    dialect  : "postgres",
    username : "postgres",
    schema   : "sequelize_test",
    password : "",
    port     : 5432
  },
  models : {
    autoLoad : true,
    path     : "/test/psql/models"
  },
  sequelizeOptions : {
    define : {
      freezeTableName : true,
      underscored     : true
    },
    logging : false
  }
};
