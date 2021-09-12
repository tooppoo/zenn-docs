const { Book } = require('./book')

/**
 * @typedef {Object} BookShelf
 * @property {(id: string) => Promise<Book>} find
 */
