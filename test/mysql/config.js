module.exports = {
  connection: {
    host: "127.0.0.1",
    dialect: "mysql",
    username: "root",
    schema: "sequelize_models_db",
    password: "",
    port: 3308
  },
  models: {
    autoLoad: true,
    path: "/test/mysql/models"
  },
  sequelizeOptions: {
    define: {
      freezeTableName: true,
      underscored: true
    },
    logging: false
  }
};
