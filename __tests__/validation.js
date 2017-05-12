// Copyright (c) 2015-present, salesforce.com, inc. All rights reserved
// Licensed under BSD 3-Clause - see LICENSE.txt or git.io/sfdc-license

const {createValidator} = require('../server')

const validations = [
  {selector: '.slds-button', restrict: 'button, a'},
  {selector: '.slds-button--brand', restrict: '.slds-button'},
  {selector: '.slds-button--reset', restrict: '[class~=slds-button]'},
  {selector: '.slds-button--destructive'}
]

const validate = createValidator(validations)

describe('validations', () => {
  it('has no validation errors', () => {
    const html = `
      <button class="slds-button" />
    `
    const results = validate(html)
    expect(results).toEqual([])
  })

  it('has an issue', () => {
    const html = `
      <div class="slds-button" />
    `
    const results = validate(html)
    const result = results[0]
    expect(result.element).toEqual('<div class="slds-button">')
    expect(result.restrict).toEqual('button, a')
    expect(result.selector).toEqual('.slds-button')
    expect(result.valid).toBe(false)
  })

  it('works with multiple issues', () => {
    const html = `
      <div>
        <div class="slds-button--brand">
          <div class="slds-button">hey<div>
        </div>
      </div>
    `
    const results = validate(html)
    expect(results.length).toBe(2)
    expect(results[0].element).toEqual('<div class="slds-button--brand">')
    expect(results[1].element).toEqual('<div class="slds-button">')
    expect(results[0].lines).toEqual([1])
    expect(results[1].lines).toEqual([2])
  })

  it('works on complex selectors', () => {
    const html = `
      <div>
        <div class="slds-button--reset"></div>
      </div>
    `
    const results = validate(html)
    expect(results.length).toBe(1)
  })

  it('ignores custom classes', () => {
    const html = `
      <div class="customClass">
        <a class="slds-button slds-button--reset"></a>
      </div>
    `
    const results = validate(html)
    console.log(results)
    expect(results.length).toBe(0)
  })
})
