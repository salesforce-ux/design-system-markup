const Immutable = require('immutable')

module.exports = (comments, $, rootNode) => {
  const commentsBySelector = comments
    .filter(comment => comment.hasIn(['annotations', 'restrict']))
    .reduce((map, comment) => {
      const selectors = comment.get('annotations').get('selector')
        .split(',').map(s => s.trim())
      return selectors.reduce((map, selector) => {
        return map.set(selector, comment)
      }, map)
    }, Immutable.Map())
  const commentsByClass = commentsBySelector.filter((v, k) => {
    return /^\.slds-/.test(k)
  })
  const commentsByOther = commentsBySelector.filter((v, k) => {
    return !/^\.slds-/.test(k)
  })
  // console.log(commentsByClass.keySeq().toJS())
  // console.log(commentsByOther.keySeq().toJS())
  const validateElement = element => {
    const classNames = ($(element).attr('class') || '')
      .split(' ').map(c => `.${c}`)
    return Immutable.List(classNames)
      .filter(className => commentsByClass.has(className))
      .map(className => commentsByClass.get(className))
      .map(comment => {
        const restrict = comment.getIn(['annotations', 'restrict'])
        return $(element).filter(restrict).length > 0
          ? null
          : Immutable.Map({ valid: false, element, restrict })
      })
      .filter(x => x)
  }
  const validate = element => {
    let valid = validateElement(element)
    return valid.concat(
      Immutable.List($(element).children().get()).map(validate).flatten(1)
    )
  }
  // First, recursivley lookup comments by ".slds-" classname and validate
  let a = Immutable.List.of(rootNode)
    .map(element => validate(element))
    .flatten(1)
  // Second, try to find each non ".slds-" selector and validate if found
  let b = commentsByOther
    .filter((value, key) => {
      return !/:focus/.test(key)
    })
    .toList()
    .map(comment => {
      return comment.updateIn(['annotations', 'selector'], selector => {
        return selector.replace(/.+?:focus,?/, '')
      })
    })
    .flatMap(comment => {
      let selector = comment.getIn(['annotations', 'selector'])
      let restrict = comment.getIn(['annotations', 'restrict'])
      let elements = $(rootNode).find(selector)
      if (!elements.length) return Immutable.List()
      return Immutable.List(elements.get()).map(element => {
        let valid = $(element).filter(restrict).length > 0
        return Immutable.Map({
          valid,
          element,
          restrict
        })
      })
    })
  // C
  let invalid = a.concat(b).filter(x => {
    return x.get('valid') === false
  })
  return invalid
}
