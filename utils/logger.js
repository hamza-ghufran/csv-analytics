const logger = require('cli-table');

module.exports.log = new logger({
  chars: { 'mid': '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' }
});