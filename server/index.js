const cheerio = require('cheerio')

const validate = require('../lib/validate')

const createValidator = comments => markup => {
  const $ = cheerio.load(markup)
  const rootNode = $.root().children()
    .filter((i, x) => x.type === 'tag')
    .first()
    .get(0)
  const print = element => {
    return $.html($(element).clone().empty())
      .replace(/<\/.+?>/, '')
  }
  return validate(comments, $, rootNode).map(error =>
    error.update('element', print)
  )
}

module.exports = {
  createValidator
}
