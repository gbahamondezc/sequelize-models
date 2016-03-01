"use strict";

module.exports = {
  up: function (queryInterface, Sequelize, done) {
    queryInterface.sequelize.query(
      "INSERT INTO profile (name, created_at, updated_at) \
      VALUES \
      (\"Administrator\", NOW(), NOW()), \
      (\"User\", NOW(), NOW()), \
      (\"Guest\", NOW(), NOW()), \
      (\"Technician\", NOW(), NOW());"
    )

    .then( function() {
      return queryInterface.sequelize.query(
        "INSERT INTO department (name, created_at, updated_at) \
        VALUES \
        (\"Administration\", NOW(), NOW()), \
        (\"Suport\", NOW(), NOW()), \
        (\"RRHH\", NOW(), NOW());"
      );
    })

    .then( function() {
      return queryInterface.sequelize.query(
        "INSERT INTO user (name, last_name, born_date, profile_id, created_at, updated_at) \
        VALUES \
        (\"Gonzalo\", \"Bahamondez\", NOW(), 4, NOW(), NOW()), \
        (\"Alexis\", \"Saez\", NOW(), 1, NOW(), NOW()), \
        (\"Diego\", \"Gutierrez\", NOW(), 4, NOW(), NOW()), \
        (\"Javier\", \"Huerta\", NOW(), 2, NOW(), NOW()), \
        (\"Diego\", \"Paredes\", NOW(), 3, NOW(), NOW());"
      );
    })

    .then( function() {
      return queryInterface.sequelize.query(
        "INSERT INTO user_department (department_id, user_id , created_at, updated_at) \
        VALUES \
        (1, 2, NOW(), NOW()), \
        (2, 1, NOW(), NOW()), \
        (2, 3, NOW(), NOW()), \
        (3, 4, NOW(), NOW());"
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
