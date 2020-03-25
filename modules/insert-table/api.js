'use strict'

const { cloneDeep } = require('lodash');
const async_auto = require('async').auto;
const async_queue = require('async').queue;

const mysql = require('../../utils/knex').mysql
const CSVReader = require('../../utils/csvParser')
const CSV_FILE_PATH = './utils/US_Accidents_Dec19.csv'
const runAnalysis = require('../data-analysis/api').runAnalysis

var log_id = 0
const log = require('../../utils/logger').log
const { MAX_WORKERS, DATA_TABLE, STATUS_TABLE } = require('../../utils/constant')

const insertIntoTable = function (data, _cb) {
  let { batch_size, offset } = data;

  const parser = new CSVReader({
    cb: _cb,
    offset: offset,
    batch_size: batch_size,
    file_path: CSV_FILE_PATH,
  })

  let insert_queue = async_queue(function (parsed_data, next) {
    insert(parsed_data, (err, results) => {
      if (err) {
        return _cb(err.stack)
      }
      next()
    })
  }, MAX_WORKERS)

  let analysis_queue = async_queue(function (parsed_data, next) {
    runAnalysis(parsed_data, (err, results) => {
      if (err) {
        return _cb(err.stack)
      }
      next()
    })
  }, 1)

  parser.read((batch) => {
    const dataObj = {
      batch: cloneDeep(batch),
    }

    /**
     *  To insert data into table A & B
     *  4 processes run in parallel
     */
    insert_queue.push(dataObj)

    /**
     * Inserts data into table C
     * Performs operation on the table in a sync manner, 
     * with only one process running at a time
     * [TODO] fix memory issue.
     * temporary fix : run app with --max_old_space_size=4096
     */
    analysis_queue.push(dataObj)
  })
}

const insert = function (data, _cb) {
  let { batch } = data

  async_auto({
    insert_into_data_table: (cb) => {
      mysql
        .batchInsert(DATA_TABLE, batch, batch.length)
        .then(() => {

          return cb(null, {
            ab_batch_size: batch.length,
            batch_last_item_index: batch[batch.length - 1] && batch[batch.length - 1]['ID']
          })
        })
        .catch(function (err) {
          return cb(err)
        });
    },
    insert_into_status_table: ['insert_into_data_table', function (result, cb) {
      let { batch_last_item_index, ab_batch_size } = result.insert_into_data_table

      mysql(STATUS_TABLE)
        .insert({
          batch_size: ab_batch_size,
          status: 'success',
          completed_at: batch_last_item_index
        })
        .then(() => {

          // To show progress on cli
          log.push({ '------': ++log_id }, { status: 'success' }, { batch_size: ab_batch_size }, { completed_at: batch_last_item_index })
          console.log(log.toString())
          log.length = 0

          return cb(null, true)
        })
        .catch(function (err) {
          // return cb(err.stack)
          return cb(null)
        });
    }]
  }, function (error, results) {
    if (error) return _cb(error)

    return _cb(null, {
      results
    })
  })
}

module.exports.insertIntoTable = insertIntoTable
