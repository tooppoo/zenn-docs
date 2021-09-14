
/**
 * @typedef {(serialized: string) => string} SerializerDecorator
 */

/**
 * @type {SerializerDecorator}
 */
const WithoutMetaData = (serialized) => serialized
  .replace(/-+\n/g, '\n')
  .replace(/[a-zA-Z]+: .+\n/g, '')

/**
 * @type {SerializerDecorator}
 */
const ReplaceMetaTitleTopHeader = (serialized) => serialized
  .replace(/title:\s+(.+)\n/g, `# $1\n`)

exports.WithoutMetaData = WithoutMetaData
exports.ReplaceMetaTitleTopHeader = ReplaceMetaTitleTopHeader
