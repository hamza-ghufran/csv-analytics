'use strict'

const DATA_TABLE = 'Table-A'
const STATUS_TABLE = 'Table-B'
const ANALYSIS_TABLE = 'Table-C'

const MAX_WORKERS = 4 // change to 1 for uploading in order
const DEFAULT_BATCH_SIZE = 3000
const ANALYSIS_TABLE_HEADERS = ['id', 'region', 'accidents_count']
const STATUS_TABLE_HEADERS = ['id', 'status', 'batch_size', 'completed_at']

exports.DATA_TABLE = DATA_TABLE
exports.MAX_WORKERS = MAX_WORKERS
exports.STATUS_TABLE = STATUS_TABLE
exports.ANALYSIS_TABLE = ANALYSIS_TABLE
exports.DEFAULT_BATCH_SIZE = DEFAULT_BATCH_SIZE
exports.STATUS_TABLE_HEADERS = STATUS_TABLE_HEADERS
exports.ANALYSIS_TABLE_HEADERS = ANALYSIS_TABLE_HEADERS