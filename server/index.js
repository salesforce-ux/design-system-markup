const I = require('immutable')
const cheerio = require('cheerio')

const validate = require('../lib/validate')
const { applyModifiers, removeModifiers } = require('../lib/modifiers')

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
  applyModifiers: (modifiers, markup, options = {}) => {
    const $ = cheerio.load(markup)
    return applyModifiers(I.fromJS(modifiers), $, $($.root()), options).toJS()
  },
  removeModifiers: (modifiers, markup, options = {}) => {
    const $ = cheerio.load(markup)
    return removeModifiers(I.fromJS(modifiers), $, $($.root()), options).toJS()
  }
}
