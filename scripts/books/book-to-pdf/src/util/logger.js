const loggerFactory = require('pino')

exports.logger = loggerFactory({
  level: process.env.NODE_ENV || 'info',
})
