const { DATA_TABLE, STATUS_TABLE, ANALYSIS_TABLE } = require('../../utils/constant')

exports.seed = knex => {
  return (
    knex.schema
      .dropTableIfExists(DATA_TABLE)
      .dropTableIfExists(STATUS_TABLE)
      .dropTableIfExists(ANALYSIS_TABLE)
      .then(() => {
      })
      .catch((err) => {
        console.log(err)
      })
  )
}