module.exports = {
  fetchCount: require('./fetch-count/api').fetchCount,
  createTable: require('./create-table/api').createTable,
  runAnalysis: require('./data-analysis/api').dataAnalysis,
  insertIntoTable: require('./insert-table/api').insertIntoTable,
  checkIfTableExists: require('./check-if-table-exists/api').checkIfTableExists,
}