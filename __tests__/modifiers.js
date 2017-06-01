const {applyModifiers, removeModifiers} = require('../server')

const modifiers = [
  {selector: '.slds-button--reset', restrict: '[class~=slds-button]'},
  {selector: '.slds-button--brand', restrict: '.slds-button', group: 'theme'},
  {selector: '.slds-button--destructive', restrict: '.slds-button', group: 'theme'}
]

describe('modifiers', () => {
  it('applies modifiers', () => {
    const html = `
      <button class="slds-button" />
    `
    const results = applyModifiers([modifiers[1]], html)
    expect(results.markup).toEqual(`
      <button class="slds-button slds-button--brand">
    </button>`)
  })

  it('applies multiple modifiers', () => {
    const html = `
      <button class="slds-button" />
    `
    const results = applyModifiers([modifiers[0], modifiers[1]], html)
    expect(results.markup).toEqual(`
      <button class="slds-button slds-button--reset slds-button--brand">
    </button>`)
  })

  it('removes modifiers', () => {
    const html = `
      <button class="slds-button slds-button--brand" />
    `
    const results = removeModifiers([modifiers[1]], html)
    expect(results.markup).toEqual(`
      <button class="slds-button">
    </button>`)
  })

  it('applies modifiers to single element', () => {
    const html = `
      <div>
        <button class="slds-button" />
        <button class="slds-button" />
      </div>
    `
    const results = applyModifiers([modifiers[1]], html, {single: true})
    expect(results.markup).toEqual(`
      <div>
        <button class="slds-button slds-button--brand">
        </button><button class="slds-button">
      </button></div>
    `)
  })

})
