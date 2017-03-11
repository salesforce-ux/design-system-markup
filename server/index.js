const cheerio = require('cheerio')

const validate = require('../lib/validate')

const createValidator = comments => markup => {
  const $ = cheerio.load(markup)
  const rootNode = $.root().children()
    .filter((i, x) => x.type === 'tag')
    .first()
    .get(0)
  return validate(comments, $, rootNode)
}

module.exports = {
  createValidator
}
