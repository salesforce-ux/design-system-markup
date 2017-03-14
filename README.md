# Validation

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
