const Immutable = require('immutable-ext')
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
    .reduce((map, selector) =>
      map.set(selector, map.get(selector, Immutable.List()).push(comment)), map), Immutable.Map())

const FirstValid = x =>
({
  x,
  concat: o =>
    x.get('valid') ? FirstValid(x) : o
})
FirstValid.empty = () =>
  FirstValid(Result("", "", null, false))

const Result = (selector, restrict, element, valid) =>
  Immutable.Map({ selector, restrict, element, valid })

const runRestrict = ($element, restrict) =>
  $element.filter(restrict).length > 0

const getResult = (className, restrict, $element) =>
  Result(className, restrict, $element, runRestrict($element, restrict))

const matchRestrict = (className, comment, $element) =>
  getResult(className, comment.get('restrict'), $element)

const extractClassNames = $element =>
  fromFalsy($element.attr('class'))
  .map(str => str.split(' ').map(c => `.${c}`))
  .fold(e => Immutable.List(),
        xs => Immutable.List(xs))

const validateElement = (commentsByClass, $element) =>
  extractClassNames($element)
  .map(className =>
    fromNullable(commentsByClass.get(className))
    .map(comments =>
      comments.foldMap(c =>
        FirstValid(matchRestrict(className, c, $element)),
        FirstValid.empty()).x)
    .fold(e => Result(className, 'Not our class', $element, true),
          r => r))

const getChildren = $element =>
  Immutable.List($element.children().get())

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
    return Immutable.List(elements.get())
    .map($)
    .map($el =>
      comments
      .foldMap(c =>
        FirstValid(matchRestrict(selector, c, $el)),
        FirstValid.empty()).x
    )
  })

// the lines don't match because sometimes > becomes />
const removeClosingTag = x =>
  x.replace(/\/\>$/, '')

const print = ($, $element) =>
  $.html($element.clone().empty()).replace(/<\/.+?>/, '')

const addLineNumber = (html, result) =>
  result.set('lines',
    html
    .split('\n')
    .map((line, i) =>
      removeClosingTag(line)
      .match(removeClosingTag(result.get('elementString')))
      ? i
      : null)
    .filter(x => x))

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
  .map(result => result.update('element', e => e.extract()))
  .map(result => addLineNumber($rootNode.html(), result))
}
