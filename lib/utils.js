"use strict";

var _ = require("lodash");

module.exports = {

  filterTables : function(tables, exclude) {
    let exNames   = ["SequelizeMeta"].concat(exclude);

    let exColumns = [
      "updatedAt", "updated_at",
      "createdAt", "created_at"
    ];

    _.remove(tables, table => {
      return  _.includes(exColumns, table.column_name) ||
        _.includes(exNames, table.name);
    });

    return tables;
  },


  /**
   * Camelize given string str
   * @param {String} str string to be camelized
   * @return {String} camilized version of given string
   */

  camelize : function(str) {
    return str.replace(/(?:^|[-_])(\w)/g, (_, c) => {
      return c ? c.toUpperCase() : "";
    });
  }

};
