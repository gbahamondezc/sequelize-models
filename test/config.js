module.exports = {
  connection : {
    host     : "127.0.0.1",
    dialect  : "mysql",
    username : "root",
    schema   : "sequelize_test",
    password : ""
  },
  models : {
    autoLoad          : true,
    autoAssoc         : true,
    recursiveLoad     : false,
    defineFrom        : "/test/mysql/models"
  },
  sequelizeOptions : {
    define : {
      freezeTableName : true,
      underscored     : true
    }
  }
};
