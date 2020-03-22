'use strict'

const async_auto = require('async').auto;
const async_queue = require('async').queue;
const mysql = require('../../utils/knex').mysql;

const CSVReader = require('../../utils/csvParser')
const CSV_FILE_PATH = './utils/US_Accidents_Dec19.csv'

var log_id = 0
const log = require('../../utils/logger').log
const _cloneDeep = require('lodash.clonedeep');
const MAX_WORKERS = require('../../utils/constant').MAX_WORKERS

const insertIntoTable = function (data, callback) {
  let {
    data_table,
    report_table,
    batch_size,
    offset,
  } = data;

  let queue = async_queue(function (task, next) {
    task.run(task.data, function (err, result) {
      if (err) {
        console.log(err.stack)
      }
      next()

    }, MAX_WORKERS)
  })

  async_auto({
    insert: (cb) => {
      const parser = new CSVReader({
        cb: cb,
        offset: offset,
        batch_size: batch_size,
        file_path: CSV_FILE_PATH,
      })

      parser
        .read((batch) => {

          const dataObj = {
            batch: _cloneDeep(batch),
            data_table,
            report_table,
          }

          queue.push({ data: dataObj, run: insertOperation }, function () { })
        })
    },
  }, function (error, results) {
    if (error) return callback(error)

    return callback(null, {
      results
    })
  })
}

const insertOperation = function (data, _cb) {
  let { batch, data_table, report_table } = data

  async_auto({
    insert_into_data_table: (cb) => {
      mysql
        .batchInsert(data_table, batch, batch.length)
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
    insert_into_report_table: ['insert_into_data_table', function (result, cb) {
      let { batch_last_item_index, ab_batch_size } = result.insert_into_data_table

      mysql(report_table)
        .insert({
          batch_size: ab_batch_size,
          status: 'success',
          completed_at: batch_last_item_index
        })
        .then(() => {

          log.push({ '------': ++log_id },
            { status: 'success' },
            { batch_size: ab_batch_size },
            { completed_at: batch_last_item_index })

          console.log(log.toString())

          return cb(null)
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
