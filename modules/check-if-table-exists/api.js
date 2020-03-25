'use strict'

const { mysql } = require('../../utils/knex')

const checkIfTableExists = (table_name, _cb) => {
  return mysql.schema
    .hasTable(table_name)
    .then((exists) => {
      return _cb(null, exists)
    })
    .catch(function (err) {
      console.log(err)
      return _cb(err)
    });
}

module.exports.checkIfTableExists = checkIfTableExists