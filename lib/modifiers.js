const Either = require('data.either')
const I = require('immutable')

const foldMap = (f, empty, xs) =>
  xs.reduce((acc, x) => acc.concat(f(x)), empty)

const findElementForMod = (modifier, findFn) =>
  Either
  .fromNullable(modifier.get('restrict'))
  .chain(restrict =>
    Either.try(findFn)(restrict)
    .chain(found =>
      found && found.length
        ? Either.Right(found)
        : Either.Left(`Cannot apply ${restrict} for ${modifier.get('selector')}`)))

const changeModifier = (modifyFn, findFn) => modifier =>
  findElementForMod(modifier, findFn)
  .chain(els =>
    Either.fromNullable(modifier.get('selector'))
    .map(selector => selector.replace('.', ''))
    .map(className => modifyFn(els, className))
  )
  .fold(e => I.List(),
        () => I.List.of(modifier))

const changeModifiers = modifyFn => (modifiers, $, $rootNode, options = {}) => {
  const findFn = options.single ? (selector) => $rootNode.find(selector).first() : (selector) => $rootNode.find(selector)
  const appliedMods = foldMap(
    changeModifier(modifyFn, findFn),
    I.List(),
    modifiers
  )

  return I.Map({markup: $.html($rootNode), modifiers: appliedMods})
}

const removeModifiers = changeModifiers((el, className) => el.removeClass(className))
const applyModifiers = changeModifiers((el, className) => el.addClass(className))

module.exports = {applyModifiers, removeModifiers}