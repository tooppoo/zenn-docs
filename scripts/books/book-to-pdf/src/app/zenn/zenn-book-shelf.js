import fs  from 'fs'
import yaml from 'js-yaml'
import path from 'path'
import { Book } from '../../core/book/book'
import { Section } from '../../core/book/section'
import { logger } from '../../util/logger'

export class ZennBookShelf {
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
