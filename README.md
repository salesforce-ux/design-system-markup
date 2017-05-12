# Design System Markup

This is a markup generator and validator. Currently it is used by previewer and design-system-site to apply modifiers to html. It is also used by previewer, design-system-internal, and chrome-ext for validation.


# Usage

`npm install`


## Validation

```js
const {createValidator} = require('./server') // or require('./browser')

const validations = [
  {selector: '.slds-button', restrict: 'button, a'},
  {selector: '.slds-button--brand', restrict: '.slds-button'},
  {selector: '.slds-button--reset', restrict: '[class~=slds-button]'}
]

const validate = createValidator(validations)

const html = `
  <div>
    <span class="slds-button" />
  </div>
`

validate(html)
// [ { selector: '.slds-button',
//  restrict: 'button, a',
//  element: '<span class="slds-button">',
//  valid: false,
//  lines: [ 1 ] } ]
```

The only non-self explanitory part is that lines is an array of occurences.


## Modifier application

```js
const {applyModifiers} = require('../server')

const modifiers = [
  {selector: '.slds-button--reset', restrict: '[class~=slds-button]'},
  {selector: '.slds-button--brand', restrict: '.slds-button', group: 'theme'},
  {selector: '.slds-button--destructive', restrict: '.slds-button', group: 'theme'}
]

const html = `
  <button class="slds-button" />
`
const results = applyModifiers([modifiers[1]], html)
results.markup
// <button class="slds-button slds-button--brand"></button>
```

Modifiers apply to their restrict. Group is an "exclusive or" so only the last modifier in the group will be applied if there are multiple occurrences.

## Browser/Server

This project includes an adapter to pair cheerio with a browser dom. Why cheerio is not already paired is beyond me.


# Validation code walkthrough

1. We set up `commentsBySelector` which is a map of every selector (even , separated ones) pointing to a list of matching comments. (e.g. ".slds-button, button" => Map({button: comments, .slds-button: comments}))

2. We partition `commentsBySelector` into two submaps (`commentsByClass` and `commentsByFancy`) by matching `.slds-` on each key

3. To validate an element
  * Validate normal slds selectors
    * Extract classNames off the element
    * Try to get the comment corresponding to the className i.e. that is part of our `commentsBySelector` i.e. part of our system
    * For each comment, get the restrict and use it on the element, and return a list of results: {valid: false, element, restrict} || null, but keep the first success since there may be many comments with the same selector.
  * Validate the "fancy" selectors
    * hack: remove things that break cheerio
    * throw away the map structure and just get the comments since we don't need it
    * For every comment in "fancy", apply the selector to the dom find all elements
    * validate like above where we just apply the restrict to each element found and keep the first success
  * Finally filter only the invalid, make the elements html, and add line numbers

4. To validate the whole tree
  * Validate the root, then flatMap validate the children

## Licenses
Source code is licensed under [BSD 3-Clause](https://git.io/sfdc-license)
