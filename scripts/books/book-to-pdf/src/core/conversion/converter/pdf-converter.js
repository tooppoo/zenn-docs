import { exec } from 'child_process'
import path from 'path'
import { logger } from '../../../util/logger'
import { Book } from '../../book/book'

/**
 * @augments Converter
 */
export class PdfConverter {
  /**
   * @inheritdoc
   * @param {Book} book
   * @param {string} outPath
   * @returns {Promise<void>}
   */
  convert(book, outPath) {
    const sectionPaths = book.orderedSections.map(
      sec => path.resolve(book.path, `${sec.title}.*`)
    )
    const command = `cat ${sectionPaths.join(' ')} | md-to-pdf > ${outPath}`

    logger.debug({ book, outPath, command })
    logger.info('start pdf conversion')

    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          logger.error({ stderr }, 'failed pdf conversion')

          reject(error)
        } else {
          logger.debug({ stdout })
          logger.info('succeed pdf conversion')

          resolve()
        }
      })
    })
  }
}
