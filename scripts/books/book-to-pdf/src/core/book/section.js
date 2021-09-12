
class Section {
  /**
   * @param {string} title 
   * @param {number} index 
   */
  constructor(title, index) {
    /** @readonly */
    this.title = title
    /** @readonly */
    this.index = index
  }
}

exports.Section = Section
