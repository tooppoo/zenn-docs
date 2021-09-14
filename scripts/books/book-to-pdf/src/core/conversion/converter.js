const { Book } = require('../book/book')

/**
 * @typedef {Object} Converter
 * @prop {(book: Book, outPath: string) => Promise<void>} convert
 */
