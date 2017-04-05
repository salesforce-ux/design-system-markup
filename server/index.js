const I = require('immutable')
const cheerio = require('cheerio')

const validate = require('../lib/validate')
const applyModifiers = require('../lib/modifiers')

const getRoot = $ =>
  $.root().children()
    .filter((i, x) => x.type === 'tag')
    .first()
    .get(0)

module.exports = {
  createValidator: validations => markup => {
    const $ = cheerio.load(markup)
    return validate(I.fromJS(validations), $, getRoot($)).toJS()
  },
  applyModifiers: (modifiers, markup) => {
    const $ = cheerio.load(markup)
    return applyModifiers(I.fromJS(modifiers), $, $.root()).toJS()
  }
}
