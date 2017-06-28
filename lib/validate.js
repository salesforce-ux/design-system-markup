const I = require('immutable-ext')
const escapeRegExp = require('lodash/escapeRegExp')
const {Left, Right, fromNullable} = require('data.either')

const fromFalsy = x =>
   x ? Right(x) : Left()

const splitSelectors = comment =>
  comment
  .get('selector', '')
  .split(',')
  .map(s => s.trim())

const makeSelectorToCommentsMap = comments =>
  comments
  .filter(comment => comment.has('restrict'))
  .reduce((map, comment) =>
    splitSelectors(comment)
    .reduce(
      (map, selector) =>
        map.set(selector, map.get(selector, I.List()).push(comment)),
      map
    ),
    I.Map()
  )

const combineRestricts = (x, y) =>
  [x.get('restrict'), y.get('restrict')].filter(x => x).join(', ')

const CombineResult = x =>
({
  x,
  concat: ({x: y}) =>
    CombineResult(
      Result(
        x.get('selector') || y.get('selector'), // always the same selector except empty
        combineRestricts(x, y),
        x.get('element') || y.get('element'), // same
        x.get('valid') || y.get('valid')
      )
    )
})
CombineResult.empty = () =>
  CombineResult(Result("", "", null, false))

const Result = (selector, restrict, element, valid) =>
  I.Map({ selector, restrict, element, valid })

const runRestrict = ($element, restrict) =>
  $element.filter(restrict).length > 0

const validate = (className, comment, $element) => {
  const valid = runRestrict($element, comment.get('restrict'))
  return Result(className, comment.get('restrict'), $element, valid)
}

const extractClassNames = $element =>
  fromFalsy($element.attr('class'))
  .map(str => str.split(' ').map(c => `.${c}`))
  .fold(
    e => I.List(),
    xs => I.List(xs)
  )

const validateElement = (commentsByClass, $element) =>
  extractClassNames($element)
  .map(className =>
    fromNullable(commentsByClass.get(className))
    .map(comments =>
      comments
      .map(c => validate(className, c, $element))
      .foldMap(CombineResult, CombineResult.empty())
      .x
    )
    .fold(
      e => Result(className, 'Not our class', $element, true),
      result => result
    )
  )

const getChildren = $element =>
  I.List($element.children().get())

const validateByClassName = (commentsByClass, $element, $) =>
  validateElement(commentsByClass, $element)
  .concat(getChildren($element).flatMap(e =>
    validateByClassName(commentsByClass, $(e), $)))

const hackToRejectFocusForCheerio = commentsByFancy =>
  commentsByFancy
  .filter((value, key) => !/:focus/.test(key))
  .map(comments =>
    comments.map(comment =>
      comment.update('selector', selector =>
        selector.replace(/.+?:focus,?/, ''))))

const validateByEveryFancyComment = (commentsByFancy, $element, $) =>
  hackToRejectFocusForCheerio(commentsByFancy)
  .toList()
  .flatMap(comments => {
    // get the first selector since they are all the same
    const selector = comments.first().get('selector')
    const elements = $element.find(selector)
    return I.List(elements.get())
    .map($)
    .map($el =>
      comments
      .foldMap(c =>
        CombineResult(validate(selector, c, $el)),
        CombineResult.empty()).x
    )
  })

const print = ($, $element) =>
  $.html($element.clone().empty()).replace(/<\/.+?>/, '')

module.exports = (comments, $, rootNode) => {
  const commentsBySelector = makeSelectorToCommentsMap(comments)
  const commentsByClass = commentsBySelector.filter((v, k) => /^\.slds-/.test(k))
  const commentsByFancy = commentsBySelector.filter((v, k) => !/^\.slds-/.test(k))
  const $rootNode = $(rootNode)

  // First, recursivley lookup comments by ".slds-" classname and validate
  // Second, try to find each non ".slds-" selector and validate if found
  return validateByClassName(commentsByClass, $rootNode, $)
  .concat(validateByEveryFancyComment(commentsByFancy, $rootNode, $))
  .filter(x => !x.get('valid'))
  .map(result => result.set('elementString', print($, result.get('element'))))
  .map(result => result.update('element', e => e.extract ? e.extract() : e))
}
