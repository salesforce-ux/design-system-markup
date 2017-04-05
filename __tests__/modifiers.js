const {applyModifiers} = require('../server')

const modifiers = [
  {selector: '.slds-button--reset', restrict: '[class~=slds-button]'},
  {selector: '.slds-button--brand', restrict: '.slds-button', group: 'theme'},
  {selector: '.slds-button--destructive', restrict: '.slds-button', group: 'theme'}
]

describe('modifiers', () => {
  it('applys modifiers', () => {
    const html = `
      <button class="slds-button" />
    `
    const results = applyModifiers([modifiers[1]], html)
    expect(results.markup).toEqual(`
      <button class="slds-button slds-button--brand">
    </button>`)
  })

  it('applys multiple modifiers', () => {
    const html = `
      <button class="slds-button" />
    `
    const results = applyModifiers([modifiers[1], modifiers[0]], html)
    expect(results.markup).toEqual(`
      <button class="slds-button slds-button--reset slds-button--brand">
    </button>`)
  })

  it('removes other modifiers in the group', () => {
    const html = `
      <button class="slds-button" />
    `
    const results = applyModifiers(modifiers, html)
    expect(results.markup).toEqual(`
      <button class="slds-button slds-button--destructive slds-button--reset">
    </button>`)
  })
})
