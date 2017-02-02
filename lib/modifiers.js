const Either = require('data.either')
const First = x => ({ x, concat: o => First(x) })

const foldMap = (f, empty, xs) =>
  xs.reduce((acc, x) => {
    return acc.concat(f(x))
  }, empty)

module.exports = (modifiers, $, rootNode) => {
  const findElementForMod = (modifier) =>
    Either
      .fromNullable(modifier.getIn(['annotations', 'restrict']))
      .chain(selector =>
        Either.try(() => {
          // console.log('--------');
          // console.log(selector);
          // console.log($(rootNode));
          // console.log('WTF', $(rootNode).find(selector));
          return $(rootNode).find(selector)
        })()
        .chain(found =>
          found && found.length
            ? Either.Right(found)
            : Either.Left(`Cannot apply ${selector} for ${modifier.getIn(['annotations', 'selector'])}`)))

  const applyModifier = (modifier) =>
    findElementForMod(modifier)
      .map(c =>
        c.addClass(modifier.getIn(['annotations', 'selector']).replace('.', ''))
      )

  return foldMap(m =>
    applyModifier(m).map(First),
    Either.Right(First($(rootNode))),
    modifiers
  )
}
