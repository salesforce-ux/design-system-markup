class BrowserDOM {
  constructor (node) {
    this.wrapper = node
      ? node.tagName
        ? [node]
        : Array.from(node)
      : []
  }
  get length () {
    return this.wrapper.length
  }
  addClass (className) {
    this.wrapper.forEach(node => {
      node.classList.add(className)
    })
    return this
  }
  removeClass (className) {
    this.wrapper.forEach(node => {
      node.classList.remove(className)
    })
    return this
  }
  attr (attr, value) {
    if (value !== undefined) {
      this.wrapper.forEach(node =>
        value
          ? node.setAttribute(attr, value)
          : node.removeAttribute(attr)
      )
      return this
    }
    return this.wrapper.reduce((a, b) => {
      return a.concat(b.getAttribute(attr))
    }, []).join(' ')
  }
  clone () {
    return this
  }
  first () {
    return new BrowserDOM(this.extract())
  }
  empty () {
    return this
  }
  html () {
    return this.extract().outerHTML
  }
  find (selector) {
    return this.wrapper.reduce((a, b) => {
      return a.concat(
        new BrowserDOM(b.querySelectorAll(selector))
      )
    }, BrowserDOM.empty())
  }
  each (fn) {
    this.wrapper.forEach((node, i) => {
      fn.call(node, i, node)
    })
  }
  filter (selector) {
    return new BrowserDOM(
      this.wrapper.filter(node => node.matches(selector))
    )
  }
  children () {
    return this.wrapper.reduce((a, b) => {
      return a.concat(
        new BrowserDOM(b.children)
      )
    }, BrowserDOM.empty())
  }
  extract (index) {
    return this.wrapper[0]
  }
  get (index) {
    return index !== undefined
      ? this.wrapper[index]
      : this.wrapper
  }
  concat (a) {
    return new BrowserDOM(this.wrapper.concat(a.wrapper))
  }
  static empty () {
    return new BrowserDOM()
  }
}

module.exports = BrowserDOM
