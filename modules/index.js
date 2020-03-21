module.exports = {
  createTable: require('./create-table/api').createTable,
  checkIfTableExists: require('./check-if-table-exists/api').checkIfTableExists,
  fetchCount: require('./fetch-count/api').fetchCount,
  insertIntoTable: require('./insert-table/api').insertIntoTable,
}