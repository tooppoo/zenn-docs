
/**
 * @typedef {Object} SerializedBook
 * @prop {string} id
 * @prop {string} content
 * @prop {(content: string) => SerializedBook} withContent
 */

/**
 * @param {Book} book
 * @param {string} content
 * @return {SerializedBook}
 */
const apply = (book, content) => {
  /** @type {SerializedBook} */
  const serialized = Object.create(book)
  serialized.content = content

  serialized.withContent = function (content) {
    const c = Object.create(this)
    c.content = content

    return c
  }

  return serialized
}