'use strict'

const fs = require('fs')
const parse = require('fast-csv').parse;
var exec = require('child_process').exec;

class CSVReader {
  constructor(props) {
    this.data = []
    this.cb = props.cb
    this.line_number = 0
    this.show_status = true
    this.offset = props.offset
    this.columns = props.columns
    this.batch_size = props.batch_size || 1000
    this.start = props.start
    this.headers = props.headers
    // this.file_info = this.getFileStats(props.file_path)
    this.reader = fs.createReadStream(props.file_path, { start: Math.floor(props.start), end: Math.floor(props.end) })
  }

  getFileStats(file) {
    var stats = fs.statSync(file)
    var fileSizeInBytes = stats["size"]

    exec(`wc -l < ${file}`, function (error, results) {
      console.log('result', results);
      console.log('file_size', fileSizeInBytes);
    });
  }

  read(callback) {
    this.reader
      .pipe(
        parse({ headers: this.headers })
          .on('error', error => console.error(error))
          .on('data', row => {
            ++this.line_number

            if (this.start === 0 && this.line_number === 1) return

            if (this.line_number <= this.offset) {
              if (this.show_status) {
                this.show_status = false
                console.log(`SKIPPING ${this.offset} ROWS, HOLD ON`)
              }
              return
            }

            this.data.push(row)

            if (this.data.length != 0 && this.data.length % this.batch_size === 0) {
              this.data.shift()
              callback(this.data)
              this.data.length = 0
            }
          })
          .on('end', (rowCount) => { return this.cb() })
      )
  }
}

module.exports = CSVReader