const { exec } = require('child_process')
const { default: mdToPdf } = require('md-to-pdf')
const path = require('path')
const { logger } = require('../../../util/logger')
const { Book } = require('../../book/book')

/**
 * @augments Converter
 */
class PdfConverter {
  /**
   * @inheritdoc
   * @param {Book} book
   * @param {string} outPath
   * @returns {Promise<void>}
   */
  async convert(book, outPath) {
    const sectionPaths = book.orderedSections.map(
      sec => path.resolve(book.path, `${sec.title}.md`)
    )
    // const command = `cat ${sectionPaths.join(' ')} | md-to-pdf > ${outPath}`
    // const command = `cat ${sectionPaths.join(' ')} | md-to-pdf`
    const command = `cat ${sectionPaths.join(' ')}`

    logger.debug({ book, outPath, command })

    const content = await this.concatContent(command)

    await this.markdownToPdf(content, outPath)
  }

  /**
   * @private
   * @param {string} command 
   * @returns {Promise<string>} 
   */
  concatContent(command) {
    logger.info('start concatenate markdown documents')

    return new Promise((resolve, reject) => {
      try {
        exec(command, (error, stdout, stderr) => {
          if (error) {
            logger.error({ stderr }, 'failed concatenate markdown documents')

            reject(error)
          } else {
            logger.info('succeed concatenate markdown documents')

            resolve(stdout)
          }
        })
      } catch (error) {
        logger.error({ error }, 'unknown error in concatenating documents')

        reject(error)
      }
    })
  }

  /**
   * @private
   * @param {string} content 
   * @param {string} outPath
   * @returns {Promise<void>}
   */
  async markdownToPdf(content, outPath) {
    logger.info('start pdf conversion')

    try {
      await mdToPdf({ content }, { dest: outPath })

      logger.info('succeed pdf conversion')
    } catch (error) {
      logger.error('failed pdf conversion')

      throw error
    }
  }
}

exports.PdfConverter = PdfConverter
