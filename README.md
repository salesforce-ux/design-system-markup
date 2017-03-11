# Validation

1. We set up `commentsBySelector` which is a map of every selector (even , separated ones) pointing to the comment. (e.g. @selector .slds-button, button => {button: comment, .slds-button: comment})
* This looks like it will overwrite things. Prob best to do []

2. We partition `commentsBySelector` into two submaps (`commentsByClass` and `commentsByFancy`) by matching `.slds-` on each key

3. To validate an element
  * Validate normal slds selectors
    * Extract classNames off the element
    * Filter any className that is part of our `commentsBySelector` i.e. part of our system
    * Map those into their cooresponding comments
    * For each comment, get the restrict and use it on the element, and return a list of results: {valid: false, element, restrict} || null
    * Filter only the invalid
  * Validate the "fancy" selectors
    * hack: remove focus for cheerio's sanity
    * throw away the map structure
    * For every comment in "fancy", apply the selector and see if it actually applies since we cannot look up by classname
    * validate like above where we just apply the restrict to each element found

4. To validate the whole tree
  * Validate the root, then flatMap validate the children


