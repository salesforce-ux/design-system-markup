const Immutable = require('immutable-ext')
const {fromNullable} = require('data.either')

const splitSelectors = comment =>
  comment
  .get('annotations')
  .get('selector', '')
  .split(',')
  .map(s => s.trim())

const makeSelectorToCommentsMap = comments =>
  comments
  .filter(comment => comment.hasIn(['annotations', 'restrict']))
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

const matchRestrict = ($element, className, comment) =>
  getResult(className, comment.getIn(['annotations', 'restrict']), $element)

const extractClassNames = $element =>
  fromNullable($element.attr('class'))
  .map(str => str.split(' ').map(c => `.${c}`))
  .fold(e => Immutable.List(),
        xs => Immutable.List(xs))

const validateElement = (commentsByClass, $element) =>
  extractClassNames($element)
  .map(className =>
    fromNullable(commentsByClass.get(className))
    .map(comments =>
      comments.foldMap(c =>
        FirstValid(matchRestrict($element, className, c)),
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
      comment.updateIn(['annotations', 'selector'], selector =>
        selector.replace(/.+?:focus,?/, ''))))

const validateByEveryFancyComment = (commentsByFancy, $element, $) =>
  hackToRejectFocusForCheerio(commentsByFancy)
  .toList()
  .flatMap(comments =>
    comments.flatMap(comment => { // wrong prob. We want the first valid per el + rest
      let selector = comment.getIn(['annotations', 'selector'])
      let restrict = comment.getIn(['annotations', 'restrict'])
      let elements = $element.find(selector)
      if (!elements.length) return Immutable.List()
      return Immutable.List(elements.get()).map(el =>
        getResult(selector, restrict, $(el)))
    })
  ).flatten(1)

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
      .match(removeClosingTag(result.get('element')))
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
  .map(result => result.update('element', e => print($, e)))
  .map(result => addLineNumber($rootNode.html(), result))
}