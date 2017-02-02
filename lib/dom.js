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
    if (value) {
      return this.wrapper.reduce((a, b) => {
        return a.concat(b.getAttribute(attr))
      }, []).join(' ')
    }
    this.wrapper.forEach(node => {
      node.setAttribute(attr, value)
    })
    return this
  }
  find (selector) {
    return this.wrapper.reduce((a, b) => {
      return a.concat(
        new BrowserDOM(b.querySelectorAll(selector))
      )
    }, BrowserDOM.empty())
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
