'use strict'

const fs = require('fs')
const csv = require('csv-stream')
const through2 = require('through2')

class CSVReader {
  constructor(filename, batchSize, columns, offset) {
    this.data = []
    this.lineNumber = 0
    this.columns = columns
    this.batchSize = batchSize || 1000
    this.offset = offset
    this.reader = fs.createReadStream(filename)
    this.show_status = true
  }

  read(callback) {
    this.reader
      .pipe(csv.createStream({
        endLine: '\n',
        columns: this.columns,
        escapeChar: '"',
        enclosedChar: '"'
      }))
      .pipe(through2({ objectMode: true }, (row, enc, cb) => {
        ++this.lineNumber

        if (this.lineNumber < (this.offset + 1) || this.lineNumber == 1) { //skip line containing headers
          return cb(null, true)
        }

        if (this.data.length != 0 && this.data.length % this.batchSize === 0) {
          this.reader.pause();
          callback(this.data)
        }

        this.data.push(row)
        return cb()
      }))
      .on('data', data => {
        if (this.offset && this.show_status) {
          console.log(`SKIPPING ${this.offset} ROWS`)
          this.show_status = false
        }
      })
      .on('end', () => {
      })
      .on('error', err => {
        console.error(err)
      })
  }

  continue() {
    this.data = []
    this.reader.resume()
  }
}

module.exports = CSVReader