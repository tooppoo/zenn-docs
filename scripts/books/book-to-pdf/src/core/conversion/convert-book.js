const { BookShelf }  = require('../book/book-shelf')
const { logger } = require('../../util/logger')

/**
 * book convert service
 */
class ConvertBook {
  /**
   * @param {BookShelf} bookShelf
   * @param {Converter} converter 
   */
  constructor(
    bookShelf,
    converter
  ) {
    /**
     * @readonly
     * @type {BookShelf}
     */
    this.bookShelf = bookShelf
    /**
     * @readonly
     * @typedef {Converter}
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
      await this.converter.convert(book, to)

      logger.info('succeed book conversion')
    } catch (error) {
      logger.error('failed book conversion')

      throw error
    }
  }
}

exports.ConvertBook = ConvertBook
