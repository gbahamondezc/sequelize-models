"use strict";

const SequelizeModels = require("../../");
const assert   = require("assert");
var config     = require("../config.js");
var seqModels  = new SequelizeModels(config);

describe("Queries tests", function() {

  var dbSchema;

  before( function(done) {
    seqModels.getSchema()
    .then( schema => {
      dbSchema = schema;
      return done();
    })
    .catch( err => {
      return done(err);
    });
  });


  it("Find user by id 1", function(done) {

    dbSchema.models.User.findById(1)
    .then( function(user) {
      assert( user.name === "Gonzalo" );
      done();
    })
    .catch(function(err) {
      return done(err);
    });
  });


  it("Find all profiles with name Technicians including his users", function(done) {
    dbSchema.models.Profile.findAll({
      where : {
        name  : "Technician"
      },
      include : dbSchema.models.User
    })
    .then( profiles => {
      var profile = profiles[0];
      assert(profile.name === "Technician" && profile.users.length === 2);
      return done();
    })
    .catch( err => {
      return done(err);
    });
  });



  it("Find all users with name Gonzalo including his profiles", function(done) {
    dbSchema.models.User.findAll({
      where   : { name : "Gonzalo" },
      include : dbSchema.models.Profile
    })
    .then( users => {
      var user = users[0];
      assert(user.name === "Gonzalo" && user.profile.name === "Technician");
      return done();
    })
    .catch( err => {
      return done(err);
    });
  });
});
