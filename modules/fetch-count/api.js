'use strict'

const { mysql } = require('../../utils/knex')

const fetchCount = function (data, _cb) {
  let { table_name } = data

  let query = mysql(table_name)
    .sum('batch_size')

  // if (data.status === 'completed') {
  //   query.where(`${query.status}`, data.status)
  // }
  // .orderBy('id', 'desc')
  // .first('id', 'completed_at')

  query
    .then((row) => {
      return _cb(null, row[0]['sum(`batch_size`)'])
    })
    .catch((error) => {
      console.log(error)
      return _cb({ code: 'DB_FETCH_ERROR' })
    })
}

module.exports.fetchCount = fetchCount