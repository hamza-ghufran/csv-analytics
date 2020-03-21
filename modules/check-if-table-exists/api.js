'use strict'

const { mysql } = require('../../utils/knex')

const checkIfTableExists = (table_name, cb) => { 
  return mysql.schema
    .hasTable(table_name)
    .then((exists) => {
      return cb(null, exists)
    })
    .catch(function (err) {
      console.log(err)
      return cb(err)
    });
}

module.exports.checkIfTableExists = checkIfTableExists