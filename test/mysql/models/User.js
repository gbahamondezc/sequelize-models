module.exports = {

  // Following http://docs.sequelizejs.com/en/latest/docs/models-definition/
  tableName : "user",

  attributes : {
    name : {
      type : "string"
    },
    last_name : {
      type : "string"
    },
    born_date : {
      type : "date"
    }
  },


  // Associations -> http://docs.sequelizejs.com/en/latest/docs/scopes/#associations
  associations : [{
    type    : "belongsTo",
    target  : "Profile",
    options : {
      foreignKey : "profile_id"
    }
  }],

  validate : {},
  indexes  : []
};
