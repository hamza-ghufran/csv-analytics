'use strict'

const DATA_TABLE = 'Table-A'
const STATUS_TABLE = 'Table-B'

const DEFAULT_BATCH_SIZE = 2000

const STATUS_TABLE_HEADERS = ['id', 'status', 'batch_size', 'completed_at'];

exports.DATA_TABLE = DATA_TABLE
exports.STATUS_TABLE = STATUS_TABLE
exports.STATUS_TABLE_HEADERS = STATUS_TABLE_HEADERS
exports.DEFAULT_BATCH_SIZE = DEFAULT_BATCH_SIZE