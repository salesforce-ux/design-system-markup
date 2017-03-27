const BrowserDOM = require('../lib/dom')
const applyModifiers = require('../lib/modifiers')
const validate = require('../lib/validate')

const $ = node => new BrowserDOM(node)

const createValidator = comments => rootNode =>
  validate(comments, $, rootNode)

module.exports = {
  createValidator,
  applyModifiers: (modifiers, rootNode) =>
    applyModifiers(modifiers, $, rootNode)
}
