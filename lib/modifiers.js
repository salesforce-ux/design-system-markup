// Copyright (c) 2015-present, salesforce.com, inc. All rights reserved
// Licensed under BSD 3-Clause - see LICENSE.txt or git.io/sfdc-license

const Either = require('data.either')
const Immutable = require('immutable')
const First = x => ({ x, concat: o => First(x) })

const uniqBy = (xs, keyFn) =>
  xs
  .reduceRight((acc, m) =>
    Either.fromNullable(keyFn(m))
    .fold(() => acc.update('result', r => r.push(m)),
      group =>
        acc.get('groups').has(group)
        ? acc
        : acc
        .update('groups', g => g.update(group, () => true))
        .update('result', r => r.push(m))),
    Immutable.Map({groups: Immutable.Map(), result: Immutable.List()}))
  .get('result')

const foldMap = (f, empty, xs) =>
  xs.reduce((acc, x) => acc.concat(f(x)), empty)

const findElementForMod = ($rootNode, modifier) =>
  Either
    .fromNullable(modifier.getIn(['annotations', 'restrict']))
    .chain(selector =>
      Either.try(() => $rootNode.find(selector))()
      .chain(found =>
        found && found.length
          ? Either.Right(found)
          : Either.Left(`Cannot apply ${selector} for ${modifier.getIn(['annotations', 'selector'])}`)))

const getClassName = modifier =>
  modifier.getIn(['annotations', 'selector']).replace('.', '')

const applyModifiers = (modifiers, $rootNode) => {

  const applyModifier = modifier =>
    findElementForMod($rootNode, modifier)
    .map(c => {
      const className = getClassName(modifier)
      return c.addClass(className)
    })

  return foldMap(m =>
    applyModifier(m).map(First),
    Either.Right(First($rootNode)),
    uniqBy(modifiers, m => m.get('group'))
  )
}

const removeModifiers = (modifiers, $rootNode) => {
  const removeModifier = modifier =>
    findElementForMod($rootNode, modifier)
    .map(c => {
      const className = getClassName(modifier)
      return c.removeClass(className)
    })

  return foldMap(m =>
    removeModifier(m).map(First),
    Either.Right(First($rootNode)),
    modifiers
  )
}

module.exports  = {applyModifiers, removeModifiers}
