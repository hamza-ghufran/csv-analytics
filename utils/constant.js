'use strict'

const DATA_TABLE = 'Table-A'
const STATUS_TABLE = 'Table-B'

const MAX_WORKERS = 1
const DEFAULT_BATCH_SIZE = 5000
const STATUS_TABLE_HEADERS = ['id', 'status', 'batch_size', 'completed_at'];

exports.DATA_TABLE = DATA_TABLE
exports.MAX_WORKERS = MAX_WORKERS
exports.STATUS_TABLE = STATUS_TABLE
exports.STATUS_TABLE_HEADERS = STATUS_TABLE_HEADERS
exports.DEFAULT_BATCH_SIZE = DEFAULT_BATCH_SIZE