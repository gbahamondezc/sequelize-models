"use strict";

module.exports = {
  up: function (queryInterface, Types, done) {

    // Create table profile
    queryInterface.createTable("profile", {
      id : {
        type          : Types.INTEGER,
        primaryKey    : true,
        autoIncrement : true
      },
      name : {
        type : Types.STRING
      },
      created_at: {
        type : Types.DATE
      },
      updated_at: {
        type : Types.DATE
      }
    })
    .then( function() {
      // create table department
      return queryInterface.createTable("department", {
        id: {
          type          : Types.INTEGER,
          primaryKey    : true,
          autoIncrement : true
        },
        name: {
          type: Types.STRING
        },
        created_at: {
          type: Types.DATE
        },
        updated_at: {
          type: Types.DATE
        }
      });

    })
    .then( function() {
      // Create table user
      return queryInterface.createTable("user", {
        id: {
          type          : Types.INTEGER,
          primaryKey    : true,
          autoIncrement : true
        },
        name: {
          type: Types.STRING
        },
        last_name: {
          type: Types.STRING
        },
        born_date: {
          type: Types.DATE
        },
        profile_id: {
          type: Types.INTEGER,
          references: {
            model : "profile",
            key   : "id"
          },
          onUpdate : "cascade",
          onDelete : "restrict"
        },
        created_at: {
          type: Types.DATE
        },
        updated_at: {
          type: Types.DATE
        }
      });

    })
    .then( function() {
      // Create table user_department
      return queryInterface.createTable("user_department", {
        id: {
          type          : Types.INTEGER,
          primaryKey    : true,
          autoIncrement : true
        },
        department_id: {
          type : Types.INTEGER,
          references: {
            model : "department",
            key   : "id"
          },
          onUpdate : "cascade",
          onDelete : "restrict"
        },
        user_id : {
          type : Types.INTEGER,
          references : {
            model : "user",
            key   : "id"
          },
          onUpdate : "cascade",
          onDelete : "restrict"
        },
        created_at : {
          type : Types.DATE
        },
        updated_at: {
          type: Types.DATE
        }
      });
    })
    .then( function() {
      return done();
    });
  },

  // Revert tables creation
  down: function(queryInterface) {
    return queryInterface.dropAllTables();
  }

};
