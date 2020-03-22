'use strict'

const async_auto = require('async').auto;
const async_queue = require('async').queue;
const mysql = require('../../utils/knex').mysql;

const CSVReader = require('../../utils/csvParser')
const CSV_FILE_PATH = './utils/US_Accidents_Dec19.csv'

var log_id = 0
const log = require('../../utils/logger').log
const _cloneDeep = require('lodash.clonedeep');
const { MAX_WORKERS, DATA_TABLE, STATUS_TABLE } = require('../../utils/constant')

const insertIntoTable = function (data, callback) {
  let { batch_size, offset } = data;

  const parser = new CSVReader({
    cb: callback,
    offset: offset,
    batch_size: batch_size,
    file_path: CSV_FILE_PATH,
  })


  let queue = async_queue(function (parsed_data, next) {
    insert(parsed_data, (err, results) => {
      if (err) {
        return callback(err.stack)
      }
      next(results)
    })
  }, MAX_WORKERS)


  parser.read((batch) => {
    const dataObj = {
      batch: _cloneDeep(batch),
    }

    queue.push(dataObj, (results) => {
      // console.log(results)
    })
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
