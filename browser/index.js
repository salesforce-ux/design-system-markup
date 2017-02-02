const BrowserDOM = require('../lib/dom')
const applyModifiers = require('../lib/modifiers')

const $ = node => new BrowserDOM(node)

module.exports = {
  applyModifiers: (modifiers, rootNode) =>
    applyModifiers(modifiers, $, rootNode)
}
