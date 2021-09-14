
/**
 * @typedef {(serialized: SerializedBook) => SerializedBook} SerializerDecorator
 */

/**
 * @type {SerializerDecorator}
 */
const WithoutMetaData = (serialized) => serialized.withContent(
  serialized.content
    .replace(/-+\n/g, '\n')
    .replace(/[a-zA-Z]+: .+\n/g, '')
)

/**
 * @type {SerializerDecorator}
 */
const ReplaceMetaTitleTopHeader = (serialized) => serialized.withContent(
  serialized.content.replace(/title:\s+(.+)\n/g, `# $1\n`)
)

exports.WithoutMetaData = WithoutMetaData
exports.ReplaceMetaTitleTopHeader = ReplaceMetaTitleTopHeader
