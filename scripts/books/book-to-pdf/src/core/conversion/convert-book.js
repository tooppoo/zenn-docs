const { BookShelf }  = require('../book/book-shelf')
const { Converter } = require('./converter')
const { Serializer } = require('../serializer/serializer')
const { logger } = require('../../util/logger')

/**
 * book convert service
 */
class ConvertBook {
  /**
   * @param {BookShelf} bookShelf
   * @param {Serializer} serializer
   * @param {Converter} converter 
   */
  constructor(
    bookShelf,
    serializer,
    converter
  ) {
    /**
     * @readonly
     * @type {BookShelf}
     */
    this.bookShelf = bookShelf
    /**
     * @readonly
     * @type {Serializer}
     */
    this.serializer = serializer
    /**
     * @readonly
     * @type {Converter}
     */
    this.converter = converter
  }

  /**
   * @public
   * @param {string} bookId
   * @param {string} to converted file name
   * @returns {Promise<void>}
   */
  async convert(bookId, to) {
    try {
      logger.info('start book conversion')

      const book = await this.bookShelf.find(bookId)
      const serialized = await this.serializer.serialize(book)
      await this.converter.convert(serialized, to)

      logger.info('succeed book conversion')
    } catch (error) {
      logger.error('failed book conversion')

      throw error
    }
  }
}

exports.ConvertBook = ConvertBook
