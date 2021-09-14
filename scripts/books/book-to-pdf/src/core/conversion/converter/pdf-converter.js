const { default: mdToPdf } = require('md-to-pdf')
const { logger } = require('../../../util/logger')
const { SerializedBook } = require('../../serializer/serialized-book')

/**
 * @augments Converter
 */
class PdfConverter {
  /**
   * @inheritdoc
   * @param {SerializedBook} book
   * @param {string} outPath
   * @returns {Promise<void>}
   */
  async convert(book, outPath) {
    logger.info('start pdf conversion')
    logger.debug({ book, outPath })

    try {
      await mdToPdf({ content: book.content }, { dest: outPath })

      logger.info('succeed pdf conversion')
    } catch (error) {
      logger.error('failed pdf conversion')

      throw error
    }
  }
}

exports.PdfConverter = PdfConverter
