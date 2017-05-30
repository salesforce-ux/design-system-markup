const I = require('immutable')
const BrowserDOM = require('../lib/dom')
const applyModifiers = require('../lib/modifiers')
const validate = require('../lib/validate')

const $ = node => new BrowserDOM(node)

$.html = wrapper =>
  wrapper.extract().outerHTML // hack

const createValidator = validations => rootNode =>
  validate(I.fromJS(validations), $, rootNode).toJS()

module.exports = {
  createValidator,

  applyModifiers: (modifiers, rootNode) =>
    applyModifiers(I.fromJS(modifiers), $, rootNode).toJS(),

  removeModifiers: (modifiers, markup) => {
    console.log('yo')
    return I.List()
  }
}
