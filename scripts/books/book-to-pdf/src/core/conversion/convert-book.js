
/**
 * book convert service
 */
export class ConvertBook {
  /**
   * @param {import('../book/book-shelf').BookShelf} bookShelf
   * @param {Converter} converter 
   */
  constructor(
    bookShelf,
    converter
  ) {
    /**
     * @readonly
     * @type {import('../book/book-shelf').BookShelf}
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
    const book = await this.bookShelf.find(bookId)

    return this.converter.convert(book, to)
  }
}
