'use strict'

const fs = require('fs')
const parse = require('fast-csv').parse;

class CSVReader {
  constructor(props) {
    this.data = []
    this.cb = props.cb
    this.line_number = 0
    this.show_status = true
    this.offset = props.offset
    this.columns = props.columns
    this.batch_size = props.batch_size || 1000
    this.reader = fs.createReadStream(props.file_path)
  }

  read(callback) {
    this.reader
      .pipe(
        parse({ headers: true })
          .on('error', error => console.error(error))
          .on('data', row => {
            ++this.line_number

            if (this.line_number <= this.offset) {
              if (this.show_status) {
                this.show_status = false
                console.log(`SKIPPING ${this.offset} ROWS, HOLD ON`)
              }
              return
            }

            this.data.push(row)

            if (this.data.length != 0 && this.data.length % this.batch_size === 0) {
              callback(this.data)
              this.data.length = 0
            }
          })
          .on('end', (rowCount) => { return this.cb() })
      )
  }
}

module.exports = CSVReader