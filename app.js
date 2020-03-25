'use strict'

const CSV_FILE_PATH = './utils/US_Accidents_Dec19.csv'

const async = require('async')
const csvHeaders = require('csv-headers')

const {
  createTable,
  fetchCount,
  insertIntoTable,
} = require('./modules/index')

const {
  DATA_TABLE,
  STATUS_TABLE,
  ANALYSIS_TABLE,
  DEFAULT_BATCH_SIZE,
  STATUS_TABLE_HEADERS,
  ANALYSIS_TABLE_HEADERS,
} = require('./utils/constant')

async.auto({
  list_table_headers_from_csv: (cb) => {
    csvHeaders({
      file: CSV_FILE_PATH,
      delimiter: ','
    }, function (err, table_headers) {
      if (err) {
        return cb(err)
      }

      return cb(null, { table_headers })
    })
  },
  create_data_table: ['list_table_headers_from_csv', function (result, cb) {
    let { table_headers } = result.list_table_headers_from_csv;

    let dataObj = {
      table_headers,
      table_name: DATA_TABLE,
    }

    createTable(dataObj, (err, res) => {
      if (err) {
        console.log('ERROR WHILE CREATING TABLE', err)
        return cb(err)
      }

      return cb(null, res)
    })
  }],
  create_status_table: (cb) => {
    let dataObj = {
      table_name: STATUS_TABLE,
      table_headers: STATUS_TABLE_HEADERS
    }

    createTable(dataObj, (err, res) => {
      if (err) {
        console.log('ERROR WHILE CREATING TABLE', err)
        return cb(err)
      }

      return cb(null, { headers: res.results })
    })
  },
  create_analysis_table: (cb) => {
    let dataObj = {
      table_name: ANALYSIS_TABLE,
      table_headers: ANALYSIS_TABLE_HEADERS
    }

    createTable(dataObj, (err, res) => {
      if (err) {
        console.log('ERROR WHILE CREATING TABLE', err)
        return cb(err)
      }

      return cb(null, { headers: res.results })
    })
  },
  get_current_status_count: ['create_status_table', function (result, cb) {
    let dataObj = {
      table_name: STATUS_TABLE,
      status: 'success'
    }

    fetchCount(dataObj, (err, count) => {
      if (err) {
        console.log('ERROR FETCHING STATUS REPORT', err)
        return cb(err)
      }

      return cb(null, { current_status_line_count: count })
    })
  }],
  insert_into_data_table: [
    'create_data_table',
    'create_status_table',
    'create_analysis_table',
    'get_current_status_count',
    'list_table_headers_from_csv',
    function (result, cb) {
      let dataObj = {
        batch_size: DEFAULT_BATCH_SIZE,
        offset: result.get_current_status_count.current_status_line_count,
      }

      insertIntoTable(dataObj, (err, res) => {
        if (err) {
          console.log('ERROR WHILE PARSING DATA', err)
          return cb(err)
        }

        return cb(res)
      })
    }]
}, function (error, results) {
  if (error) {
    console.log(error.stack)
  }

  console.log({ results })
})

// process.on('unhandledRejection', (err, p) => { return });




