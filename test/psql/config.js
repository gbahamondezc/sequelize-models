
module.exports = {
  connection: {
    host: "127.0.0.1",
    dialect: "postgres",
    username: "sequelize_models_db_user",
    schema: "sequelize_models_db",
    password: "",
    port: 5432
  },
  models: {
    autoLoad: true,
    path: "/test/psql/models"
  },
  sequelizeOptions: {
    define: {
      freezeTableName: true,
      underscored: true
    },
    logging: false
  }
};
