const { SerializedBook } = require('../serializer/serialized-book')

/**
 * @typedef {Object} Converter
 * @prop {(book: SerializedBook, outPath: string) => Promise<void>} convert
 */
