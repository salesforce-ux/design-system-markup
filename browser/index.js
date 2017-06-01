const I = require('immutable')
const BrowserDOM = require('../lib/dom')
const {applyModifiers, removeModifiers} = require('../lib/modifiers')
const validate = require('../lib/validate')

const $ = node => new BrowserDOM(node)

$.html = wrapper =>
  wrapper.extract().outerHTML // hack

const createValidator = validations => rootNode =>
  validate(I.fromJS(validations), $, rootNode).toJS()

module.exports = {
  createValidator,

  applyModifiers: (modifiers, rootNode, options = {}) =>
    applyModifiers(I.fromJS(modifiers), $, $(rootNode), options).toJS(),

  removeModifiers: (modifiers, rootNode, options = {}) =>
    removeModifiers(I.fromJS(modifiers), $, $(rootNode), options).toJS()
}
