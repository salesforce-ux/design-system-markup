const cheerio = require('cheerio')

const validate = require('../lib/validate')
const applyModifiers = require('../lib/modifiers')

const getRoot = $ =>
  $.root().children()
    .filter((i, x) => x.type === 'tag')
    .first()
    .get(0)

module.exports = {
  createValidator: comments => markup => {
    const $ = cheerio.load(markup)
    return validate(comments, $, getRoot($))
  },
  applyModifiers: (modifiers, markup) => {
    const $ = cheerio.load(markup)
    return applyModifiers(modifiers, $, $.root())
  }
}
