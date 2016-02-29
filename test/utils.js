"use strict";

var assert = require("assert");
var utils  = require("../lib/utils.js");

describe("Camelize return string formated as camel case", function () {
  var expectedString;

  before( function() {
    expectedString = "TestString";
  });

  it("From TestString", function () {
    assert( utils.camelize("TestString") === expectedString);
  });
  it("From testString", function () {
    assert( utils.camelize("testString") === expectedString);
  });

  it("From test_string", function () {
    assert( utils.camelize("test_String") === expectedString);
  });

});



describe("Should filter tables passed as first argument by name or attribs",
  function () {

    it("Ignore common cases by column_name \
      ['updated_at', 'updatedAt','created_at', 'createdAt']", function () {

        var sampleData = [{
          name  : "table1",
          column_name: "updated_at",
        }, {
          name  : "table2",
          column_name: "updatedAt",
        },{
          name  : "table3",
          column_name: "created_at",
        }, {
          name  : "table4",
          column_name: "createdAt",
        }];

        assert( utils.filterTables(sampleData).length === 0 );
    });

     it("Ignore tables with table name 'SequelizeMeta'", function () {

        var sampleData = [{
          name  : "SequelizeMeta",
          column_name: "some_column",
        }];

        assert( utils.filterTables(sampleData).length === 0 );
    });

    it("Ignore tables from given table name exclude array as second argument", function () {

        var sampleData = [{
          name  : "some_table",
          column_name: "some_column",
        },{
          name  : "SequelizeMeta",
          column_name: "some_column",
        },{
          name  : "table4",
          column_name: "createdAt",
        }];

        assert( utils.filterTables( sampleData, ["some_table"]).length === 0 );
    });

})