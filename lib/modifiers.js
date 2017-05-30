const Either = require('data.either')
const I = require('immutable')

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
    I.Map({groups: I.Map(), result: I.List()}))
  .get('result')

const foldMap = (f, empty, xs) =>
  xs.reduce((acc, x) => acc.concat(f(x)), empty)

module.exports = (modifiers, $, rootNode) => {
  const findElementForMod = modifier =>
    Either
    .fromNullable(modifier.get('restrict'))
    .chain(selector =>
      Either.try(() => $(rootNode).find(selector))()
      .chain(found =>
        found && found.length
          ? Either.Right(found)
          : Either.Left(`Cannot apply ${selector} for ${modifier.get('selector')}`)))

  const applyModifier = modifier =>
    findElementForMod(modifier)
    .chain(c =>
      Either.fromNullable(modifier.get('selector'))
      .map(selector => selector.replace('.', ''))
      .map(className => c.addClass(className))
    )
    .fold(e => I.List(),
          () => I.List.of(modifier))

  const appliedMods = foldMap(m =>
    applyModifier(m),
    I.List(),
    uniqBy(modifiers, m => m.get('group'))
  )

  return I.Map({markup: $.html($(rootNode)), modifiers: appliedMods})
}
