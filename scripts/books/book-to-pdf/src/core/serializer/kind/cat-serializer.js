const { Book } = require('../../book/book');

/**
 * @param {Book} book 
 * @returns {Promise<string>}
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
          reject(error)
        } else {
          resolve(stdout)
        }
      })
    } catch (error) {
      reject(error)
    }
  })
}
