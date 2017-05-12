// Copyright (c) 2015-present, salesforce.com, inc. All rights reserved
// Licensed under BSD 3-Clause - see LICENSE.txt or git.io/sfdc-license

const I = require('immutable')
const BrowserDOM = require('../lib/dom')
const {applyModifiers, removeModifiers} = require('../lib/modifiers')
const validate = require('../lib/validate')

const $ = node => new BrowserDOM(node)

const createValidator = validations => rootNode =>
  validate(I.fromJS(validations), $, rootNode).toJS()

module.exports = {
  createValidator,
  applyModifiers: (modifiers, rootNode) =>
    applyModifiers(I.fromJS(modifiers), $(rootNode)),
  removeModifiers: (modifiers, rootNode) =>
    removeModifiers(I.fromJS(modifiers), $(rootNode))
}
