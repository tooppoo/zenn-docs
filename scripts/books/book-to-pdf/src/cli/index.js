const { logger } = require('../util/logger')
const Cli = require('./cli-conversion-process')

const arg = new Cli.CliArgument(process.argv, process.cwd())

Cli.processConversion(arg).finally(() => {
  process.exit()
})
