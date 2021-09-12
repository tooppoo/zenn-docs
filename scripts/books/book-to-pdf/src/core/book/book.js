import { Section } from './section'

export class Book {
  /**
   * @param {string} id 
   * @param {string} path 
   * @param {Section[]} sections
   */
  constructor(id, path, sections) {
    /** @readonly */
    this.id = id
    /** @readonly */
    this.path = path
    /** @readonly */
    this.sections = sections
  }
}
