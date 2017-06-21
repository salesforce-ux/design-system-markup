const {createValidator} = require('../server')

const validations = [
  {selector: '.slds-button', restrict: 'button, a'},
  {selector: '.slds-button--brand', restrict: '.slds-button'},
  {selector: '.slds-button--reset', restrict: '[class~=slds-button]'},
  {selector: '.slds-button--destructive'},
  {selector: '.slds-is-selected', restrict: '.slds-button_icon'},
  {selector: '.slds-is-selected', restrict: '.slds-button_stateful'}
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
    expect(result.elementString).toEqual('<div class="slds-button">')
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
    expect(results[0].elementString).toEqual('<div class="slds-button--brand">')
    expect(results[1].elementString).toEqual('<div class="slds-button">')
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
    expect(results.length).toBe(0)
  })

  it('shows all possible restricts when the selector has multiple possibilities', () => {
    const html = `
      <div>
        <a class="slds-is-selected"></a>
      </div>
    `
    const results = validate(html)
    expect(results.length).toBe(1)
    expect(results[0].elementString).toEqual('<a class="slds-is-selected">')
    expect(results[0].restrict).toEqual('.slds-button_icon, .slds-button_stateful')
  })
})
