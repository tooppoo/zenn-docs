const { Section } = require('./section')

class Book {
  /**
   * @param {string} id 
   * @param {string} path 
   * @param {Section[]} sections
   */
  constructor(id, path, sections) {
    /**
     * @readonly
     * @type {string}
     */
    this.id = id
    /**
     * @readonly
     * @type {string}
     */
    this.path = path
    /**
     * @readonly
     * @type {Section[]}
     */
    this.sections = sections
  }

  /**
   * @returns {Section[]}
   */
  get orderedSections() {
    return this.sections.sort((a, b) => a.index - b.index)
  }
}

exports.Book = Book
