"use strict";

var _ = require("lodash");

/**
 * Filter tables by column or table name
 * @param  {Array} - array of tables + column from database
 * @return {Array} - Array of strings with Table Names to be excluded.
 */

module.exports = {

  filterTables: function (tables, exclude) {
    let exNames = ["SequelizeMeta"].concat(exclude);

    let exColumns = [
      "updatedAt", "updated_at",
      "createdAt", "created_at"
    ];

    _.remove(tables, table => {
      return _.includes(exColumns, table.column_name) ||
        _.includes(exNames, table.name);
    });

    return tables;
  },


  /**
   * Camelize given string str
   * @param {String} str string to be camelized
   * @return {String} camilized version of given string
   */

  camelize: function (str) {
    // console.log("to camelize ", str);
    return str.replace(/(?:^|[-_])(\w)/g, (_, c) => {
      return c ? c.toUpperCase() : "";
    });
  }

};
