'use strict'

const async = require('async')
const mysql = require('../../utils/knex').mysql
const { checkIfTableExists } = require('../check-if-table-exists/api')

const createTable = function (data, _cb) {
  let { table_name, table_headers } = data

  async.auto({
    check_table_if_exist: (cb) => {
      checkIfTableExists(table_name, (err, exists) => {
        if (exists) {
          return cb(null, true)
        } else cb(null, false)
      })
    },
    create_new_table: ['check_table_if_exist', function (result, cb) {
      let table_exist = result.check_table_if_exist

      if (table_exist) {
        return cb(null, { table_headers })
      }

      mysql.schema
        .createTable(table_name, (table) => {
          table_headers.forEach((col_name) => {
            if (col_name == 'id') {
              table.increments('id')
                .primary()
              return
            }

            table.text(col_name)
          })
        })
        .then(data => {
          return cb(null, { table_headers })
        })
        .catch(err => {
          return cb(err)
        })
    }]
  }, function (error, results) {
    if (error) return _cb(error)

    return _cb(null, {
      results: results.create_new_table.table_headers
    })
  })
}

module.exports.createTable = createTable
