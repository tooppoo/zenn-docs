const { Book } = require('../../book/book');
const { SerializedBook, apply: applySerializedBook } = require('../serialized-book')
const { exec } = require('child_process');
const path = require('path');
const { logger } = require('../../../util/logger');

/**
 * @param {Book} book 
 * @returns {Promise<SerializedBook>}
 */
exports.CatSerializer = (book) => {
  const sectionPaths = book.orderedSections.map(
    sec => path.resolve(book.path, `${sec.title}.md`)
  )
  const commandToConcatenate = `cat ${sectionPaths.join(' ')}`

  return new Promise((resolve, reject) => {
    try {
      exec(commandToConcatenate, (error, stdout, stderr) => {
        if (error) {
          logger.error({ stderr })

          reject(error)
        } else {
          resolve(applySerializedBook(book, stdout))
        }
      })
    } catch (error) {
      reject(error)
    }
  })
}
