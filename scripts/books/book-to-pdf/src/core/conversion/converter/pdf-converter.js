const { exec } = require('child_process')
const path = require('path')
const { logger } = require('../../../util/logger')
const { Book } = require('../../book/book')

/**
 * @augments Converter
 */
class PdfConverter {
  /**
   * @inheritdoc
   * @param {Book} book
   * @param {string} outPath
   * @returns {Promise<void>}
   */
  convert(book, outPath) {
    const sectionPaths = book.orderedSections.map(
      sec => path.resolve(book.path, `${sec.title}.*`)
    )
    const command = `cat ${sectionPaths.join(' ')} | md-to-pdf > ${outPath}`

    logger.debug({ book, outPath, command })
    logger.info('start pdf conversion')

    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          logger.error({ stderr }, 'failed pdf conversion')

          reject(error)
        } else {
          logger.debug({ stdout })
          logger.info('succeed pdf conversion')

          resolve()
        }
      })
    })
  }
}

exports.PdfConverter = PdfConverter
