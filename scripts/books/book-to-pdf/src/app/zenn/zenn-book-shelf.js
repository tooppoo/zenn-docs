const fs  = require('fs')
const yaml = require('js-yaml')
const path = require('path')
const { Book } = require('../../core/book/book')
const { Section } = require('../../core/book/section')
const { logger } = require('../../util/logger')

class ZennBookShelf {
  /**
   * @param {string} rootPath 
   */
  constructor(rootPath) {
    /**
     * @readonly
     * @type {string}
     */
    this.rootPath = rootPath
  }

  /**
   * 
   * @param {string} id 
   * @returns {Promise<Book>}
   */
  find(id) {
    try {
      logger.info('start find book of zenn')

      const bookPath = path.resolve(this.rootPath, id)
      const targetFile = path.resolve(bookPath, 'config.yml')
      logger.debug({ bookPath, targetFile })

      const config = yaml.load(fs.readFileSync(targetFile, 'utf-8'))
      logger.debug({ config })

      const sections = config['chapters'].map((c, i) => new Section(c, i))
      const book = new Book(id, bookPath, sections)
      logger.debug({ book })

      logger.info('succeed find book of zenn')

      return Promise.resolve(book)
    } catch (error) {
      logger.error('failed find book of zenn')

      return Promise.reject(error)
    }
  }
}

exports.ZennBookShelf = ZennBookShelf
