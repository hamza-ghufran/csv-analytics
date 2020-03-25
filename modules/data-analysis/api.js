
const async_auto = require('async').auto;
const { countBy, get, omit } = require('lodash')
const async_mapSeries = require('async').mapSeries;

const { mysql } = require('../../utils/knex')
const { ANALYSIS_TABLE } = require('../../utils/constant')
const { arrayToObject } = require('../../utils/helper')

const dataAnalysis = function (data, _cb) {
  let { batch } = data

  async_auto({
    count_data_by_key: (cb) => {
      let new_entries = countBy(batch, 'County')

      return cb(null, {
        new_entries: new_entries
      })
    },
    structure_new_data: ['count_data_by_key', function (result, cb) {
      let new_entries = result.count_data_by_key.new_entries

      let structured_new_entries = Object.keys(new_entries).map((key, index) => {
        return {
          region: key,
          accidents_count: parseInt(new_entries[key])
        }
      })
      return cb(null, {
        new_entries: structured_new_entries
      })
    }],
    fetch_existing_entries_if_exist: ['structure_new_data', function (result, cb) {
      let new_entries = result.structure_new_data.new_entries

      mysql(ANALYSIS_TABLE)
        .select('*')
        .whereIn('region', new_entries.map((entry) => entry.region))
        .then((data) => {
          return cb(null, {
            existing_entries: JSON.parse(JSON.stringify(data))
          })
        })
        .catch(function (err) {
          console.log(err)
          return cb(err)
        });
    }],
    re_evaluate_existing_entries: ['fetch_existing_entries_if_exist', function (result, cb) {
      let existing_entries = result.fetch_existing_entries_if_exist.existing_entries
      if (!existing_entries.length) return cb(null, { existing_entries })

      let new_entries = result.structure_new_data.new_entries
      new_entries = arrayToObject(new_entries, 'region')

      existing_entries.map((entry) => {
        let new_accidents_count = get(new_entries, `[${entry.region}].accidents_count`)
        entry.accidents_count = Number(entry.accidents_count) + Number(new_accidents_count)
      })

      return cb(null, {
        existing_entries: existing_entries
      })
    }],
    update_existing_entries: ['re_evaluate_existing_entries', function (result, cb) {
      let existing_entries = result.re_evaluate_existing_entries.existing_entries
      if (!existing_entries.length) return cb(null)

      async_mapSeries(existing_entries, (entry, callback) => {
        mysql(ANALYSIS_TABLE)
          .where('id', entry.id)
          .update({
            accidents_count: entry.accidents_count,
          })
          .then((data) => {
            return callback(null)
          })
          .catch(function (err) {
            console.log(err)
            return callback(err)
          });
      }, (err, results) => {
        if (err) {
          return cb(err)
        }

        return cb(null, {})
      })
    }],
    omit_existing_entries: ['update_existing_entries', function (result, cb) {
      let existing_entries = result.re_evaluate_existing_entries.existing_entries
      let new_entries = result.structure_new_data.new_entries

      if (!existing_entries.length) return cb(null, {
        new_entries: new_entries
      })

      existing_entries = arrayToObject(existing_entries, 'name')
      new_entries = arrayToObject(new_entries, 'name')

      omited_entries = omit(new_entries, Object.keys(existing_entries))

      return cb(null, {
        new_entries: omited_entries
      })
    }],
    insert_new_entries: ['omit_existing_entries', function (result, cb) {
      let new_entries = result.omit_existing_entries.new_entries

      async_mapSeries(new_entries, (entry, callback) => {
        mysql(ANALYSIS_TABLE)
          .insert({
            region: entry.region,
            accidents_count: entry.accidents_count
          })
          .then((data) => {
            return callback(null, data)
          })
          .catch(function (err) {
            return callback(null)
          });
      }, (err, results) => {
        if (err) return cb(err)

        return cb(null, {
          analysis_generated: 'success'
        })
      })
    }]
  }, function (error, results) {
    if (error) {
      console.log(error)
    }

    return _cb(null, {
      results: results.insert_new_entries
    })
  })
}

module.exports.runAnalysis = dataAnalysis
