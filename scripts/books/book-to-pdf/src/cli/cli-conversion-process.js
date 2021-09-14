const path = require('path')
const { ZennBookShelf } = require('../app/zenn/zenn-book-shelf')
const { ConvertBook } = require('../core/conversion/convert-book')
const { PdfConverter } = require('../core/conversion/converter/pdf-converter')
const SerializerDecorator = require('../core/serializer/decorator')
const { CatSerializer } = require('../core/serializer/kind/cat-serializer')
const { Serializer } = require('../core/serializer/serializer')
const { logger } = require('../util/logger')

function pathToAbs(pathMaybeRel, cwd) {
  return path.isAbsolute(pathMaybeRel)
    ? pathMaybeRel
    : path.resolve(cwd, pathMaybeRel)
}
class CliArgument {
  constructor(args, cwd) {
    this.args = args
    this.cwd = cwd
  }

  get targetBookDir() {
    return pathToAbs(this.args[2], this.cwd)
  }
  get bookId() {
    return path.basename(this.targetBookDir)
  }
  get zennBookRoot() {
    return path.dirname(this.targetBookDir)
  }

  get output() {
    return pathToAbs(this.args[3], this.cwd)
  }
}

/**
 * @param {CliArgument} argument 
 */
async function processConversion(argument) {
  const bookId = argument.bookId
  const output = argument.output
  const bookRoot = argument.zennBookRoot

  logger.debug({
    argument,
    bookId,
    output,
    bookRoot,
  })

  const shelf = new ZennBookShelf(bookRoot)
  const serializer = Serializer.by(CatSerializer)
    .with(SerializerDecorator.ReplaceMetaTitleTopHeader)
    .with(SerializerDecorator.WithoutMetaData)
  const converter = new PdfConverter()

  const service = new ConvertBook(shelf, serializer, converter)

  try {
    logger.info('start book conversion process')

    await service.convert(argument.bookId, argument.output)

    logger.info('finish book conversion process')
  } catch (error) {
    /** @var {Error} error */
    logger.error(error, `failed book conversion process`)
  }
}

exports.CliArgument = CliArgument
exports.processConversion = processConversion
