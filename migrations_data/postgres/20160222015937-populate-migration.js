"use strict";

module.exports = {
  up: function (queryInterface, Sequelize, done) {
    queryInterface.sequelize.query(
      "INSERT INTO profile (\"name\", \"created_at\", \"updated_at\") \
      VALUES \
      ('Administrator', now(), now()), \
      ('User', now(), now()), \
      ('Guest', now(), now()), \
      ('Technician', now(), now());"
    )

    .then( function() {
      return queryInterface.sequelize.query(
        "INSERT INTO department (\"name\", \"created_at\", \"updated_at\") \
        VALUES \
        ('Administration', now(), now()), \
        ('Suport', now(), now()), \
        ('RRHH', now(), now());"
      );
    })

    .then( function() {
      return queryInterface.sequelize.query(
        "INSERT INTO \"user\" (\"name\", \"last_name\", \"born_date\", \"profile_id\", \"created_at\", \"updated_at\") \
        VALUES \
        ('Gonzalo', 'Bahamondez', now(), 4, now(), now()), \
        ('Alexis', 'Saez', now(), 1, now(), now()), \
        ('Diego', 'Gutierrez', now(), 4, now(), now()), \
        ('Javier', 'Huerta', now(), 2, now(), now()), \
        ('Diego', 'Paredes', now(), 3, now(), now());"
      );
    })

    .then( function() {
      return queryInterface.sequelize.query(
        "INSERT INTO user_department (\"department_id\", \"user_id\" , \"created_at\", \"updated_at\") \
        VALUES \
        (1, 2, now(), now()), \
        (2, 1, now(), now()), \
        (2, 3, now(), now()), \
        (3, 4, now(), now());"
      );
    })
    .then( function() {
      done();
    });
  },
  down: function (queryInterface, Sequelize, done) {

    // Truncate all tables
    queryInterface.sequelize.query("TRUNCATE TABLE user_department")
    .then( function() {
      return queryInterface.sequelize
        .query("TRUNCATE TABLE department");
    })
    .then( function() {
      return queryInterface.sequelize
        .query("TRUNCATE TABLE user");
    })
    .then( function() {
      return queryInterface.sequelize
        .query("TRUNCATE TABLE profile");
    })
    .then( function() {
      done();
    });
  }
};
