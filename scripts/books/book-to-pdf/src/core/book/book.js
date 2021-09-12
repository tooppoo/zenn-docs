import { Section } from './section'

export class Book {
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
}
