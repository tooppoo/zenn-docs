const { Book } = require('../book/book')

/**
 * @typedef {Object} Serializer
 * @prop {(book: Book) => Promise<string>} serialize
 * @prop {(decorator: SerializerDecorator) => Serializer} with
 */