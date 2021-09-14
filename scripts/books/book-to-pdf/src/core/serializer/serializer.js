const { logger } = require('../../util/logger')
const { Book } = require('../book/book')

/**
 * @abstract
 */
class Serializer {
  /**
   * @param {(book: Book) => Promise<string>} serializer 
   * @returns {Serializer}
   */
  static by(serializer) {
    return new Serializer(serializer, [])
  }

  /**
   * @readonly
   * @private
   * @type {SerializerDecorator[]}
   */
  __decorators = []

  /**
   * @private
   * @param {SerializerDecorator[]} decorators 
   */
  constructor(serializer, decorators) {
    this.__serializer = serializer
    this.__decorators = decorators
  }

  /**
   * @param {Book} book 
   * @return {Promise<SerializedBook>}
   */
  async serialize(book) {
    logger.info('start book serialization')

    try {
      const serialized = await this.__serializer(book)

      const result = this.__decorators.reduce(
        (decorated, decorator) => decorator(decorated),
        serialized
      )
    
      logger.info('success book serialization')

      return result
    } catch (error) {
      logger.error('failed book serialization')

      throw error
    }
  }

  /**
   * @param {SerializerDecorator} decorator 
   * @return {Serializer}
   */
  with(decorator) {
    return new Serializer(this.__serializer, [...this.__decorators, decorator])
  }
}

exports.Serializer = Serializer
