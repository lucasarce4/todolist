/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/picocolors/picocolors.browser.js":
/*!*******************************************************!*\
  !*** ./node_modules/picocolors/picocolors.browser.js ***!
  \*******************************************************/
/***/ ((module) => {

var x=String;
var create=function() {return {isColorSupported:false,reset:x,bold:x,dim:x,italic:x,underline:x,inverse:x,hidden:x,strikethrough:x,black:x,red:x,green:x,yellow:x,blue:x,magenta:x,cyan:x,white:x,gray:x,bgBlack:x,bgRed:x,bgGreen:x,bgYellow:x,bgBlue:x,bgMagenta:x,bgCyan:x,bgWhite:x}};
module.exports=create();
module.exports.createColors = create;


/***/ }),

/***/ "./node_modules/postcss/lib/at-rule.js":
/*!*********************************************!*\
  !*** ./node_modules/postcss/lib/at-rule.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


let Container = __webpack_require__(/*! ./container */ "./node_modules/postcss/lib/container.js")

class AtRule extends Container {
  constructor(defaults) {
    super(defaults)
    this.type = 'atrule'
  }

  append(...children) {
    if (!this.proxyOf.nodes) this.nodes = []
    return super.append(...children)
  }

  prepend(...children) {
    if (!this.proxyOf.nodes) this.nodes = []
    return super.prepend(...children)
  }
}

module.exports = AtRule
AtRule.default = AtRule

Container.registerAtRule(AtRule)


/***/ }),

/***/ "./node_modules/postcss/lib/comment.js":
/*!*********************************************!*\
  !*** ./node_modules/postcss/lib/comment.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


let Node = __webpack_require__(/*! ./node */ "./node_modules/postcss/lib/node.js")

class Comment extends Node {
  constructor(defaults) {
    super(defaults)
    this.type = 'comment'
  }
}

module.exports = Comment
Comment.default = Comment


/***/ }),

/***/ "./node_modules/postcss/lib/container.js":
/*!***********************************************!*\
  !*** ./node_modules/postcss/lib/container.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


let { isClean, my } = __webpack_require__(/*! ./symbols */ "./node_modules/postcss/lib/symbols.js")
let Declaration = __webpack_require__(/*! ./declaration */ "./node_modules/postcss/lib/declaration.js")
let Comment = __webpack_require__(/*! ./comment */ "./node_modules/postcss/lib/comment.js")
let Node = __webpack_require__(/*! ./node */ "./node_modules/postcss/lib/node.js")

let parse, Rule, AtRule

function cleanSource(nodes) {
  return nodes.map(i => {
    if (i.nodes) i.nodes = cleanSource(i.nodes)
    delete i.source
    return i
  })
}

function markDirtyUp(node) {
  node[isClean] = false
  if (node.proxyOf.nodes) {
    for (let i of node.proxyOf.nodes) {
      markDirtyUp(i)
    }
  }
}

class Container extends Node {
  push(child) {
    child.parent = this
    this.proxyOf.nodes.push(child)
    return this
  }

  each(callback) {
    if (!this.proxyOf.nodes) return undefined
    let iterator = this.getIterator()

    let index, result
    while (this.indexes[iterator] < this.proxyOf.nodes.length) {
      index = this.indexes[iterator]
      result = callback(this.proxyOf.nodes[index], index)
      if (result === false) break

      this.indexes[iterator] += 1
    }

    delete this.indexes[iterator]
    return result
  }

  walk(callback) {
    return this.each((child, i) => {
      let result
      try {
        result = callback(child, i)
      } catch (e) {
        throw child.addToError(e)
      }
      if (result !== false && child.walk) {
        result = child.walk(callback)
      }

      return result
    })
  }

  walkDecls(prop, callback) {
    if (!callback) {
      callback = prop
      return this.walk((child, i) => {
        if (child.type === 'decl') {
          return callback(child, i)
        }
      })
    }
    if (prop instanceof RegExp) {
      return this.walk((child, i) => {
        if (child.type === 'decl' && prop.test(child.prop)) {
          return callback(child, i)
        }
      })
    }
    return this.walk((child, i) => {
      if (child.type === 'decl' && child.prop === prop) {
        return callback(child, i)
      }
    })
  }

  walkRules(selector, callback) {
    if (!callback) {
      callback = selector

      return this.walk((child, i) => {
        if (child.type === 'rule') {
          return callback(child, i)
        }
      })
    }
    if (selector instanceof RegExp) {
      return this.walk((child, i) => {
        if (child.type === 'rule' && selector.test(child.selector)) {
          return callback(child, i)
        }
      })
    }
    return this.walk((child, i) => {
      if (child.type === 'rule' && child.selector === selector) {
        return callback(child, i)
      }
    })
  }

  walkAtRules(name, callback) {
    if (!callback) {
      callback = name
      return this.walk((child, i) => {
        if (child.type === 'atrule') {
          return callback(child, i)
        }
      })
    }
    if (name instanceof RegExp) {
      return this.walk((child, i) => {
        if (child.type === 'atrule' && name.test(child.name)) {
          return callback(child, i)
        }
      })
    }
    return this.walk((child, i) => {
      if (child.type === 'atrule' && child.name === name) {
        return callback(child, i)
      }
    })
  }

  walkComments(callback) {
    return this.walk((child, i) => {
      if (child.type === 'comment') {
        return callback(child, i)
      }
    })
  }

  append(...children) {
    for (let child of children) {
      let nodes = this.normalize(child, this.last)
      for (let node of nodes) this.proxyOf.nodes.push(node)
    }

    this.markDirty()

    return this
  }

  prepend(...children) {
    children = children.reverse()
    for (let child of children) {
      let nodes = this.normalize(child, this.first, 'prepend').reverse()
      for (let node of nodes) this.proxyOf.nodes.unshift(node)
      for (let id in this.indexes) {
        this.indexes[id] = this.indexes[id] + nodes.length
      }
    }

    this.markDirty()

    return this
  }

  cleanRaws(keepBetween) {
    super.cleanRaws(keepBetween)
    if (this.nodes) {
      for (let node of this.nodes) node.cleanRaws(keepBetween)
    }
  }

  insertBefore(exist, add) {
    exist = this.index(exist)

    let type = exist === 0 ? 'prepend' : false
    let nodes = this.normalize(add, this.proxyOf.nodes[exist], type).reverse()
    for (let node of nodes) this.proxyOf.nodes.splice(exist, 0, node)

    let index
    for (let id in this.indexes) {
      index = this.indexes[id]
      if (exist <= index) {
        this.indexes[id] = index + nodes.length
      }
    }

    this.markDirty()

    return this
  }

  insertAfter(exist, add) {
    exist = this.index(exist)

    let nodes = this.normalize(add, this.proxyOf.nodes[exist]).reverse()
    for (let node of nodes) this.proxyOf.nodes.splice(exist + 1, 0, node)

    let index
    for (let id in this.indexes) {
      index = this.indexes[id]
      if (exist < index) {
        this.indexes[id] = index + nodes.length
      }
    }

    this.markDirty()

    return this
  }

  removeChild(child) {
    child = this.index(child)
    this.proxyOf.nodes[child].parent = undefined
    this.proxyOf.nodes.splice(child, 1)

    let index
    for (let id in this.indexes) {
      index = this.indexes[id]
      if (index >= child) {
        this.indexes[id] = index - 1
      }
    }

    this.markDirty()

    return this
  }

  removeAll() {
    for (let node of this.proxyOf.nodes) node.parent = undefined
    this.proxyOf.nodes = []

    this.markDirty()

    return this
  }

  replaceValues(pattern, opts, callback) {
    if (!callback) {
      callback = opts
      opts = {}
    }

    this.walkDecls(decl => {
      if (opts.props && !opts.props.includes(decl.prop)) return
      if (opts.fast && !decl.value.includes(opts.fast)) return

      decl.value = decl.value.replace(pattern, callback)
    })

    this.markDirty()

    return this
  }

  every(condition) {
    return this.nodes.every(condition)
  }

  some(condition) {
    return this.nodes.some(condition)
  }

  index(child) {
    if (typeof child === 'number') return child
    if (child.proxyOf) child = child.proxyOf
    return this.proxyOf.nodes.indexOf(child)
  }

  get first() {
    if (!this.proxyOf.nodes) return undefined
    return this.proxyOf.nodes[0]
  }

  get last() {
    if (!this.proxyOf.nodes) return undefined
    return this.proxyOf.nodes[this.proxyOf.nodes.length - 1]
  }

  normalize(nodes, sample) {
    if (typeof nodes === 'string') {
      nodes = cleanSource(parse(nodes).nodes)
    } else if (Array.isArray(nodes)) {
      nodes = nodes.slice(0)
      for (let i of nodes) {
        if (i.parent) i.parent.removeChild(i, 'ignore')
      }
    } else if (nodes.type === 'root' && this.type !== 'document') {
      nodes = nodes.nodes.slice(0)
      for (let i of nodes) {
        if (i.parent) i.parent.removeChild(i, 'ignore')
      }
    } else if (nodes.type) {
      nodes = [nodes]
    } else if (nodes.prop) {
      if (typeof nodes.value === 'undefined') {
        throw new Error('Value field is missed in node creation')
      } else if (typeof nodes.value !== 'string') {
        nodes.value = String(nodes.value)
      }
      nodes = [new Declaration(nodes)]
    } else if (nodes.selector) {
      nodes = [new Rule(nodes)]
    } else if (nodes.name) {
      nodes = [new AtRule(nodes)]
    } else if (nodes.text) {
      nodes = [new Comment(nodes)]
    } else {
      throw new Error('Unknown node type in node creation')
    }

    let processed = nodes.map(i => {
      /* c8 ignore next */
      if (!i[my]) Container.rebuild(i)
      i = i.proxyOf
      if (i.parent) i.parent.removeChild(i)
      if (i[isClean]) markDirtyUp(i)
      if (typeof i.raws.before === 'undefined') {
        if (sample && typeof sample.raws.before !== 'undefined') {
          i.raws.before = sample.raws.before.replace(/\S/g, '')
        }
      }
      i.parent = this
      return i
    })

    return processed
  }

  getProxyProcessor() {
    return {
      set(node, prop, value) {
        if (node[prop] === value) return true
        node[prop] = value
        if (prop === 'name' || prop === 'params' || prop === 'selector') {
          node.markDirty()
        }
        return true
      },

      get(node, prop) {
        if (prop === 'proxyOf') {
          return node
        } else if (!node[prop]) {
          return node[prop]
        } else if (
          prop === 'each' ||
          (typeof prop === 'string' && prop.startsWith('walk'))
        ) {
          return (...args) => {
            return node[prop](
              ...args.map(i => {
                if (typeof i === 'function') {
                  return (child, index) => i(child.toProxy(), index)
                } else {
                  return i
                }
              })
            )
          }
        } else if (prop === 'every' || prop === 'some') {
          return cb => {
            return node[prop]((child, ...other) =>
              cb(child.toProxy(), ...other)
            )
          }
        } else if (prop === 'root') {
          return () => node.root().toProxy()
        } else if (prop === 'nodes') {
          return node.nodes.map(i => i.toProxy())
        } else if (prop === 'first' || prop === 'last') {
          return node[prop].toProxy()
        } else {
          return node[prop]
        }
      }
    }
  }

  getIterator() {
    if (!this.lastEach) this.lastEach = 0
    if (!this.indexes) this.indexes = {}

    this.lastEach += 1
    let iterator = this.lastEach
    this.indexes[iterator] = 0

    return iterator
  }
}

Container.registerParse = dependant => {
  parse = dependant
}

Container.registerRule = dependant => {
  Rule = dependant
}

Container.registerAtRule = dependant => {
  AtRule = dependant
}

module.exports = Container
Container.default = Container

/* c8 ignore start */
Container.rebuild = node => {
  if (node.type === 'atrule') {
    Object.setPrototypeOf(node, AtRule.prototype)
  } else if (node.type === 'rule') {
    Object.setPrototypeOf(node, Rule.prototype)
  } else if (node.type === 'decl') {
    Object.setPrototypeOf(node, Declaration.prototype)
  } else if (node.type === 'comment') {
    Object.setPrototypeOf(node, Comment.prototype)
  }

  node[my] = true

  if (node.nodes) {
    node.nodes.forEach(child => {
      Container.rebuild(child)
    })
  }
}
/* c8 ignore stop */


/***/ }),

/***/ "./node_modules/postcss/lib/css-syntax-error.js":
/*!******************************************************!*\
  !*** ./node_modules/postcss/lib/css-syntax-error.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


let pico = __webpack_require__(/*! picocolors */ "./node_modules/picocolors/picocolors.browser.js")

let terminalHighlight = __webpack_require__(/*! ./terminal-highlight */ "?5580")

class CssSyntaxError extends Error {
  constructor(message, line, column, source, file, plugin) {
    super(message)
    this.name = 'CssSyntaxError'
    this.reason = message

    if (file) {
      this.file = file
    }
    if (source) {
      this.source = source
    }
    if (plugin) {
      this.plugin = plugin
    }
    if (typeof line !== 'undefined' && typeof column !== 'undefined') {
      if (typeof line === 'number') {
        this.line = line
        this.column = column
      } else {
        this.line = line.line
        this.column = line.column
        this.endLine = column.line
        this.endColumn = column.column
      }
    }

    this.setMessage()

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CssSyntaxError)
    }
  }

  setMessage() {
    this.message = this.plugin ? this.plugin + ': ' : ''
    this.message += this.file ? this.file : '<css input>'
    if (typeof this.line !== 'undefined') {
      this.message += ':' + this.line + ':' + this.column
    }
    this.message += ': ' + this.reason
  }

  showSourceCode(color) {
    if (!this.source) return ''

    let css = this.source
    if (color == null) color = pico.isColorSupported
    if (terminalHighlight) {
      if (color) css = terminalHighlight(css)
    }

    let lines = css.split(/\r?\n/)
    let start = Math.max(this.line - 3, 0)
    let end = Math.min(this.line + 2, lines.length)

    let maxWidth = String(end).length

    let mark, aside
    if (color) {
      let { bold, red, gray } = pico.createColors(true)
      mark = text => bold(red(text))
      aside = text => gray(text)
    } else {
      mark = aside = str => str
    }

    return lines
      .slice(start, end)
      .map((line, index) => {
        let number = start + 1 + index
        let gutter = ' ' + (' ' + number).slice(-maxWidth) + ' | '
        if (number === this.line) {
          let spacing =
            aside(gutter.replace(/\d/g, ' ')) +
            line.slice(0, this.column - 1).replace(/[^\t]/g, ' ')
          return mark('>') + aside(gutter) + line + '\n ' + spacing + mark('^')
        }
        return ' ' + aside(gutter) + line
      })
      .join('\n')
  }

  toString() {
    let code = this.showSourceCode()
    if (code) {
      code = '\n\n' + code + '\n'
    }
    return this.name + ': ' + this.message + code
  }
}

module.exports = CssSyntaxError
CssSyntaxError.default = CssSyntaxError


/***/ }),

/***/ "./node_modules/postcss/lib/declaration.js":
/*!*************************************************!*\
  !*** ./node_modules/postcss/lib/declaration.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


let Node = __webpack_require__(/*! ./node */ "./node_modules/postcss/lib/node.js")

class Declaration extends Node {
  constructor(defaults) {
    if (
      defaults &&
      typeof defaults.value !== 'undefined' &&
      typeof defaults.value !== 'string'
    ) {
      defaults = { ...defaults, value: String(defaults.value) }
    }
    super(defaults)
    this.type = 'decl'
  }

  get variable() {
    return this.prop.startsWith('--') || this.prop[0] === '$'
  }
}

module.exports = Declaration
Declaration.default = Declaration


/***/ }),

/***/ "./node_modules/postcss/lib/document.js":
/*!**********************************************!*\
  !*** ./node_modules/postcss/lib/document.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


let Container = __webpack_require__(/*! ./container */ "./node_modules/postcss/lib/container.js")

let LazyResult, Processor

class Document extends Container {
  constructor(defaults) {
    // type needs to be passed to super, otherwise child roots won't be normalized correctly
    super({ type: 'document', ...defaults })

    if (!this.nodes) {
      this.nodes = []
    }
  }

  toResult(opts = {}) {
    let lazy = new LazyResult(new Processor(), this, opts)

    return lazy.stringify()
  }
}

Document.registerLazyResult = dependant => {
  LazyResult = dependant
}

Document.registerProcessor = dependant => {
  Processor = dependant
}

module.exports = Document
Document.default = Document


/***/ }),

/***/ "./node_modules/postcss/lib/fromJSON.js":
/*!**********************************************!*\
  !*** ./node_modules/postcss/lib/fromJSON.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


let Declaration = __webpack_require__(/*! ./declaration */ "./node_modules/postcss/lib/declaration.js")
let PreviousMap = __webpack_require__(/*! ./previous-map */ "./node_modules/postcss/lib/previous-map.js")
let Comment = __webpack_require__(/*! ./comment */ "./node_modules/postcss/lib/comment.js")
let AtRule = __webpack_require__(/*! ./at-rule */ "./node_modules/postcss/lib/at-rule.js")
let Input = __webpack_require__(/*! ./input */ "./node_modules/postcss/lib/input.js")
let Root = __webpack_require__(/*! ./root */ "./node_modules/postcss/lib/root.js")
let Rule = __webpack_require__(/*! ./rule */ "./node_modules/postcss/lib/rule.js")

function fromJSON(json, inputs) {
  if (Array.isArray(json)) return json.map(n => fromJSON(n))

  let { inputs: ownInputs, ...defaults } = json
  if (ownInputs) {
    inputs = []
    for (let input of ownInputs) {
      let inputHydrated = { ...input, __proto__: Input.prototype }
      if (inputHydrated.map) {
        inputHydrated.map = {
          ...inputHydrated.map,
          __proto__: PreviousMap.prototype
        }
      }
      inputs.push(inputHydrated)
    }
  }
  if (defaults.nodes) {
    defaults.nodes = json.nodes.map(n => fromJSON(n, inputs))
  }
  if (defaults.source) {
    let { inputId, ...source } = defaults.source
    defaults.source = source
    if (inputId != null) {
      defaults.source.input = inputs[inputId]
    }
  }
  if (defaults.type === 'root') {
    return new Root(defaults)
  } else if (defaults.type === 'decl') {
    return new Declaration(defaults)
  } else if (defaults.type === 'rule') {
    return new Rule(defaults)
  } else if (defaults.type === 'comment') {
    return new Comment(defaults)
  } else if (defaults.type === 'atrule') {
    return new AtRule(defaults)
  } else {
    throw new Error('Unknown node type: ' + json.type)
  }
}

module.exports = fromJSON
fromJSON.default = fromJSON


/***/ }),

/***/ "./node_modules/postcss/lib/input.js":
/*!*******************************************!*\
  !*** ./node_modules/postcss/lib/input.js ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


let { SourceMapConsumer, SourceMapGenerator } = __webpack_require__(/*! source-map-js */ "?b8cb")
let { fileURLToPath, pathToFileURL } = __webpack_require__(/*! url */ "?c717")
let { resolve, isAbsolute } = __webpack_require__(/*! path */ "?6197")
let { nanoid } = __webpack_require__(/*! nanoid/non-secure */ "./node_modules/nanoid/non-secure/index.cjs")

let terminalHighlight = __webpack_require__(/*! ./terminal-highlight */ "?5580")
let CssSyntaxError = __webpack_require__(/*! ./css-syntax-error */ "./node_modules/postcss/lib/css-syntax-error.js")
let PreviousMap = __webpack_require__(/*! ./previous-map */ "./node_modules/postcss/lib/previous-map.js")

let fromOffsetCache = Symbol('fromOffsetCache')

let sourceMapAvailable = Boolean(SourceMapConsumer && SourceMapGenerator)
let pathAvailable = Boolean(resolve && isAbsolute)

class Input {
  constructor(css, opts = {}) {
    if (
      css === null ||
      typeof css === 'undefined' ||
      (typeof css === 'object' && !css.toString)
    ) {
      throw new Error(`PostCSS received ${css} instead of CSS string`)
    }

    this.css = css.toString()

    if (this.css[0] === '\uFEFF' || this.css[0] === '\uFFFE') {
      this.hasBOM = true
      this.css = this.css.slice(1)
    } else {
      this.hasBOM = false
    }

    if (opts.from) {
      if (
        !pathAvailable ||
        /^\w+:\/\//.test(opts.from) ||
        isAbsolute(opts.from)
      ) {
        this.file = opts.from
      } else {
        this.file = resolve(opts.from)
      }
    }

    if (pathAvailable && sourceMapAvailable) {
      let map = new PreviousMap(this.css, opts)
      if (map.text) {
        this.map = map
        let file = map.consumer().file
        if (!this.file && file) this.file = this.mapResolve(file)
      }
    }

    if (!this.file) {
      this.id = '<input css ' + nanoid(6) + '>'
    }
    if (this.map) this.map.file = this.from
  }

  fromOffset(offset) {
    let lastLine, lineToIndex
    if (!this[fromOffsetCache]) {
      let lines = this.css.split('\n')
      lineToIndex = new Array(lines.length)
      let prevIndex = 0

      for (let i = 0, l = lines.length; i < l; i++) {
        lineToIndex[i] = prevIndex
        prevIndex += lines[i].length + 1
      }

      this[fromOffsetCache] = lineToIndex
    } else {
      lineToIndex = this[fromOffsetCache]
    }
    lastLine = lineToIndex[lineToIndex.length - 1]

    let min = 0
    if (offset >= lastLine) {
      min = lineToIndex.length - 1
    } else {
      let max = lineToIndex.length - 2
      let mid
      while (min < max) {
        mid = min + ((max - min) >> 1)
        if (offset < lineToIndex[mid]) {
          max = mid - 1
        } else if (offset >= lineToIndex[mid + 1]) {
          min = mid + 1
        } else {
          min = mid
          break
        }
      }
    }
    return {
      line: min + 1,
      col: offset - lineToIndex[min] + 1
    }
  }

  error(message, line, column, opts = {}) {
    let result, endLine, endColumn

    if (line && typeof line === 'object') {
      let start = line
      let end = column
      if (typeof line.offset === 'number') {
        let pos = this.fromOffset(start.offset)
        line = pos.line
        column = pos.col
      } else {
        line = start.line
        column = start.column
      }
      if (typeof end.offset === 'number') {
        let pos = this.fromOffset(end.offset)
        endLine = pos.line
        endColumn = pos.col
      } else {
        endLine = end.line
        endColumn = end.column
      }
    } else if (!column) {
      let pos = this.fromOffset(line)
      line = pos.line
      column = pos.col
    }

    let origin = this.origin(line, column, endLine, endColumn)
    if (origin) {
      result = new CssSyntaxError(
        message,
        origin.endLine === undefined
          ? origin.line
          : { line: origin.line, column: origin.column },
        origin.endLine === undefined
          ? origin.column
          : { line: origin.endLine, column: origin.endColumn },
        origin.source,
        origin.file,
        opts.plugin
      )
    } else {
      result = new CssSyntaxError(
        message,
        endLine === undefined ? line : { line, column },
        endLine === undefined ? column : { line: endLine, column: endColumn },
        this.css,
        this.file,
        opts.plugin
      )
    }

    result.input = { line, column, endLine, endColumn, source: this.css }
    if (this.file) {
      if (pathToFileURL) {
        result.input.url = pathToFileURL(this.file).toString()
      }
      result.input.file = this.file
    }

    return result
  }

  origin(line, column, endLine, endColumn) {
    if (!this.map) return false
    let consumer = this.map.consumer()

    let from = consumer.originalPositionFor({ line, column })
    if (!from.source) return false

    let to
    if (typeof endLine === 'number') {
      to = consumer.originalPositionFor({ line: endLine, column: endColumn })
    }

    let fromUrl

    if (isAbsolute(from.source)) {
      fromUrl = pathToFileURL(from.source)
    } else {
      fromUrl = new URL(
        from.source,
        this.map.consumer().sourceRoot || pathToFileURL(this.map.mapFile)
      )
    }

    let result = {
      url: fromUrl.toString(),
      line: from.line,
      column: from.column,
      endLine: to && to.line,
      endColumn: to && to.column
    }

    if (fromUrl.protocol === 'file:') {
      if (fileURLToPath) {
        result.file = fileURLToPath(fromUrl)
      } else {
        /* c8 ignore next 2 */
        throw new Error(`file: protocol is not available in this PostCSS build`)
      }
    }

    let source = consumer.sourceContentFor(from.source)
    if (source) result.source = source

    return result
  }

  mapResolve(file) {
    if (/^\w+:\/\//.test(file)) {
      return file
    }
    return resolve(this.map.consumer().sourceRoot || this.map.root || '.', file)
  }

  get from() {
    return this.file || this.id
  }

  toJSON() {
    let json = {}
    for (let name of ['hasBOM', 'css', 'file', 'id']) {
      if (this[name] != null) {
        json[name] = this[name]
      }
    }
    if (this.map) {
      json.map = { ...this.map }
      if (json.map.consumerCache) {
        json.map.consumerCache = undefined
      }
    }
    return json
  }
}

module.exports = Input
Input.default = Input

if (terminalHighlight && terminalHighlight.registerInput) {
  terminalHighlight.registerInput(Input)
}


/***/ }),

/***/ "./node_modules/postcss/lib/lazy-result.js":
/*!*************************************************!*\
  !*** ./node_modules/postcss/lib/lazy-result.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


let { isClean, my } = __webpack_require__(/*! ./symbols */ "./node_modules/postcss/lib/symbols.js")
let MapGenerator = __webpack_require__(/*! ./map-generator */ "./node_modules/postcss/lib/map-generator.js")
let stringify = __webpack_require__(/*! ./stringify */ "./node_modules/postcss/lib/stringify.js")
let Container = __webpack_require__(/*! ./container */ "./node_modules/postcss/lib/container.js")
let Document = __webpack_require__(/*! ./document */ "./node_modules/postcss/lib/document.js")
let warnOnce = __webpack_require__(/*! ./warn-once */ "./node_modules/postcss/lib/warn-once.js")
let Result = __webpack_require__(/*! ./result */ "./node_modules/postcss/lib/result.js")
let parse = __webpack_require__(/*! ./parse */ "./node_modules/postcss/lib/parse.js")
let Root = __webpack_require__(/*! ./root */ "./node_modules/postcss/lib/root.js")

const TYPE_TO_CLASS_NAME = {
  document: 'Document',
  root: 'Root',
  atrule: 'AtRule',
  rule: 'Rule',
  decl: 'Declaration',
  comment: 'Comment'
}

const PLUGIN_PROPS = {
  postcssPlugin: true,
  prepare: true,
  Once: true,
  Document: true,
  Root: true,
  Declaration: true,
  Rule: true,
  AtRule: true,
  Comment: true,
  DeclarationExit: true,
  RuleExit: true,
  AtRuleExit: true,
  CommentExit: true,
  RootExit: true,
  DocumentExit: true,
  OnceExit: true
}

const NOT_VISITORS = {
  postcssPlugin: true,
  prepare: true,
  Once: true
}

const CHILDREN = 0

function isPromise(obj) {
  return typeof obj === 'object' && typeof obj.then === 'function'
}

function getEvents(node) {
  let key = false
  let type = TYPE_TO_CLASS_NAME[node.type]
  if (node.type === 'decl') {
    key = node.prop.toLowerCase()
  } else if (node.type === 'atrule') {
    key = node.name.toLowerCase()
  }

  if (key && node.append) {
    return [
      type,
      type + '-' + key,
      CHILDREN,
      type + 'Exit',
      type + 'Exit-' + key
    ]
  } else if (key) {
    return [type, type + '-' + key, type + 'Exit', type + 'Exit-' + key]
  } else if (node.append) {
    return [type, CHILDREN, type + 'Exit']
  } else {
    return [type, type + 'Exit']
  }
}

function toStack(node) {
  let events
  if (node.type === 'document') {
    events = ['Document', CHILDREN, 'DocumentExit']
  } else if (node.type === 'root') {
    events = ['Root', CHILDREN, 'RootExit']
  } else {
    events = getEvents(node)
  }

  return {
    node,
    events,
    eventIndex: 0,
    visitors: [],
    visitorIndex: 0,
    iterator: 0
  }
}

function cleanMarks(node) {
  node[isClean] = false
  if (node.nodes) node.nodes.forEach(i => cleanMarks(i))
  return node
}

let postcss = {}

class LazyResult {
  constructor(processor, css, opts) {
    this.stringified = false
    this.processed = false

    let root
    if (
      typeof css === 'object' &&
      css !== null &&
      (css.type === 'root' || css.type === 'document')
    ) {
      root = cleanMarks(css)
    } else if (css instanceof LazyResult || css instanceof Result) {
      root = cleanMarks(css.root)
      if (css.map) {
        if (typeof opts.map === 'undefined') opts.map = {}
        if (!opts.map.inline) opts.map.inline = false
        opts.map.prev = css.map
      }
    } else {
      let parser = parse
      if (opts.syntax) parser = opts.syntax.parse
      if (opts.parser) parser = opts.parser
      if (parser.parse) parser = parser.parse

      try {
        root = parser(css, opts)
      } catch (error) {
        this.processed = true
        this.error = error
      }

      if (root && !root[my]) {
        /* c8 ignore next 2 */
        Container.rebuild(root)
      }
    }

    this.result = new Result(processor, root, opts)
    this.helpers = { ...postcss, result: this.result, postcss }
    this.plugins = this.processor.plugins.map(plugin => {
      if (typeof plugin === 'object' && plugin.prepare) {
        return { ...plugin, ...plugin.prepare(this.result) }
      } else {
        return plugin
      }
    })
  }

  get [Symbol.toStringTag]() {
    return 'LazyResult'
  }

  get processor() {
    return this.result.processor
  }

  get opts() {
    return this.result.opts
  }

  get css() {
    return this.stringify().css
  }

  get content() {
    return this.stringify().content
  }

  get map() {
    return this.stringify().map
  }

  get root() {
    return this.sync().root
  }

  get messages() {
    return this.sync().messages
  }

  warnings() {
    return this.sync().warnings()
  }

  toString() {
    return this.css
  }

  then(onFulfilled, onRejected) {
    if (true) {
      if (!('from' in this.opts)) {
        warnOnce(
          'Without `from` option PostCSS could generate wrong source map ' +
            'and will not find Browserslist config. Set it to CSS file path ' +
            'or to `undefined` to prevent this warning.'
        )
      }
    }
    return this.async().then(onFulfilled, onRejected)
  }

  catch(onRejected) {
    return this.async().catch(onRejected)
  }

  finally(onFinally) {
    return this.async().then(onFinally, onFinally)
  }

  async() {
    if (this.error) return Promise.reject(this.error)
    if (this.processed) return Promise.resolve(this.result)
    if (!this.processing) {
      this.processing = this.runAsync()
    }
    return this.processing
  }

  sync() {
    if (this.error) throw this.error
    if (this.processed) return this.result
    this.processed = true

    if (this.processing) {
      throw this.getAsyncError()
    }

    for (let plugin of this.plugins) {
      let promise = this.runOnRoot(plugin)
      if (isPromise(promise)) {
        throw this.getAsyncError()
      }
    }

    this.prepareVisitors()
    if (this.hasListener) {
      let root = this.result.root
      while (!root[isClean]) {
        root[isClean] = true
        this.walkSync(root)
      }
      if (this.listeners.OnceExit) {
        if (root.type === 'document') {
          for (let subRoot of root.nodes) {
            this.visitSync(this.listeners.OnceExit, subRoot)
          }
        } else {
          this.visitSync(this.listeners.OnceExit, root)
        }
      }
    }

    return this.result
  }

  stringify() {
    if (this.error) throw this.error
    if (this.stringified) return this.result
    this.stringified = true

    this.sync()

    let opts = this.result.opts
    let str = stringify
    if (opts.syntax) str = opts.syntax.stringify
    if (opts.stringifier) str = opts.stringifier
    if (str.stringify) str = str.stringify

    let map = new MapGenerator(str, this.result.root, this.result.opts)
    let data = map.generate()
    this.result.css = data[0]
    this.result.map = data[1]

    return this.result
  }

  walkSync(node) {
    node[isClean] = true
    let events = getEvents(node)
    for (let event of events) {
      if (event === CHILDREN) {
        if (node.nodes) {
          node.each(child => {
            if (!child[isClean]) this.walkSync(child)
          })
        }
      } else {
        let visitors = this.listeners[event]
        if (visitors) {
          if (this.visitSync(visitors, node.toProxy())) return
        }
      }
    }
  }

  visitSync(visitors, node) {
    for (let [plugin, visitor] of visitors) {
      this.result.lastPlugin = plugin
      let promise
      try {
        promise = visitor(node, this.helpers)
      } catch (e) {
        throw this.handleError(e, node.proxyOf)
      }
      if (node.type !== 'root' && node.type !== 'document' && !node.parent) {
        return true
      }
      if (isPromise(promise)) {
        throw this.getAsyncError()
      }
    }
  }

  runOnRoot(plugin) {
    this.result.lastPlugin = plugin
    try {
      if (typeof plugin === 'object' && plugin.Once) {
        if (this.result.root.type === 'document') {
          let roots = this.result.root.nodes.map(root =>
            plugin.Once(root, this.helpers)
          )

          if (isPromise(roots[0])) {
            return Promise.all(roots)
          }

          return roots
        }

        return plugin.Once(this.result.root, this.helpers)
      } else if (typeof plugin === 'function') {
        return plugin(this.result.root, this.result)
      }
    } catch (error) {
      throw this.handleError(error)
    }
  }

  getAsyncError() {
    throw new Error('Use process(css).then(cb) to work with async plugins')
  }

  handleError(error, node) {
    let plugin = this.result.lastPlugin
    try {
      if (node) node.addToError(error)
      this.error = error
      if (error.name === 'CssSyntaxError' && !error.plugin) {
        error.plugin = plugin.postcssPlugin
        error.setMessage()
      } else if (plugin.postcssVersion) {
        if (true) {
          let pluginName = plugin.postcssPlugin
          let pluginVer = plugin.postcssVersion
          let runtimeVer = this.result.processor.version
          let a = pluginVer.split('.')
          let b = runtimeVer.split('.')

          if (a[0] !== b[0] || parseInt(a[1]) > parseInt(b[1])) {
            // eslint-disable-next-line no-console
            console.error(
              'Unknown error from PostCSS plugin. Your current PostCSS ' +
                'version is ' +
                runtimeVer +
                ', but ' +
                pluginName +
                ' uses ' +
                pluginVer +
                '. Perhaps this is the source of the error below.'
            )
          }
        }
      }
    } catch (err) {
      /* c8 ignore next 3 */
      // eslint-disable-next-line no-console
      if (console && console.error) console.error(err)
    }
    return error
  }

  async runAsync() {
    this.plugin = 0
    for (let i = 0; i < this.plugins.length; i++) {
      let plugin = this.plugins[i]
      let promise = this.runOnRoot(plugin)
      if (isPromise(promise)) {
        try {
          await promise
        } catch (error) {
          throw this.handleError(error)
        }
      }
    }

    this.prepareVisitors()
    if (this.hasListener) {
      let root = this.result.root
      while (!root[isClean]) {
        root[isClean] = true
        let stack = [toStack(root)]
        while (stack.length > 0) {
          let promise = this.visitTick(stack)
          if (isPromise(promise)) {
            try {
              await promise
            } catch (e) {
              let node = stack[stack.length - 1].node
              throw this.handleError(e, node)
            }
          }
        }
      }

      if (this.listeners.OnceExit) {
        for (let [plugin, visitor] of this.listeners.OnceExit) {
          this.result.lastPlugin = plugin
          try {
            if (root.type === 'document') {
              let roots = root.nodes.map(subRoot =>
                visitor(subRoot, this.helpers)
              )

              await Promise.all(roots)
            } else {
              await visitor(root, this.helpers)
            }
          } catch (e) {
            throw this.handleError(e)
          }
        }
      }
    }

    this.processed = true
    return this.stringify()
  }

  prepareVisitors() {
    this.listeners = {}
    let add = (plugin, type, cb) => {
      if (!this.listeners[type]) this.listeners[type] = []
      this.listeners[type].push([plugin, cb])
    }
    for (let plugin of this.plugins) {
      if (typeof plugin === 'object') {
        for (let event in plugin) {
          if (!PLUGIN_PROPS[event] && /^[A-Z]/.test(event)) {
            throw new Error(
              `Unknown event ${event} in ${plugin.postcssPlugin}. ` +
                `Try to update PostCSS (${this.processor.version} now).`
            )
          }
          if (!NOT_VISITORS[event]) {
            if (typeof plugin[event] === 'object') {
              for (let filter in plugin[event]) {
                if (filter === '*') {
                  add(plugin, event, plugin[event][filter])
                } else {
                  add(
                    plugin,
                    event + '-' + filter.toLowerCase(),
                    plugin[event][filter]
                  )
                }
              }
            } else if (typeof plugin[event] === 'function') {
              add(plugin, event, plugin[event])
            }
          }
        }
      }
    }
    this.hasListener = Object.keys(this.listeners).length > 0
  }

  visitTick(stack) {
    let visit = stack[stack.length - 1]
    let { node, visitors } = visit

    if (node.type !== 'root' && node.type !== 'document' && !node.parent) {
      stack.pop()
      return
    }

    if (visitors.length > 0 && visit.visitorIndex < visitors.length) {
      let [plugin, visitor] = visitors[visit.visitorIndex]
      visit.visitorIndex += 1
      if (visit.visitorIndex === visitors.length) {
        visit.visitors = []
        visit.visitorIndex = 0
      }
      this.result.lastPlugin = plugin
      try {
        return visitor(node.toProxy(), this.helpers)
      } catch (e) {
        throw this.handleError(e, node)
      }
    }

    if (visit.iterator !== 0) {
      let iterator = visit.iterator
      let child
      while ((child = node.nodes[node.indexes[iterator]])) {
        node.indexes[iterator] += 1
        if (!child[isClean]) {
          child[isClean] = true
          stack.push(toStack(child))
          return
        }
      }
      visit.iterator = 0
      delete node.indexes[iterator]
    }

    let events = visit.events
    while (visit.eventIndex < events.length) {
      let event = events[visit.eventIndex]
      visit.eventIndex += 1
      if (event === CHILDREN) {
        if (node.nodes && node.nodes.length) {
          node[isClean] = true
          visit.iterator = node.getIterator()
        }
        return
      } else if (this.listeners[event]) {
        visit.visitors = this.listeners[event]
        return
      }
    }
    stack.pop()
  }
}

LazyResult.registerPostcss = dependant => {
  postcss = dependant
}

module.exports = LazyResult
LazyResult.default = LazyResult

Root.registerLazyResult(LazyResult)
Document.registerLazyResult(LazyResult)


/***/ }),

/***/ "./node_modules/postcss/lib/list.js":
/*!******************************************!*\
  !*** ./node_modules/postcss/lib/list.js ***!
  \******************************************/
/***/ ((module) => {

"use strict";


let list = {
  split(string, separators, last) {
    let array = []
    let current = ''
    let split = false

    let func = 0
    let quote = false
    let escape = false

    for (let letter of string) {
      if (escape) {
        escape = false
      } else if (letter === '\\') {
        escape = true
      } else if (quote) {
        if (letter === quote) {
          quote = false
        }
      } else if (letter === '"' || letter === "'") {
        quote = letter
      } else if (letter === '(') {
        func += 1
      } else if (letter === ')') {
        if (func > 0) func -= 1
      } else if (func === 0) {
        if (separators.includes(letter)) split = true
      }

      if (split) {
        if (current !== '') array.push(current.trim())
        current = ''
        split = false
      } else {
        current += letter
      }
    }

    if (last || current !== '') array.push(current.trim())
    return array
  },

  space(string) {
    let spaces = [' ', '\n', '\t']
    return list.split(string, spaces)
  },

  comma(string) {
    return list.split(string, [','], true)
  }
}

module.exports = list
list.default = list


/***/ }),

/***/ "./node_modules/postcss/lib/map-generator.js":
/*!***************************************************!*\
  !*** ./node_modules/postcss/lib/map-generator.js ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


let { SourceMapConsumer, SourceMapGenerator } = __webpack_require__(/*! source-map-js */ "?b8cb")
let { dirname, resolve, relative, sep } = __webpack_require__(/*! path */ "?6197")
let { pathToFileURL } = __webpack_require__(/*! url */ "?c717")

let Input = __webpack_require__(/*! ./input */ "./node_modules/postcss/lib/input.js")

let sourceMapAvailable = Boolean(SourceMapConsumer && SourceMapGenerator)
let pathAvailable = Boolean(dirname && resolve && relative && sep)

class MapGenerator {
  constructor(stringify, root, opts, cssString) {
    this.stringify = stringify
    this.mapOpts = opts.map || {}
    this.root = root
    this.opts = opts
    this.css = cssString
  }

  isMap() {
    if (typeof this.opts.map !== 'undefined') {
      return !!this.opts.map
    }
    return this.previous().length > 0
  }

  previous() {
    if (!this.previousMaps) {
      this.previousMaps = []
      if (this.root) {
        this.root.walk(node => {
          if (node.source && node.source.input.map) {
            let map = node.source.input.map
            if (!this.previousMaps.includes(map)) {
              this.previousMaps.push(map)
            }
          }
        })
      } else {
        let input = new Input(this.css, this.opts)
        if (input.map) this.previousMaps.push(input.map)
      }
    }

    return this.previousMaps
  }

  isInline() {
    if (typeof this.mapOpts.inline !== 'undefined') {
      return this.mapOpts.inline
    }

    let annotation = this.mapOpts.annotation
    if (typeof annotation !== 'undefined' && annotation !== true) {
      return false
    }

    if (this.previous().length) {
      return this.previous().some(i => i.inline)
    }
    return true
  }

  isSourcesContent() {
    if (typeof this.mapOpts.sourcesContent !== 'undefined') {
      return this.mapOpts.sourcesContent
    }
    if (this.previous().length) {
      return this.previous().some(i => i.withContent())
    }
    return true
  }

  clearAnnotation() {
    if (this.mapOpts.annotation === false) return

    if (this.root) {
      let node
      for (let i = this.root.nodes.length - 1; i >= 0; i--) {
        node = this.root.nodes[i]
        if (node.type !== 'comment') continue
        if (node.text.indexOf('# sourceMappingURL=') === 0) {
          this.root.removeChild(i)
        }
      }
    } else if (this.css) {
      this.css = this.css.replace(/(\n)?\/\*#[\S\s]*?\*\/$/gm, '')
    }
  }

  setSourcesContent() {
    let already = {}
    if (this.root) {
      this.root.walk(node => {
        if (node.source) {
          let from = node.source.input.from
          if (from && !already[from]) {
            already[from] = true
            this.map.setSourceContent(
              this.toUrl(this.path(from)),
              node.source.input.css
            )
          }
        }
      })
    } else if (this.css) {
      let from = this.opts.from
        ? this.toUrl(this.path(this.opts.from))
        : '<no source>'
      this.map.setSourceContent(from, this.css)
    }
  }

  applyPrevMaps() {
    for (let prev of this.previous()) {
      let from = this.toUrl(this.path(prev.file))
      let root = prev.root || dirname(prev.file)
      let map

      if (this.mapOpts.sourcesContent === false) {
        map = new SourceMapConsumer(prev.text)
        if (map.sourcesContent) {
          map.sourcesContent = map.sourcesContent.map(() => null)
        }
      } else {
        map = prev.consumer()
      }

      this.map.applySourceMap(map, from, this.toUrl(this.path(root)))
    }
  }

  isAnnotation() {
    if (this.isInline()) {
      return true
    }
    if (typeof this.mapOpts.annotation !== 'undefined') {
      return this.mapOpts.annotation
    }
    if (this.previous().length) {
      return this.previous().some(i => i.annotation)
    }
    return true
  }

  toBase64(str) {
    if (Buffer) {
      return Buffer.from(str).toString('base64')
    } else {
      return window.btoa(unescape(encodeURIComponent(str)))
    }
  }

  addAnnotation() {
    let content

    if (this.isInline()) {
      content =
        'data:application/json;base64,' + this.toBase64(this.map.toString())
    } else if (typeof this.mapOpts.annotation === 'string') {
      content = this.mapOpts.annotation
    } else if (typeof this.mapOpts.annotation === 'function') {
      content = this.mapOpts.annotation(this.opts.to, this.root)
    } else {
      content = this.outputFile() + '.map'
    }
    let eol = '\n'
    if (this.css.includes('\r\n')) eol = '\r\n'

    this.css += eol + '/*# sourceMappingURL=' + content + ' */'
  }

  outputFile() {
    if (this.opts.to) {
      return this.path(this.opts.to)
    } else if (this.opts.from) {
      return this.path(this.opts.from)
    } else {
      return 'to.css'
    }
  }

  generateMap() {
    if (this.root) {
      this.generateString()
    } else if (this.previous().length === 1) {
      let prev = this.previous()[0].consumer()
      prev.file = this.outputFile()
      this.map = SourceMapGenerator.fromSourceMap(prev)
    } else {
      this.map = new SourceMapGenerator({ file: this.outputFile() })
      this.map.addMapping({
        source: this.opts.from
          ? this.toUrl(this.path(this.opts.from))
          : '<no source>',
        generated: { line: 1, column: 0 },
        original: { line: 1, column: 0 }
      })
    }

    if (this.isSourcesContent()) this.setSourcesContent()
    if (this.root && this.previous().length > 0) this.applyPrevMaps()
    if (this.isAnnotation()) this.addAnnotation()

    if (this.isInline()) {
      return [this.css]
    } else {
      return [this.css, this.map]
    }
  }

  path(file) {
    if (file.indexOf('<') === 0) return file
    if (/^\w+:\/\//.test(file)) return file
    if (this.mapOpts.absolute) return file

    let from = this.opts.to ? dirname(this.opts.to) : '.'

    if (typeof this.mapOpts.annotation === 'string') {
      from = dirname(resolve(from, this.mapOpts.annotation))
    }

    file = relative(from, file)
    return file
  }

  toUrl(path) {
    if (sep === '\\') {
      path = path.replace(/\\/g, '/')
    }
    return encodeURI(path).replace(/[#?]/g, encodeURIComponent)
  }

  sourcePath(node) {
    if (this.mapOpts.from) {
      return this.toUrl(this.mapOpts.from)
    } else if (this.mapOpts.absolute) {
      if (pathToFileURL) {
        return pathToFileURL(node.source.input.from).toString()
      } else {
        throw new Error(
          '`map.absolute` option is not available in this PostCSS build'
        )
      }
    } else {
      return this.toUrl(this.path(node.source.input.from))
    }
  }

  generateString() {
    this.css = ''
    this.map = new SourceMapGenerator({ file: this.outputFile() })

    let line = 1
    let column = 1

    let noSource = '<no source>'
    let mapping = {
      source: '',
      generated: { line: 0, column: 0 },
      original: { line: 0, column: 0 }
    }

    let lines, last
    this.stringify(this.root, (str, node, type) => {
      this.css += str

      if (node && type !== 'end') {
        mapping.generated.line = line
        mapping.generated.column = column - 1
        if (node.source && node.source.start) {
          mapping.source = this.sourcePath(node)
          mapping.original.line = node.source.start.line
          mapping.original.column = node.source.start.column - 1
          this.map.addMapping(mapping)
        } else {
          mapping.source = noSource
          mapping.original.line = 1
          mapping.original.column = 0
          this.map.addMapping(mapping)
        }
      }

      lines = str.match(/\n/g)
      if (lines) {
        line += lines.length
        last = str.lastIndexOf('\n')
        column = str.length - last
      } else {
        column += str.length
      }

      if (node && type !== 'start') {
        let p = node.parent || { raws: {} }
        if (node.type !== 'decl' || node !== p.last || p.raws.semicolon) {
          if (node.source && node.source.end) {
            mapping.source = this.sourcePath(node)
            mapping.original.line = node.source.end.line
            mapping.original.column = node.source.end.column - 1
            mapping.generated.line = line
            mapping.generated.column = column - 2
            this.map.addMapping(mapping)
          } else {
            mapping.source = noSource
            mapping.original.line = 1
            mapping.original.column = 0
            mapping.generated.line = line
            mapping.generated.column = column - 1
            this.map.addMapping(mapping)
          }
        }
      }
    })
  }

  generate() {
    this.clearAnnotation()
    if (pathAvailable && sourceMapAvailable && this.isMap()) {
      return this.generateMap()
    } else {
      let result = ''
      this.stringify(this.root, i => {
        result += i
      })
      return [result]
    }
  }
}

module.exports = MapGenerator


/***/ }),

/***/ "./node_modules/postcss/lib/no-work-result.js":
/*!****************************************************!*\
  !*** ./node_modules/postcss/lib/no-work-result.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


let MapGenerator = __webpack_require__(/*! ./map-generator */ "./node_modules/postcss/lib/map-generator.js")
let stringify = __webpack_require__(/*! ./stringify */ "./node_modules/postcss/lib/stringify.js")
let warnOnce = __webpack_require__(/*! ./warn-once */ "./node_modules/postcss/lib/warn-once.js")
let parse = __webpack_require__(/*! ./parse */ "./node_modules/postcss/lib/parse.js")
const Result = __webpack_require__(/*! ./result */ "./node_modules/postcss/lib/result.js")

class NoWorkResult {
  constructor(processor, css, opts) {
    css = css.toString()
    this.stringified = false

    this._processor = processor
    this._css = css
    this._opts = opts
    this._map = undefined
    let root

    let str = stringify
    this.result = new Result(this._processor, root, this._opts)
    this.result.css = css

    let self = this
    Object.defineProperty(this.result, 'root', {
      get() {
        return self.root
      }
    })

    let map = new MapGenerator(str, root, this._opts, css)
    if (map.isMap()) {
      let [generatedCSS, generatedMap] = map.generate()
      if (generatedCSS) {
        this.result.css = generatedCSS
      }
      if (generatedMap) {
        this.result.map = generatedMap
      }
    }
  }

  get [Symbol.toStringTag]() {
    return 'NoWorkResult'
  }

  get processor() {
    return this.result.processor
  }

  get opts() {
    return this.result.opts
  }

  get css() {
    return this.result.css
  }

  get content() {
    return this.result.css
  }

  get map() {
    return this.result.map
  }

  get root() {
    if (this._root) {
      return this._root
    }

    let root
    let parser = parse

    try {
      root = parser(this._css, this._opts)
    } catch (error) {
      this.error = error
    }

    this._root = root

    return root
  }

  get messages() {
    return []
  }

  warnings() {
    return []
  }

  toString() {
    return this._css
  }

  then(onFulfilled, onRejected) {
    if (true) {
      if (!('from' in this._opts)) {
        warnOnce(
          'Without `from` option PostCSS could generate wrong source map ' +
            'and will not find Browserslist config. Set it to CSS file path ' +
            'or to `undefined` to prevent this warning.'
        )
      }
    }

    return this.async().then(onFulfilled, onRejected)
  }

  catch(onRejected) {
    return this.async().catch(onRejected)
  }

  finally(onFinally) {
    return this.async().then(onFinally, onFinally)
  }

  async() {
    if (this.error) return Promise.reject(this.error)
    return Promise.resolve(this.result)
  }

  sync() {
    if (this.error) throw this.error
    return this.result
  }
}

module.exports = NoWorkResult
NoWorkResult.default = NoWorkResult


/***/ }),

/***/ "./node_modules/postcss/lib/node.js":
/*!******************************************!*\
  !*** ./node_modules/postcss/lib/node.js ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


let { isClean, my } = __webpack_require__(/*! ./symbols */ "./node_modules/postcss/lib/symbols.js")
let CssSyntaxError = __webpack_require__(/*! ./css-syntax-error */ "./node_modules/postcss/lib/css-syntax-error.js")
let Stringifier = __webpack_require__(/*! ./stringifier */ "./node_modules/postcss/lib/stringifier.js")
let stringify = __webpack_require__(/*! ./stringify */ "./node_modules/postcss/lib/stringify.js")

function cloneNode(obj, parent) {
  let cloned = new obj.constructor()

  for (let i in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, i)) {
      /* c8 ignore next 2 */
      continue
    }
    if (i === 'proxyCache') continue
    let value = obj[i]
    let type = typeof value

    if (i === 'parent' && type === 'object') {
      if (parent) cloned[i] = parent
    } else if (i === 'source') {
      cloned[i] = value
    } else if (Array.isArray(value)) {
      cloned[i] = value.map(j => cloneNode(j, cloned))
    } else {
      if (type === 'object' && value !== null) value = cloneNode(value)
      cloned[i] = value
    }
  }

  return cloned
}

class Node {
  constructor(defaults = {}) {
    this.raws = {}
    this[isClean] = false
    this[my] = true

    for (let name in defaults) {
      if (name === 'nodes') {
        this.nodes = []
        for (let node of defaults[name]) {
          if (typeof node.clone === 'function') {
            this.append(node.clone())
          } else {
            this.append(node)
          }
        }
      } else {
        this[name] = defaults[name]
      }
    }
  }

  error(message, opts = {}) {
    if (this.source) {
      let { start, end } = this.rangeBy(opts)
      return this.source.input.error(
        message,
        { line: start.line, column: start.column },
        { line: end.line, column: end.column },
        opts
      )
    }
    return new CssSyntaxError(message)
  }

  warn(result, text, opts) {
    let data = { node: this }
    for (let i in opts) data[i] = opts[i]
    return result.warn(text, data)
  }

  remove() {
    if (this.parent) {
      this.parent.removeChild(this)
    }
    this.parent = undefined
    return this
  }

  toString(stringifier = stringify) {
    if (stringifier.stringify) stringifier = stringifier.stringify
    let result = ''
    stringifier(this, i => {
      result += i
    })
    return result
  }

  assign(overrides = {}) {
    for (let name in overrides) {
      this[name] = overrides[name]
    }
    return this
  }

  clone(overrides = {}) {
    let cloned = cloneNode(this)
    for (let name in overrides) {
      cloned[name] = overrides[name]
    }
    return cloned
  }

  cloneBefore(overrides = {}) {
    let cloned = this.clone(overrides)
    this.parent.insertBefore(this, cloned)
    return cloned
  }

  cloneAfter(overrides = {}) {
    let cloned = this.clone(overrides)
    this.parent.insertAfter(this, cloned)
    return cloned
  }

  replaceWith(...nodes) {
    if (this.parent) {
      let bookmark = this
      let foundSelf = false
      for (let node of nodes) {
        if (node === this) {
          foundSelf = true
        } else if (foundSelf) {
          this.parent.insertAfter(bookmark, node)
          bookmark = node
        } else {
          this.parent.insertBefore(bookmark, node)
        }
      }

      if (!foundSelf) {
        this.remove()
      }
    }

    return this
  }

  next() {
    if (!this.parent) return undefined
    let index = this.parent.index(this)
    return this.parent.nodes[index + 1]
  }

  prev() {
    if (!this.parent) return undefined
    let index = this.parent.index(this)
    return this.parent.nodes[index - 1]
  }

  before(add) {
    this.parent.insertBefore(this, add)
    return this
  }

  after(add) {
    this.parent.insertAfter(this, add)
    return this
  }

  root() {
    let result = this
    while (result.parent && result.parent.type !== 'document') {
      result = result.parent
    }
    return result
  }

  raw(prop, defaultType) {
    let str = new Stringifier()
    return str.raw(this, prop, defaultType)
  }

  cleanRaws(keepBetween) {
    delete this.raws.before
    delete this.raws.after
    if (!keepBetween) delete this.raws.between
  }

  toJSON(_, inputs) {
    let fixed = {}
    let emitInputs = inputs == null
    inputs = inputs || new Map()
    let inputsNextIndex = 0

    for (let name in this) {
      if (!Object.prototype.hasOwnProperty.call(this, name)) {
        /* c8 ignore next 2 */
        continue
      }
      if (name === 'parent' || name === 'proxyCache') continue
      let value = this[name]

      if (Array.isArray(value)) {
        fixed[name] = value.map(i => {
          if (typeof i === 'object' && i.toJSON) {
            return i.toJSON(null, inputs)
          } else {
            return i
          }
        })
      } else if (typeof value === 'object' && value.toJSON) {
        fixed[name] = value.toJSON(null, inputs)
      } else if (name === 'source') {
        let inputId = inputs.get(value.input)
        if (inputId == null) {
          inputId = inputsNextIndex
          inputs.set(value.input, inputsNextIndex)
          inputsNextIndex++
        }
        fixed[name] = {
          inputId,
          start: value.start,
          end: value.end
        }
      } else {
        fixed[name] = value
      }
    }

    if (emitInputs) {
      fixed.inputs = [...inputs.keys()].map(input => input.toJSON())
    }

    return fixed
  }

  positionInside(index) {
    let string = this.toString()
    let column = this.source.start.column
    let line = this.source.start.line

    for (let i = 0; i < index; i++) {
      if (string[i] === '\n') {
        column = 1
        line += 1
      } else {
        column += 1
      }
    }

    return { line, column }
  }

  positionBy(opts) {
    let pos = this.source.start
    if (opts.index) {
      pos = this.positionInside(opts.index)
    } else if (opts.word) {
      let index = this.toString().indexOf(opts.word)
      if (index !== -1) pos = this.positionInside(index)
    }
    return pos
  }

  rangeBy(opts) {
    let start = {
      line: this.source.start.line,
      column: this.source.start.column
    }
    let end = this.source.end
      ? {
          line: this.source.end.line,
          column: this.source.end.column + 1
        }
      : {
          line: start.line,
          column: start.column + 1
        }

    if (opts.word) {
      let index = this.toString().indexOf(opts.word)
      if (index !== -1) {
        start = this.positionInside(index)
        end = this.positionInside(index + opts.word.length)
      }
    } else {
      if (opts.start) {
        start = {
          line: opts.start.line,
          column: opts.start.column
        }
      } else if (opts.index) {
        start = this.positionInside(opts.index)
      }

      if (opts.end) {
        end = {
          line: opts.end.line,
          column: opts.end.column
        }
      } else if (opts.endIndex) {
        end = this.positionInside(opts.endIndex)
      } else if (opts.index) {
        end = this.positionInside(opts.index + 1)
      }
    }

    if (
      end.line < start.line ||
      (end.line === start.line && end.column <= start.column)
    ) {
      end = { line: start.line, column: start.column + 1 }
    }

    return { start, end }
  }

  getProxyProcessor() {
    return {
      set(node, prop, value) {
        if (node[prop] === value) return true
        node[prop] = value
        if (
          prop === 'prop' ||
          prop === 'value' ||
          prop === 'name' ||
          prop === 'params' ||
          prop === 'important' ||
          /* c8 ignore next */
          prop === 'text'
        ) {
          node.markDirty()
        }
        return true
      },

      get(node, prop) {
        if (prop === 'proxyOf') {
          return node
        } else if (prop === 'root') {
          return () => node.root().toProxy()
        } else {
          return node[prop]
        }
      }
    }
  }

  toProxy() {
    if (!this.proxyCache) {
      this.proxyCache = new Proxy(this, this.getProxyProcessor())
    }
    return this.proxyCache
  }

  addToError(error) {
    error.postcssNode = this
    if (error.stack && this.source && /\n\s{4}at /.test(error.stack)) {
      let s = this.source
      error.stack = error.stack.replace(
        /\n\s{4}at /,
        `$&${s.input.from}:${s.start.line}:${s.start.column}$&`
      )
    }
    return error
  }

  markDirty() {
    if (this[isClean]) {
      this[isClean] = false
      let next = this
      while ((next = next.parent)) {
        next[isClean] = false
      }
    }
  }

  get proxyOf() {
    return this
  }
}

module.exports = Node
Node.default = Node


/***/ }),

/***/ "./node_modules/postcss/lib/parse.js":
/*!*******************************************!*\
  !*** ./node_modules/postcss/lib/parse.js ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


let Container = __webpack_require__(/*! ./container */ "./node_modules/postcss/lib/container.js")
let Parser = __webpack_require__(/*! ./parser */ "./node_modules/postcss/lib/parser.js")
let Input = __webpack_require__(/*! ./input */ "./node_modules/postcss/lib/input.js")

function parse(css, opts) {
  let input = new Input(css, opts)
  let parser = new Parser(input)
  try {
    parser.parse()
  } catch (e) {
    if (true) {
      if (e.name === 'CssSyntaxError' && opts && opts.from) {
        if (/\.scss$/i.test(opts.from)) {
          e.message +=
            '\nYou tried to parse SCSS with ' +
            'the standard CSS parser; ' +
            'try again with the postcss-scss parser'
        } else if (/\.sass/i.test(opts.from)) {
          e.message +=
            '\nYou tried to parse Sass with ' +
            'the standard CSS parser; ' +
            'try again with the postcss-sass parser'
        } else if (/\.less$/i.test(opts.from)) {
          e.message +=
            '\nYou tried to parse Less with ' +
            'the standard CSS parser; ' +
            'try again with the postcss-less parser'
        }
      }
    }
    throw e
  }

  return parser.root
}

module.exports = parse
parse.default = parse

Container.registerParse(parse)


/***/ }),

/***/ "./node_modules/postcss/lib/parser.js":
/*!********************************************!*\
  !*** ./node_modules/postcss/lib/parser.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


let Declaration = __webpack_require__(/*! ./declaration */ "./node_modules/postcss/lib/declaration.js")
let tokenizer = __webpack_require__(/*! ./tokenize */ "./node_modules/postcss/lib/tokenize.js")
let Comment = __webpack_require__(/*! ./comment */ "./node_modules/postcss/lib/comment.js")
let AtRule = __webpack_require__(/*! ./at-rule */ "./node_modules/postcss/lib/at-rule.js")
let Root = __webpack_require__(/*! ./root */ "./node_modules/postcss/lib/root.js")
let Rule = __webpack_require__(/*! ./rule */ "./node_modules/postcss/lib/rule.js")

class Parser {
  constructor(input) {
    this.input = input

    this.root = new Root()
    this.current = this.root
    this.spaces = ''
    this.semicolon = false
    this.customProperty = false

    this.createTokenizer()
    this.root.source = { input, start: { offset: 0, line: 1, column: 1 } }
  }

  createTokenizer() {
    this.tokenizer = tokenizer(this.input)
  }

  parse() {
    let token
    while (!this.tokenizer.endOfFile()) {
      token = this.tokenizer.nextToken()

      switch (token[0]) {
        case 'space':
          this.spaces += token[1]
          break

        case ';':
          this.freeSemicolon(token)
          break

        case '}':
          this.end(token)
          break

        case 'comment':
          this.comment(token)
          break

        case 'at-word':
          this.atrule(token)
          break

        case '{':
          this.emptyRule(token)
          break

        default:
          this.other(token)
          break
      }
    }
    this.endFile()
  }

  comment(token) {
    let node = new Comment()
    this.init(node, token[2])
    node.source.end = this.getPosition(token[3] || token[2])

    let text = token[1].slice(2, -2)
    if (/^\s*$/.test(text)) {
      node.text = ''
      node.raws.left = text
      node.raws.right = ''
    } else {
      let match = text.match(/^(\s*)([^]*\S)(\s*)$/)
      node.text = match[2]
      node.raws.left = match[1]
      node.raws.right = match[3]
    }
  }

  emptyRule(token) {
    let node = new Rule()
    this.init(node, token[2])
    node.selector = ''
    node.raws.between = ''
    this.current = node
  }

  other(start) {
    let end = false
    let type = null
    let colon = false
    let bracket = null
    let brackets = []
    let customProperty = start[1].startsWith('--')

    let tokens = []
    let token = start
    while (token) {
      type = token[0]
      tokens.push(token)

      if (type === '(' || type === '[') {
        if (!bracket) bracket = token
        brackets.push(type === '(' ? ')' : ']')
      } else if (customProperty && colon && type === '{') {
        if (!bracket) bracket = token
        brackets.push('}')
      } else if (brackets.length === 0) {
        if (type === ';') {
          if (colon) {
            this.decl(tokens, customProperty)
            return
          } else {
            break
          }
        } else if (type === '{') {
          this.rule(tokens)
          return
        } else if (type === '}') {
          this.tokenizer.back(tokens.pop())
          end = true
          break
        } else if (type === ':') {
          colon = true
        }
      } else if (type === brackets[brackets.length - 1]) {
        brackets.pop()
        if (brackets.length === 0) bracket = null
      }

      token = this.tokenizer.nextToken()
    }

    if (this.tokenizer.endOfFile()) end = true
    if (brackets.length > 0) this.unclosedBracket(bracket)

    if (end && colon) {
      while (tokens.length) {
        token = tokens[tokens.length - 1][0]
        if (token !== 'space' && token !== 'comment') break
        this.tokenizer.back(tokens.pop())
      }
      this.decl(tokens, customProperty)
    } else {
      this.unknownWord(tokens)
    }
  }

  rule(tokens) {
    tokens.pop()

    let node = new Rule()
    this.init(node, tokens[0][2])

    node.raws.between = this.spacesAndCommentsFromEnd(tokens)
    this.raw(node, 'selector', tokens)
    this.current = node
  }

  decl(tokens, customProperty) {
    let node = new Declaration()
    this.init(node, tokens[0][2])

    let last = tokens[tokens.length - 1]
    if (last[0] === ';') {
      this.semicolon = true
      tokens.pop()
    }
    node.source.end = this.getPosition(last[3] || last[2])

    while (tokens[0][0] !== 'word') {
      if (tokens.length === 1) this.unknownWord(tokens)
      node.raws.before += tokens.shift()[1]
    }
    node.source.start = this.getPosition(tokens[0][2])

    node.prop = ''
    while (tokens.length) {
      let type = tokens[0][0]
      if (type === ':' || type === 'space' || type === 'comment') {
        break
      }
      node.prop += tokens.shift()[1]
    }

    node.raws.between = ''

    let token
    while (tokens.length) {
      token = tokens.shift()

      if (token[0] === ':') {
        node.raws.between += token[1]
        break
      } else {
        if (token[0] === 'word' && /\w/.test(token[1])) {
          this.unknownWord([token])
        }
        node.raws.between += token[1]
      }
    }

    if (node.prop[0] === '_' || node.prop[0] === '*') {
      node.raws.before += node.prop[0]
      node.prop = node.prop.slice(1)
    }
    let firstSpaces = this.spacesAndCommentsFromStart(tokens)
    this.precheckMissedSemicolon(tokens)

    for (let i = tokens.length - 1; i >= 0; i--) {
      token = tokens[i]
      if (token[1].toLowerCase() === '!important') {
        node.important = true
        let string = this.stringFrom(tokens, i)
        string = this.spacesFromEnd(tokens) + string
        if (string !== ' !important') node.raws.important = string
        break
      } else if (token[1].toLowerCase() === 'important') {
        let cache = tokens.slice(0)
        let str = ''
        for (let j = i; j > 0; j--) {
          let type = cache[j][0]
          if (str.trim().indexOf('!') === 0 && type !== 'space') {
            break
          }
          str = cache.pop()[1] + str
        }
        if (str.trim().indexOf('!') === 0) {
          node.important = true
          node.raws.important = str
          tokens = cache
        }
      }

      if (token[0] !== 'space' && token[0] !== 'comment') {
        break
      }
    }

    let hasWord = tokens.some(i => i[0] !== 'space' && i[0] !== 'comment')
    this.raw(node, 'value', tokens)
    if (hasWord) {
      node.raws.between += firstSpaces
    } else {
      node.value = firstSpaces + node.value
    }

    if (node.value.includes(':') && !customProperty) {
      this.checkMissedSemicolon(tokens)
    }
  }

  atrule(token) {
    let node = new AtRule()
    node.name = token[1].slice(1)
    if (node.name === '') {
      this.unnamedAtrule(node, token)
    }
    this.init(node, token[2])

    let type
    let prev
    let shift
    let last = false
    let open = false
    let params = []
    let brackets = []

    while (!this.tokenizer.endOfFile()) {
      token = this.tokenizer.nextToken()
      type = token[0]

      if (type === '(' || type === '[') {
        brackets.push(type === '(' ? ')' : ']')
      } else if (type === '{' && brackets.length > 0) {
        brackets.push('}')
      } else if (type === brackets[brackets.length - 1]) {
        brackets.pop()
      }

      if (brackets.length === 0) {
        if (type === ';') {
          node.source.end = this.getPosition(token[2])
          this.semicolon = true
          break
        } else if (type === '{') {
          open = true
          break
        } else if (type === '}') {
          if (params.length > 0) {
            shift = params.length - 1
            prev = params[shift]
            while (prev && prev[0] === 'space') {
              prev = params[--shift]
            }
            if (prev) {
              node.source.end = this.getPosition(prev[3] || prev[2])
            }
          }
          this.end(token)
          break
        } else {
          params.push(token)
        }
      } else {
        params.push(token)
      }

      if (this.tokenizer.endOfFile()) {
        last = true
        break
      }
    }

    node.raws.between = this.spacesAndCommentsFromEnd(params)
    if (params.length) {
      node.raws.afterName = this.spacesAndCommentsFromStart(params)
      this.raw(node, 'params', params)
      if (last) {
        token = params[params.length - 1]
        node.source.end = this.getPosition(token[3] || token[2])
        this.spaces = node.raws.between
        node.raws.between = ''
      }
    } else {
      node.raws.afterName = ''
      node.params = ''
    }

    if (open) {
      node.nodes = []
      this.current = node
    }
  }

  end(token) {
    if (this.current.nodes && this.current.nodes.length) {
      this.current.raws.semicolon = this.semicolon
    }
    this.semicolon = false

    this.current.raws.after = (this.current.raws.after || '') + this.spaces
    this.spaces = ''

    if (this.current.parent) {
      this.current.source.end = this.getPosition(token[2])
      this.current = this.current.parent
    } else {
      this.unexpectedClose(token)
    }
  }

  endFile() {
    if (this.current.parent) this.unclosedBlock()
    if (this.current.nodes && this.current.nodes.length) {
      this.current.raws.semicolon = this.semicolon
    }
    this.current.raws.after = (this.current.raws.after || '') + this.spaces
  }

  freeSemicolon(token) {
    this.spaces += token[1]
    if (this.current.nodes) {
      let prev = this.current.nodes[this.current.nodes.length - 1]
      if (prev && prev.type === 'rule' && !prev.raws.ownSemicolon) {
        prev.raws.ownSemicolon = this.spaces
        this.spaces = ''
      }
    }
  }

  // Helpers

  getPosition(offset) {
    let pos = this.input.fromOffset(offset)
    return {
      offset,
      line: pos.line,
      column: pos.col
    }
  }

  init(node, offset) {
    this.current.push(node)
    node.source = {
      start: this.getPosition(offset),
      input: this.input
    }
    node.raws.before = this.spaces
    this.spaces = ''
    if (node.type !== 'comment') this.semicolon = false
  }

  raw(node, prop, tokens) {
    let token, type
    let length = tokens.length
    let value = ''
    let clean = true
    let next, prev
    let pattern = /^([#.|])?(\w)+/i

    for (let i = 0; i < length; i += 1) {
      token = tokens[i]
      type = token[0]

      if (type === 'comment' && node.type === 'rule') {
        prev = tokens[i - 1]
        next = tokens[i + 1]

        if (
          prev[0] !== 'space' &&
          next[0] !== 'space' &&
          pattern.test(prev[1]) &&
          pattern.test(next[1])
        ) {
          value += token[1]
        } else {
          clean = false
        }

        continue
      }

      if (type === 'comment' || (type === 'space' && i === length - 1)) {
        clean = false
      } else {
        value += token[1]
      }
    }
    if (!clean) {
      let raw = tokens.reduce((all, i) => all + i[1], '')
      node.raws[prop] = { value, raw }
    }
    node[prop] = value
  }

  spacesAndCommentsFromEnd(tokens) {
    let lastTokenType
    let spaces = ''
    while (tokens.length) {
      lastTokenType = tokens[tokens.length - 1][0]
      if (lastTokenType !== 'space' && lastTokenType !== 'comment') break
      spaces = tokens.pop()[1] + spaces
    }
    return spaces
  }

  spacesAndCommentsFromStart(tokens) {
    let next
    let spaces = ''
    while (tokens.length) {
      next = tokens[0][0]
      if (next !== 'space' && next !== 'comment') break
      spaces += tokens.shift()[1]
    }
    return spaces
  }

  spacesFromEnd(tokens) {
    let lastTokenType
    let spaces = ''
    while (tokens.length) {
      lastTokenType = tokens[tokens.length - 1][0]
      if (lastTokenType !== 'space') break
      spaces = tokens.pop()[1] + spaces
    }
    return spaces
  }

  stringFrom(tokens, from) {
    let result = ''
    for (let i = from; i < tokens.length; i++) {
      result += tokens[i][1]
    }
    tokens.splice(from, tokens.length - from)
    return result
  }

  colon(tokens) {
    let brackets = 0
    let token, type, prev
    for (let [i, element] of tokens.entries()) {
      token = element
      type = token[0]

      if (type === '(') {
        brackets += 1
      }
      if (type === ')') {
        brackets -= 1
      }
      if (brackets === 0 && type === ':') {
        if (!prev) {
          this.doubleColon(token)
        } else if (prev[0] === 'word' && prev[1] === 'progid') {
          continue
        } else {
          return i
        }
      }

      prev = token
    }
    return false
  }

  // Errors

  unclosedBracket(bracket) {
    throw this.input.error(
      'Unclosed bracket',
      { offset: bracket[2] },
      { offset: bracket[2] + 1 }
    )
  }

  unknownWord(tokens) {
    throw this.input.error(
      'Unknown word',
      { offset: tokens[0][2] },
      { offset: tokens[0][2] + tokens[0][1].length }
    )
  }

  unexpectedClose(token) {
    throw this.input.error(
      'Unexpected }',
      { offset: token[2] },
      { offset: token[2] + 1 }
    )
  }

  unclosedBlock() {
    let pos = this.current.source.start
    throw this.input.error('Unclosed block', pos.line, pos.column)
  }

  doubleColon(token) {
    throw this.input.error(
      'Double colon',
      { offset: token[2] },
      { offset: token[2] + token[1].length }
    )
  }

  unnamedAtrule(node, token) {
    throw this.input.error(
      'At-rule without name',
      { offset: token[2] },
      { offset: token[2] + token[1].length }
    )
  }

  precheckMissedSemicolon(/* tokens */) {
    // Hook for Safe Parser
  }

  checkMissedSemicolon(tokens) {
    let colon = this.colon(tokens)
    if (colon === false) return

    let founded = 0
    let token
    for (let j = colon - 1; j >= 0; j--) {
      token = tokens[j]
      if (token[0] !== 'space') {
        founded += 1
        if (founded === 2) break
      }
    }
    // If the token is a word, e.g. `!important`, `red` or any other valid property's value.
    // Then we need to return the colon after that word token. [3] is the "end" colon of that word.
    // And because we need it after that one we do +1 to get the next one.
    throw this.input.error(
      'Missed semicolon',
      token[0] === 'word' ? token[3] + 1 : token[2]
    )
  }
}

module.exports = Parser


/***/ }),

/***/ "./node_modules/postcss/lib/postcss.js":
/*!*********************************************!*\
  !*** ./node_modules/postcss/lib/postcss.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


let CssSyntaxError = __webpack_require__(/*! ./css-syntax-error */ "./node_modules/postcss/lib/css-syntax-error.js")
let Declaration = __webpack_require__(/*! ./declaration */ "./node_modules/postcss/lib/declaration.js")
let LazyResult = __webpack_require__(/*! ./lazy-result */ "./node_modules/postcss/lib/lazy-result.js")
let Container = __webpack_require__(/*! ./container */ "./node_modules/postcss/lib/container.js")
let Processor = __webpack_require__(/*! ./processor */ "./node_modules/postcss/lib/processor.js")
let stringify = __webpack_require__(/*! ./stringify */ "./node_modules/postcss/lib/stringify.js")
let fromJSON = __webpack_require__(/*! ./fromJSON */ "./node_modules/postcss/lib/fromJSON.js")
let Document = __webpack_require__(/*! ./document */ "./node_modules/postcss/lib/document.js")
let Warning = __webpack_require__(/*! ./warning */ "./node_modules/postcss/lib/warning.js")
let Comment = __webpack_require__(/*! ./comment */ "./node_modules/postcss/lib/comment.js")
let AtRule = __webpack_require__(/*! ./at-rule */ "./node_modules/postcss/lib/at-rule.js")
let Result = __webpack_require__(/*! ./result.js */ "./node_modules/postcss/lib/result.js")
let Input = __webpack_require__(/*! ./input */ "./node_modules/postcss/lib/input.js")
let parse = __webpack_require__(/*! ./parse */ "./node_modules/postcss/lib/parse.js")
let list = __webpack_require__(/*! ./list */ "./node_modules/postcss/lib/list.js")
let Rule = __webpack_require__(/*! ./rule */ "./node_modules/postcss/lib/rule.js")
let Root = __webpack_require__(/*! ./root */ "./node_modules/postcss/lib/root.js")
let Node = __webpack_require__(/*! ./node */ "./node_modules/postcss/lib/node.js")

function postcss(...plugins) {
  if (plugins.length === 1 && Array.isArray(plugins[0])) {
    plugins = plugins[0]
  }
  return new Processor(plugins)
}

postcss.plugin = function plugin(name, initializer) {
  // eslint-disable-next-line no-console
  if (console && console.warn) {
    // eslint-disable-next-line no-console
    console.warn(
      name +
        ': postcss.plugin was deprecated. Migration guide:\n' +
        'https://evilmartians.com/chronicles/postcss-8-plugin-migration'
    )
    if (process.env.LANG && process.env.LANG.startsWith('cn')) {
      /* c8 ignore next 7 */
      // eslint-disable-next-line no-console
      console.warn(
        name +
          ': 里面 postcss.plugin 被弃用. 迁移指南:\n' +
          'https://www.w3ctech.com/topic/2226'
      )
    }
  }
  function creator(...args) {
    let transformer = initializer(...args)
    transformer.postcssPlugin = name
    transformer.postcssVersion = new Processor().version
    return transformer
  }

  let cache
  Object.defineProperty(creator, 'postcss', {
    get() {
      if (!cache) cache = creator()
      return cache
    }
  })

  creator.process = function (css, processOpts, pluginOpts) {
    return postcss([creator(pluginOpts)]).process(css, processOpts)
  }

  return creator
}

postcss.stringify = stringify
postcss.parse = parse
postcss.fromJSON = fromJSON
postcss.list = list

postcss.comment = defaults => new Comment(defaults)
postcss.atRule = defaults => new AtRule(defaults)
postcss.decl = defaults => new Declaration(defaults)
postcss.rule = defaults => new Rule(defaults)
postcss.root = defaults => new Root(defaults)
postcss.document = defaults => new Document(defaults)

postcss.CssSyntaxError = CssSyntaxError
postcss.Declaration = Declaration
postcss.Container = Container
postcss.Processor = Processor
postcss.Document = Document
postcss.Comment = Comment
postcss.Warning = Warning
postcss.AtRule = AtRule
postcss.Result = Result
postcss.Input = Input
postcss.Rule = Rule
postcss.Root = Root
postcss.Node = Node

LazyResult.registerPostcss(postcss)

module.exports = postcss
postcss.default = postcss


/***/ }),

/***/ "./node_modules/postcss/lib/previous-map.js":
/*!**************************************************!*\
  !*** ./node_modules/postcss/lib/previous-map.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


let { SourceMapConsumer, SourceMapGenerator } = __webpack_require__(/*! source-map-js */ "?b8cb")
let { existsSync, readFileSync } = __webpack_require__(/*! fs */ "?03fb")
let { dirname, join } = __webpack_require__(/*! path */ "?6197")

function fromBase64(str) {
  if (Buffer) {
    return Buffer.from(str, 'base64').toString()
  } else {
    /* c8 ignore next 2 */
    return window.atob(str)
  }
}

class PreviousMap {
  constructor(css, opts) {
    if (opts.map === false) return
    this.loadAnnotation(css)
    this.inline = this.startWith(this.annotation, 'data:')

    let prev = opts.map ? opts.map.prev : undefined
    let text = this.loadMap(opts.from, prev)
    if (!this.mapFile && opts.from) {
      this.mapFile = opts.from
    }
    if (this.mapFile) this.root = dirname(this.mapFile)
    if (text) this.text = text
  }

  consumer() {
    if (!this.consumerCache) {
      this.consumerCache = new SourceMapConsumer(this.text)
    }
    return this.consumerCache
  }

  withContent() {
    return !!(
      this.consumer().sourcesContent &&
      this.consumer().sourcesContent.length > 0
    )
  }

  startWith(string, start) {
    if (!string) return false
    return string.substr(0, start.length) === start
  }

  getAnnotationURL(sourceMapString) {
    return sourceMapString.replace(/^\/\*\s*# sourceMappingURL=/, '').trim()
  }

  loadAnnotation(css) {
    let comments = css.match(/\/\*\s*# sourceMappingURL=/gm)
    if (!comments) return

    // sourceMappingURLs from comments, strings, etc.
    let start = css.lastIndexOf(comments.pop())
    let end = css.indexOf('*/', start)

    if (start > -1 && end > -1) {
      // Locate the last sourceMappingURL to avoid pickin
      this.annotation = this.getAnnotationURL(css.substring(start, end))
    }
  }

  decodeInline(text) {
    let baseCharsetUri = /^data:application\/json;charset=utf-?8;base64,/
    let baseUri = /^data:application\/json;base64,/
    let charsetUri = /^data:application\/json;charset=utf-?8,/
    let uri = /^data:application\/json,/

    if (charsetUri.test(text) || uri.test(text)) {
      return decodeURIComponent(text.substr(RegExp.lastMatch.length))
    }

    if (baseCharsetUri.test(text) || baseUri.test(text)) {
      return fromBase64(text.substr(RegExp.lastMatch.length))
    }

    let encoding = text.match(/data:application\/json;([^,]+),/)[1]
    throw new Error('Unsupported source map encoding ' + encoding)
  }

  loadFile(path) {
    this.root = dirname(path)
    if (existsSync(path)) {
      this.mapFile = path
      return readFileSync(path, 'utf-8').toString().trim()
    }
  }

  loadMap(file, prev) {
    if (prev === false) return false

    if (prev) {
      if (typeof prev === 'string') {
        return prev
      } else if (typeof prev === 'function') {
        let prevPath = prev(file)
        if (prevPath) {
          let map = this.loadFile(prevPath)
          if (!map) {
            throw new Error(
              'Unable to load previous source map: ' + prevPath.toString()
            )
          }
          return map
        }
      } else if (prev instanceof SourceMapConsumer) {
        return SourceMapGenerator.fromSourceMap(prev).toString()
      } else if (prev instanceof SourceMapGenerator) {
        return prev.toString()
      } else if (this.isMap(prev)) {
        return JSON.stringify(prev)
      } else {
        throw new Error(
          'Unsupported previous source map format: ' + prev.toString()
        )
      }
    } else if (this.inline) {
      return this.decodeInline(this.annotation)
    } else if (this.annotation) {
      let map = this.annotation
      if (file) map = join(dirname(file), map)
      return this.loadFile(map)
    }
  }

  isMap(map) {
    if (typeof map !== 'object') return false
    return (
      typeof map.mappings === 'string' ||
      typeof map._mappings === 'string' ||
      Array.isArray(map.sections)
    )
  }
}

module.exports = PreviousMap
PreviousMap.default = PreviousMap


/***/ }),

/***/ "./node_modules/postcss/lib/processor.js":
/*!***********************************************!*\
  !*** ./node_modules/postcss/lib/processor.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


let NoWorkResult = __webpack_require__(/*! ./no-work-result */ "./node_modules/postcss/lib/no-work-result.js")
let LazyResult = __webpack_require__(/*! ./lazy-result */ "./node_modules/postcss/lib/lazy-result.js")
let Document = __webpack_require__(/*! ./document */ "./node_modules/postcss/lib/document.js")
let Root = __webpack_require__(/*! ./root */ "./node_modules/postcss/lib/root.js")

class Processor {
  constructor(plugins = []) {
    this.version = '8.4.5'
    this.plugins = this.normalize(plugins)
  }

  use(plugin) {
    this.plugins = this.plugins.concat(this.normalize([plugin]))
    return this
  }

  process(css, opts = {}) {
    if (
      this.plugins.length === 0 &&
      typeof opts.parser === 'undefined' &&
      typeof opts.stringifier === 'undefined' &&
      typeof opts.syntax === 'undefined'
    ) {
      return new NoWorkResult(this, css, opts)
    } else {
      return new LazyResult(this, css, opts)
    }
  }

  normalize(plugins) {
    let normalized = []
    for (let i of plugins) {
      if (i.postcss === true) {
        i = i()
      } else if (i.postcss) {
        i = i.postcss
      }

      if (typeof i === 'object' && Array.isArray(i.plugins)) {
        normalized = normalized.concat(i.plugins)
      } else if (typeof i === 'object' && i.postcssPlugin) {
        normalized.push(i)
      } else if (typeof i === 'function') {
        normalized.push(i)
      } else if (typeof i === 'object' && (i.parse || i.stringify)) {
        if (true) {
          throw new Error(
            'PostCSS syntaxes cannot be used as plugins. Instead, please use ' +
              'one of the syntax/parser/stringifier options as outlined ' +
              'in your PostCSS runner documentation.'
          )
        }
      } else {
        throw new Error(i + ' is not a PostCSS plugin')
      }
    }
    return normalized
  }
}

module.exports = Processor
Processor.default = Processor

Root.registerProcessor(Processor)
Document.registerProcessor(Processor)


/***/ }),

/***/ "./node_modules/postcss/lib/result.js":
/*!********************************************!*\
  !*** ./node_modules/postcss/lib/result.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


let Warning = __webpack_require__(/*! ./warning */ "./node_modules/postcss/lib/warning.js")

class Result {
  constructor(processor, root, opts) {
    this.processor = processor
    this.messages = []
    this.root = root
    this.opts = opts
    this.css = undefined
    this.map = undefined
  }

  toString() {
    return this.css
  }

  warn(text, opts = {}) {
    if (!opts.plugin) {
      if (this.lastPlugin && this.lastPlugin.postcssPlugin) {
        opts.plugin = this.lastPlugin.postcssPlugin
      }
    }

    let warning = new Warning(text, opts)
    this.messages.push(warning)

    return warning
  }

  warnings() {
    return this.messages.filter(i => i.type === 'warning')
  }

  get content() {
    return this.css
  }
}

module.exports = Result
Result.default = Result


/***/ }),

/***/ "./node_modules/postcss/lib/root.js":
/*!******************************************!*\
  !*** ./node_modules/postcss/lib/root.js ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


let Container = __webpack_require__(/*! ./container */ "./node_modules/postcss/lib/container.js")

let LazyResult, Processor

class Root extends Container {
  constructor(defaults) {
    super(defaults)
    this.type = 'root'
    if (!this.nodes) this.nodes = []
  }

  removeChild(child, ignore) {
    let index = this.index(child)

    if (!ignore && index === 0 && this.nodes.length > 1) {
      this.nodes[1].raws.before = this.nodes[index].raws.before
    }

    return super.removeChild(child)
  }

  normalize(child, sample, type) {
    let nodes = super.normalize(child)

    if (sample) {
      if (type === 'prepend') {
        if (this.nodes.length > 1) {
          sample.raws.before = this.nodes[1].raws.before
        } else {
          delete sample.raws.before
        }
      } else if (this.first !== sample) {
        for (let node of nodes) {
          node.raws.before = sample.raws.before
        }
      }
    }

    return nodes
  }

  toResult(opts = {}) {
    let lazy = new LazyResult(new Processor(), this, opts)
    return lazy.stringify()
  }
}

Root.registerLazyResult = dependant => {
  LazyResult = dependant
}

Root.registerProcessor = dependant => {
  Processor = dependant
}

module.exports = Root
Root.default = Root


/***/ }),

/***/ "./node_modules/postcss/lib/rule.js":
/*!******************************************!*\
  !*** ./node_modules/postcss/lib/rule.js ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


let Container = __webpack_require__(/*! ./container */ "./node_modules/postcss/lib/container.js")
let list = __webpack_require__(/*! ./list */ "./node_modules/postcss/lib/list.js")

class Rule extends Container {
  constructor(defaults) {
    super(defaults)
    this.type = 'rule'
    if (!this.nodes) this.nodes = []
  }

  get selectors() {
    return list.comma(this.selector)
  }

  set selectors(values) {
    let match = this.selector ? this.selector.match(/,\s*/) : null
    let sep = match ? match[0] : ',' + this.raw('between', 'beforeOpen')
    this.selector = values.join(sep)
  }
}

module.exports = Rule
Rule.default = Rule

Container.registerRule(Rule)


/***/ }),

/***/ "./node_modules/postcss/lib/stringifier.js":
/*!*************************************************!*\
  !*** ./node_modules/postcss/lib/stringifier.js ***!
  \*************************************************/
/***/ ((module) => {

"use strict";


const DEFAULT_RAW = {
  colon: ': ',
  indent: '    ',
  beforeDecl: '\n',
  beforeRule: '\n',
  beforeOpen: ' ',
  beforeClose: '\n',
  beforeComment: '\n',
  after: '\n',
  emptyBody: '',
  commentLeft: ' ',
  commentRight: ' ',
  semicolon: false
}

function capitalize(str) {
  return str[0].toUpperCase() + str.slice(1)
}

class Stringifier {
  constructor(builder) {
    this.builder = builder
  }

  stringify(node, semicolon) {
    /* c8 ignore start */
    if (!this[node.type]) {
      throw new Error(
        'Unknown AST node type ' +
          node.type +
          '. ' +
          'Maybe you need to change PostCSS stringifier.'
      )
    }
    /* c8 ignore stop */
    this[node.type](node, semicolon)
  }

  document(node) {
    this.body(node)
  }

  root(node) {
    this.body(node)
    if (node.raws.after) this.builder(node.raws.after)
  }

  comment(node) {
    let left = this.raw(node, 'left', 'commentLeft')
    let right = this.raw(node, 'right', 'commentRight')
    this.builder('/*' + left + node.text + right + '*/', node)
  }

  decl(node, semicolon) {
    let between = this.raw(node, 'between', 'colon')
    let string = node.prop + between + this.rawValue(node, 'value')

    if (node.important) {
      string += node.raws.important || ' !important'
    }

    if (semicolon) string += ';'
    this.builder(string, node)
  }

  rule(node) {
    this.block(node, this.rawValue(node, 'selector'))
    if (node.raws.ownSemicolon) {
      this.builder(node.raws.ownSemicolon, node, 'end')
    }
  }

  atrule(node, semicolon) {
    let name = '@' + node.name
    let params = node.params ? this.rawValue(node, 'params') : ''

    if (typeof node.raws.afterName !== 'undefined') {
      name += node.raws.afterName
    } else if (params) {
      name += ' '
    }

    if (node.nodes) {
      this.block(node, name + params)
    } else {
      let end = (node.raws.between || '') + (semicolon ? ';' : '')
      this.builder(name + params + end, node)
    }
  }

  body(node) {
    let last = node.nodes.length - 1
    while (last > 0) {
      if (node.nodes[last].type !== 'comment') break
      last -= 1
    }

    let semicolon = this.raw(node, 'semicolon')
    for (let i = 0; i < node.nodes.length; i++) {
      let child = node.nodes[i]
      let before = this.raw(child, 'before')
      if (before) this.builder(before)
      this.stringify(child, last !== i || semicolon)
    }
  }

  block(node, start) {
    let between = this.raw(node, 'between', 'beforeOpen')
    this.builder(start + between + '{', node, 'start')

    let after
    if (node.nodes && node.nodes.length) {
      this.body(node)
      after = this.raw(node, 'after')
    } else {
      after = this.raw(node, 'after', 'emptyBody')
    }

    if (after) this.builder(after)
    this.builder('}', node, 'end')
  }

  raw(node, own, detect) {
    let value
    if (!detect) detect = own

    // Already had
    if (own) {
      value = node.raws[own]
      if (typeof value !== 'undefined') return value
    }

    let parent = node.parent

    if (detect === 'before') {
      // Hack for first rule in CSS
      if (!parent || (parent.type === 'root' && parent.first === node)) {
        return ''
      }

      // `root` nodes in `document` should use only their own raws
      if (parent && parent.type === 'document') {
        return ''
      }
    }

    // Floating child without parent
    if (!parent) return DEFAULT_RAW[detect]

    // Detect style by other nodes
    let root = node.root()
    if (!root.rawCache) root.rawCache = {}
    if (typeof root.rawCache[detect] !== 'undefined') {
      return root.rawCache[detect]
    }

    if (detect === 'before' || detect === 'after') {
      return this.beforeAfter(node, detect)
    } else {
      let method = 'raw' + capitalize(detect)
      if (this[method]) {
        value = this[method](root, node)
      } else {
        root.walk(i => {
          value = i.raws[own]
          if (typeof value !== 'undefined') return false
        })
      }
    }

    if (typeof value === 'undefined') value = DEFAULT_RAW[detect]

    root.rawCache[detect] = value
    return value
  }

  rawSemicolon(root) {
    let value
    root.walk(i => {
      if (i.nodes && i.nodes.length && i.last.type === 'decl') {
        value = i.raws.semicolon
        if (typeof value !== 'undefined') return false
      }
    })
    return value
  }

  rawEmptyBody(root) {
    let value
    root.walk(i => {
      if (i.nodes && i.nodes.length === 0) {
        value = i.raws.after
        if (typeof value !== 'undefined') return false
      }
    })
    return value
  }

  rawIndent(root) {
    if (root.raws.indent) return root.raws.indent
    let value
    root.walk(i => {
      let p = i.parent
      if (p && p !== root && p.parent && p.parent === root) {
        if (typeof i.raws.before !== 'undefined') {
          let parts = i.raws.before.split('\n')
          value = parts[parts.length - 1]
          value = value.replace(/\S/g, '')
          return false
        }
      }
    })
    return value
  }

  rawBeforeComment(root, node) {
    let value
    root.walkComments(i => {
      if (typeof i.raws.before !== 'undefined') {
        value = i.raws.before
        if (value.includes('\n')) {
          value = value.replace(/[^\n]+$/, '')
        }
        return false
      }
    })
    if (typeof value === 'undefined') {
      value = this.raw(node, null, 'beforeDecl')
    } else if (value) {
      value = value.replace(/\S/g, '')
    }
    return value
  }

  rawBeforeDecl(root, node) {
    let value
    root.walkDecls(i => {
      if (typeof i.raws.before !== 'undefined') {
        value = i.raws.before
        if (value.includes('\n')) {
          value = value.replace(/[^\n]+$/, '')
        }
        return false
      }
    })
    if (typeof value === 'undefined') {
      value = this.raw(node, null, 'beforeRule')
    } else if (value) {
      value = value.replace(/\S/g, '')
    }
    return value
  }

  rawBeforeRule(root) {
    let value
    root.walk(i => {
      if (i.nodes && (i.parent !== root || root.first !== i)) {
        if (typeof i.raws.before !== 'undefined') {
          value = i.raws.before
          if (value.includes('\n')) {
            value = value.replace(/[^\n]+$/, '')
          }
          return false
        }
      }
    })
    if (value) value = value.replace(/\S/g, '')
    return value
  }

  rawBeforeClose(root) {
    let value
    root.walk(i => {
      if (i.nodes && i.nodes.length > 0) {
        if (typeof i.raws.after !== 'undefined') {
          value = i.raws.after
          if (value.includes('\n')) {
            value = value.replace(/[^\n]+$/, '')
          }
          return false
        }
      }
    })
    if (value) value = value.replace(/\S/g, '')
    return value
  }

  rawBeforeOpen(root) {
    let value
    root.walk(i => {
      if (i.type !== 'decl') {
        value = i.raws.between
        if (typeof value !== 'undefined') return false
      }
    })
    return value
  }

  rawColon(root) {
    let value
    root.walkDecls(i => {
      if (typeof i.raws.between !== 'undefined') {
        value = i.raws.between.replace(/[^\s:]/g, '')
        return false
      }
    })
    return value
  }

  beforeAfter(node, detect) {
    let value
    if (node.type === 'decl') {
      value = this.raw(node, null, 'beforeDecl')
    } else if (node.type === 'comment') {
      value = this.raw(node, null, 'beforeComment')
    } else if (detect === 'before') {
      value = this.raw(node, null, 'beforeRule')
    } else {
      value = this.raw(node, null, 'beforeClose')
    }

    let buf = node.parent
    let depth = 0
    while (buf && buf.type !== 'root') {
      depth += 1
      buf = buf.parent
    }

    if (value.includes('\n')) {
      let indent = this.raw(node, null, 'indent')
      if (indent.length) {
        for (let step = 0; step < depth; step++) value += indent
      }
    }

    return value
  }

  rawValue(node, prop) {
    let value = node[prop]
    let raw = node.raws[prop]
    if (raw && raw.value === value) {
      return raw.raw
    }

    return value
  }
}

module.exports = Stringifier
Stringifier.default = Stringifier


/***/ }),

/***/ "./node_modules/postcss/lib/stringify.js":
/*!***********************************************!*\
  !*** ./node_modules/postcss/lib/stringify.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


let Stringifier = __webpack_require__(/*! ./stringifier */ "./node_modules/postcss/lib/stringifier.js")

function stringify(node, builder) {
  let str = new Stringifier(builder)
  str.stringify(node)
}

module.exports = stringify
stringify.default = stringify


/***/ }),

/***/ "./node_modules/postcss/lib/symbols.js":
/*!*********************************************!*\
  !*** ./node_modules/postcss/lib/symbols.js ***!
  \*********************************************/
/***/ ((module) => {

"use strict";


module.exports.isClean = Symbol('isClean')

module.exports.my = Symbol('my')


/***/ }),

/***/ "./node_modules/postcss/lib/tokenize.js":
/*!**********************************************!*\
  !*** ./node_modules/postcss/lib/tokenize.js ***!
  \**********************************************/
/***/ ((module) => {

"use strict";


const SINGLE_QUOTE = "'".charCodeAt(0)
const DOUBLE_QUOTE = '"'.charCodeAt(0)
const BACKSLASH = '\\'.charCodeAt(0)
const SLASH = '/'.charCodeAt(0)
const NEWLINE = '\n'.charCodeAt(0)
const SPACE = ' '.charCodeAt(0)
const FEED = '\f'.charCodeAt(0)
const TAB = '\t'.charCodeAt(0)
const CR = '\r'.charCodeAt(0)
const OPEN_SQUARE = '['.charCodeAt(0)
const CLOSE_SQUARE = ']'.charCodeAt(0)
const OPEN_PARENTHESES = '('.charCodeAt(0)
const CLOSE_PARENTHESES = ')'.charCodeAt(0)
const OPEN_CURLY = '{'.charCodeAt(0)
const CLOSE_CURLY = '}'.charCodeAt(0)
const SEMICOLON = ';'.charCodeAt(0)
const ASTERISK = '*'.charCodeAt(0)
const COLON = ':'.charCodeAt(0)
const AT = '@'.charCodeAt(0)

const RE_AT_END = /[\t\n\f\r "#'()/;[\\\]{}]/g
const RE_WORD_END = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g
const RE_BAD_BRACKET = /.[\n"'(/\\]/
const RE_HEX_ESCAPE = /[\da-f]/i

module.exports = function tokenizer(input, options = {}) {
  let css = input.css.valueOf()
  let ignore = options.ignoreErrors

  let code, next, quote, content, escape
  let escaped, escapePos, prev, n, currentToken

  let length = css.length
  let pos = 0
  let buffer = []
  let returned = []

  function position() {
    return pos
  }

  function unclosed(what) {
    throw input.error('Unclosed ' + what, pos)
  }

  function endOfFile() {
    return returned.length === 0 && pos >= length
  }

  function nextToken(opts) {
    if (returned.length) return returned.pop()
    if (pos >= length) return

    let ignoreUnclosed = opts ? opts.ignoreUnclosed : false

    code = css.charCodeAt(pos)

    switch (code) {
      case NEWLINE:
      case SPACE:
      case TAB:
      case CR:
      case FEED: {
        next = pos
        do {
          next += 1
          code = css.charCodeAt(next)
        } while (
          code === SPACE ||
          code === NEWLINE ||
          code === TAB ||
          code === CR ||
          code === FEED
        )

        currentToken = ['space', css.slice(pos, next)]
        pos = next - 1
        break
      }

      case OPEN_SQUARE:
      case CLOSE_SQUARE:
      case OPEN_CURLY:
      case CLOSE_CURLY:
      case COLON:
      case SEMICOLON:
      case CLOSE_PARENTHESES: {
        let controlChar = String.fromCharCode(code)
        currentToken = [controlChar, controlChar, pos]
        break
      }

      case OPEN_PARENTHESES: {
        prev = buffer.length ? buffer.pop()[1] : ''
        n = css.charCodeAt(pos + 1)
        if (
          prev === 'url' &&
          n !== SINGLE_QUOTE &&
          n !== DOUBLE_QUOTE &&
          n !== SPACE &&
          n !== NEWLINE &&
          n !== TAB &&
          n !== FEED &&
          n !== CR
        ) {
          next = pos
          do {
            escaped = false
            next = css.indexOf(')', next + 1)
            if (next === -1) {
              if (ignore || ignoreUnclosed) {
                next = pos
                break
              } else {
                unclosed('bracket')
              }
            }
            escapePos = next
            while (css.charCodeAt(escapePos - 1) === BACKSLASH) {
              escapePos -= 1
              escaped = !escaped
            }
          } while (escaped)

          currentToken = ['brackets', css.slice(pos, next + 1), pos, next]

          pos = next
        } else {
          next = css.indexOf(')', pos + 1)
          content = css.slice(pos, next + 1)

          if (next === -1 || RE_BAD_BRACKET.test(content)) {
            currentToken = ['(', '(', pos]
          } else {
            currentToken = ['brackets', content, pos, next]
            pos = next
          }
        }

        break
      }

      case SINGLE_QUOTE:
      case DOUBLE_QUOTE: {
        quote = code === SINGLE_QUOTE ? "'" : '"'
        next = pos
        do {
          escaped = false
          next = css.indexOf(quote, next + 1)
          if (next === -1) {
            if (ignore || ignoreUnclosed) {
              next = pos + 1
              break
            } else {
              unclosed('string')
            }
          }
          escapePos = next
          while (css.charCodeAt(escapePos - 1) === BACKSLASH) {
            escapePos -= 1
            escaped = !escaped
          }
        } while (escaped)

        currentToken = ['string', css.slice(pos, next + 1), pos, next]
        pos = next
        break
      }

      case AT: {
        RE_AT_END.lastIndex = pos + 1
        RE_AT_END.test(css)
        if (RE_AT_END.lastIndex === 0) {
          next = css.length - 1
        } else {
          next = RE_AT_END.lastIndex - 2
        }

        currentToken = ['at-word', css.slice(pos, next + 1), pos, next]

        pos = next
        break
      }

      case BACKSLASH: {
        next = pos
        escape = true
        while (css.charCodeAt(next + 1) === BACKSLASH) {
          next += 1
          escape = !escape
        }
        code = css.charCodeAt(next + 1)
        if (
          escape &&
          code !== SLASH &&
          code !== SPACE &&
          code !== NEWLINE &&
          code !== TAB &&
          code !== CR &&
          code !== FEED
        ) {
          next += 1
          if (RE_HEX_ESCAPE.test(css.charAt(next))) {
            while (RE_HEX_ESCAPE.test(css.charAt(next + 1))) {
              next += 1
            }
            if (css.charCodeAt(next + 1) === SPACE) {
              next += 1
            }
          }
        }

        currentToken = ['word', css.slice(pos, next + 1), pos, next]

        pos = next
        break
      }

      default: {
        if (code === SLASH && css.charCodeAt(pos + 1) === ASTERISK) {
          next = css.indexOf('*/', pos + 2) + 1
          if (next === 0) {
            if (ignore || ignoreUnclosed) {
              next = css.length
            } else {
              unclosed('comment')
            }
          }

          currentToken = ['comment', css.slice(pos, next + 1), pos, next]
          pos = next
        } else {
          RE_WORD_END.lastIndex = pos + 1
          RE_WORD_END.test(css)
          if (RE_WORD_END.lastIndex === 0) {
            next = css.length - 1
          } else {
            next = RE_WORD_END.lastIndex - 2
          }

          currentToken = ['word', css.slice(pos, next + 1), pos, next]
          buffer.push(currentToken)
          pos = next
        }

        break
      }
    }

    pos++
    return currentToken
  }

  function back(token) {
    returned.push(token)
  }

  return {
    back,
    nextToken,
    endOfFile,
    position
  }
}


/***/ }),

/***/ "./node_modules/postcss/lib/warn-once.js":
/*!***********************************************!*\
  !*** ./node_modules/postcss/lib/warn-once.js ***!
  \***********************************************/
/***/ ((module) => {

"use strict";
/* eslint-disable no-console */


let printed = {}

module.exports = function warnOnce(message) {
  if (printed[message]) return
  printed[message] = true

  if (typeof console !== 'undefined' && console.warn) {
    console.warn(message)
  }
}


/***/ }),

/***/ "./node_modules/postcss/lib/warning.js":
/*!*********************************************!*\
  !*** ./node_modules/postcss/lib/warning.js ***!
  \*********************************************/
/***/ ((module) => {

"use strict";


class Warning {
  constructor(text, opts = {}) {
    this.type = 'warning'
    this.text = text

    if (opts.node && opts.node.source) {
      let range = opts.node.rangeBy(opts)
      this.line = range.start.line
      this.column = range.start.column
      this.endLine = range.end.line
      this.endColumn = range.end.column
    }

    for (let opt in opts) this[opt] = opts[opt]
  }

  toString() {
    if (this.node) {
      return this.node.error(this.text, {
        plugin: this.plugin,
        index: this.index,
        word: this.word
      }).message
    }

    if (this.plugin) {
      return this.plugin + ': ' + this.text
    }

    return this.text
  }
}

module.exports = Warning
Warning.default = Warning


/***/ }),

/***/ "./src/components/getTodo.js":
/*!***********************************!*\
  !*** ./src/components/getTodo.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _listItemObject__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./listItemObject */ "./src/components/listItemObject.js");
/* harmony import */ var _manageDOM__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./manageDOM */ "./src/components/manageDOM.js");
/* harmony import */ var _localStorage__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./localStorage */ "./src/components/localStorage.js");
/* harmony import */ var postcss__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! postcss */ "./node_modules/postcss/lib/postcss.mjs");







const getTodo = (()=>{
    let projectList=[];
 
     document.querySelector('#projectFormSend').addEventListener('click',(e)=>{
        if(document.querySelector('#projectName').value === '' || validateProjectName()=== false){
            document.querySelector('#projectName').style.border = `1px solid red`;
        }else{ 
        document.querySelector('#projectName').style.border = `1px solid white`;
         e.preventDefault()
         let newProject = _listItemObject__WEBPACK_IMPORTED_MODULE_0__["default"].project()
         newProject.projectName = document.querySelector('#projectName').value;
         newProject.projectContent = []
         projectList.push(newProject)
         _manageDOM__WEBPACK_IMPORTED_MODULE_1__["default"].appendProject(projectList,'newProject')
         _localStorage__WEBPACK_IMPORTED_MODULE_2__["default"].setStorage();
        document.querySelector('.projectFormBackground').classList.remove('show')
        document.querySelector('#projectform').reset()
        }
    })



    document.querySelector('#formSend').addEventListener('click',(e)=>{
        let projectIndex = currentProject();
        if(document.querySelector('#name').value === '' || validateName() === false){
            document.querySelector('#name').style.border = `1px solid red`;
        }else{ 
        e.preventDefault();
        let newItem = _listItemObject__WEBPACK_IMPORTED_MODULE_0__["default"].listItem();
        newItem.itemName = document.querySelector('#name').value;
        newItem.itemNote = document.querySelector('#note').value;
        if(document.querySelector('.formDate').value !== ''){
            newItem.itemDate = document.querySelector('.formDate').value;
        }else if(document.querySelector('.formDate').value === '') {
            newItem.itemDate = 'No date'}
        if(newItem.itemNote === ''){newItem.itemNote = 'No details'}
        projectList[projectIndex].projectContent.push(newItem);
        document.querySelector('#form').reset()
        _manageDOM__WEBPACK_IMPORTED_MODULE_1__["default"].appendList(projectList[projectIndex].projectContent[getTodo.projectList[projectIndex].projectContent.length-1])
        document.querySelector('.formBackground').classList.remove('show')
        _localStorage__WEBPACK_IMPORTED_MODULE_2__["default"].setStorage();
        }
    })

    const validateName = ()=>{
        const projectIndex = currentProject();
        for(let i = 0;i<projectList[projectIndex].projectContent.length;i++){
            if(projectList[projectIndex].projectContent[i].itemName === document.querySelector('#name').value){
                alert('Name already in use')
                return false
            }
        }
    }

    const validateProjectName = ()=>{
        for(let i =0;i<projectList.length;i++){
            if(projectList[i].projectName === document.querySelector('#projectName').value)
            alert('Name already in use')
            return false;
        }
    }

    
    const currentProject = ()=>{
        let name = document.querySelector('.projectName').textContent;
        for(let i =0;projectList.length;i++){
            if(projectList[i].projectName === name ){
                return i
            }
        }
    }

    return {projectList}
})();

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (getTodo);

/***/ }),

/***/ "./src/components/listItemObject.js":
/*!******************************************!*\
  !*** ./src/components/listItemObject.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const projectArray = (()=>{

    const listItem = (name,note,date)=>{
        let itemName = name;
        let itemNote = note;
        let itemDate = date
        let completed = false;

        return{
            itemName,
            itemNote,
            itemDate,
            completed
        }
    }

    const project =(name,listItem)=>{
        let projectName = name;
        let projectContent = listItem
        
        return{
            projectName,
            projectContent
        }
    }

    return {
        listItem,
        project
    }
})();





/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (projectArray);

/***/ }),

/***/ "./src/components/localStorage.js":
/*!****************************************!*\
  !*** ./src/components/localStorage.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _getTodo__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./getTodo */ "./src/components/getTodo.js");
/* harmony import */ var _manageDOM__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./manageDOM */ "./src/components/manageDOM.js");
/* harmony import */ var _listItemObject__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./listItemObject */ "./src/components/listItemObject.js");




const storageManangement = (()=>{
    const setStorage = ()=>{
        localStorage.setItem("storedInfo", JSON.stringify(_getTodo__WEBPACK_IMPORTED_MODULE_0__["default"].projectList))
    }
    
    document.addEventListener('DOMContentLoaded',()=>{
        let parsedInfo  = JSON.parse(localStorage.getItem("storedInfo")) || []
        parsedInfo.forEach(element => {
            document.querySelector('.projectName').textContent = element.projectName
            _getTodo__WEBPACK_IMPORTED_MODULE_0__["default"].projectList.push(element);
   
        })
        load()
    })

    function load(){
        if(_getTodo__WEBPACK_IMPORTED_MODULE_0__["default"].projectList.length === 0){
        _getTodo__WEBPACK_IMPORTED_MODULE_0__["default"].projectList[0] = _listItemObject__WEBPACK_IMPORTED_MODULE_2__["default"].project()
        _getTodo__WEBPACK_IMPORTED_MODULE_0__["default"].projectList[0].projectName = 'My project'
        _getTodo__WEBPACK_IMPORTED_MODULE_0__["default"].projectList[0].projectContent = []
        _manageDOM__WEBPACK_IMPORTED_MODULE_1__["default"].appendProject(_getTodo__WEBPACK_IMPORTED_MODULE_0__["default"].projectList,'newProject')
        }else{
            _getTodo__WEBPACK_IMPORTED_MODULE_0__["default"].projectList.forEach(element=>{_manageDOM__WEBPACK_IMPORTED_MODULE_1__["default"].appendProject(element)})
            document.querySelector('.projectName').textContent = _getTodo__WEBPACK_IMPORTED_MODULE_0__["default"].projectList[0].projectName;
            _getTodo__WEBPACK_IMPORTED_MODULE_0__["default"].projectList[0].projectContent.forEach(element => {
                _manageDOM__WEBPACK_IMPORTED_MODULE_1__["default"].appendList(element)
            });
        }
    }
    return {
        setStorage
    }
})();

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (storageManangement);


/***/ }),

/***/ "./src/components/manageDOM.js":
/*!*************************************!*\
  !*** ./src/components/manageDOM.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _getTodo__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./getTodo */ "./src/components/getTodo.js");
/* harmony import */ var _localStorage__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./localStorage */ "./src/components/localStorage.js");



const DOMmanagement = (()=>{

    document.querySelector('.newTodo').addEventListener('click',()=>{
        document.querySelector('.formBackground').classList.toggle('show');
        closeForm('.formBackground')
    })

    document.querySelector('#addProject').addEventListener('click',()=>{
        document.querySelector('.projectFormBackground').classList.toggle('show')
        closeForm('.projectFormBackground')
    })

    document.querySelector('.closeForm').addEventListener('click',()=>{
        document.querySelector('#form').reset()
        document.querySelector('.formBackground').classList.remove('show')
    })

    document.querySelector('.closeProjectForm').addEventListener('click',()=>{
        document.querySelector('#projectform').reset()
        document.querySelector('.projectFormBackground').classList.remove('show')
    })
    
    document.querySelector('.menu_button').addEventListener('click',()=>{
        document.querySelector('.menu_button').classList.toggle('open')
        document.querySelector('.sideBar').classList.toggle('open')
    })

    const appendList = (itemList)=>{
        const container =  document.querySelector('.itemContainer');
        let itemDiv = document.createElement('div');
        itemDiv.classList.add('item')
        container.appendChild(itemDiv);

        addCheckbox(itemDiv);

        let nameDiv = document.createElement('div')
        nameDiv.addEventListener('click',editContent.bind(null,'input',nameDiv));
        nameDiv.classList.add('name')
        itemDiv.appendChild(nameDiv)
        nameDiv.textContent = itemList.itemName

        addDatePicker(itemList,itemDiv);

        changeStatusDOM(itemList,itemDiv)

        let noteDiv = document.createElement('div')
        noteDiv.classList.add('note')
        noteDiv.addEventListener('click',editContent.bind(null,'textarea',noteDiv));
        itemDiv.appendChild(noteDiv)
        noteDiv.textContent = itemList.itemNote

        let arrow = document.createElement('arrow')
        arrow.classList.add('arrow')
        arrow.innerHTML = `<i class="fas fa-angle-right"></i>`
        arrow.addEventListener('click',showNote);
        itemDiv.appendChild(arrow)
        addButton(itemDiv);
    }

    function addCheckbox(itemDiv){
        let newCheckbox = document.createElement('input')
        newCheckbox.type = 'checkbox';
        newCheckbox.classList.add('checkbox')
        newCheckbox.addEventListener('click',changeStatus)
        itemDiv.insertBefore(newCheckbox,itemDiv.firstChild);
    }

    function addButton(itemDiv){
        let itemDeleteButton = document.createElement('div');
        itemDeleteButton.addEventListener('click', deleteButton);
        itemDeleteButton.classList.add('itemDelete');
        itemDeleteButton.innerHTML= '<i class="fas fa-trash"></i>'
        itemDiv.appendChild(itemDeleteButton);
    }


    function addDatePicker(itemList,itemDiv){
        let dateInput = document.createElement('div')
        dateInput.classList.add('dateText')
        dateInput.addEventListener('click',editDate.bind(null,itemList,itemDiv))
        dateInput.textContent = itemList.itemDate
        itemDiv.appendChild(dateInput)
    }

    
    function deleteButton(event){
        let currentProject = setCurrentProject(document.querySelector('.projectName').textContent)
       let todo = event.target.parentNode.parentNode
       let todoName = todo.querySelector('.name').textContent;
       for(let i = 0;i<_getTodo__WEBPACK_IMPORTED_MODULE_0__["default"].projectList[currentProject].projectContent.length;i++)
        if(_getTodo__WEBPACK_IMPORTED_MODULE_0__["default"].projectList[currentProject].projectContent[i].itemName == todoName){
            
            _getTodo__WEBPACK_IMPORTED_MODULE_0__["default"].projectList[currentProject].projectContent.splice(i,1);
        }
        todo.remove()
        _localStorage__WEBPACK_IMPORTED_MODULE_1__["default"].setStorage();
    } 
       
        


    const closeForm=(background)=>{
        document.querySelector(background).addEventListener('click',function(e){
            if(e.target !== e.currentTarget) return
            document.querySelector('#form').reset()
            document.querySelector(background).classList.remove('show')
        })
    }

    const editContent=(type,name)=>{
        const nameDiv = name;
        const input = document.createElement(type)
        input.value = nameDiv.textContent;
        let temp = nameDiv.textContent;
        nameDiv.textContent = '';
        input.classList.add('input')
        input.addEventListener('focusout',confirmEdit.bind(null,input,nameDiv,temp,type))
        nameDiv.appendChild(input)
        input.focus()
        nameDiv.addEventListener('keyup',(event)=>{
            if(event.keyCode==13){input.blur()}})
    }

    const confirmEdit=(input,nameDiv,temp,type)=>{
        let itemType;
        const projectName =document.querySelector('.projectName').textContent
        for(let i=0;i<_getTodo__WEBPACK_IMPORTED_MODULE_0__["default"].projectList.length;i++){
            if(projectName === _getTodo__WEBPACK_IMPORTED_MODULE_0__["default"].projectList[i].projectName){
                for(let j = 0;i<_getTodo__WEBPACK_IMPORTED_MODULE_0__["default"].projectList[i].projectContent.length;j++){
                    if(type === 'input'){
                        itemType = _getTodo__WEBPACK_IMPORTED_MODULE_0__["default"].projectList[i].projectContent[j].itemName
                        _getTodo__WEBPACK_IMPORTED_MODULE_0__["default"].projectList[i].projectContent[j].itemName = input.value;
                    }else if (type === 'textarea'){
                        itemType = _getTodo__WEBPACK_IMPORTED_MODULE_0__["default"].projectList[i].projectContent[j].itemNote
                        _getTodo__WEBPACK_IMPORTED_MODULE_0__["default"].projectList[i].projectContent[j].itemNote = input.value;
                    }
                    if(itemType === temp){
                        itemType = input.value;
                        nameDiv.textContent = input.value;
                        _localStorage__WEBPACK_IMPORTED_MODULE_1__["default"].setStorage();
                        input.remove()
                        return
                    }
                }
            }
        }
    }

    const editDate = (itemList,itemDiv)=>{
       const dateDiv =  itemDiv.querySelector('.dateText')
       const dateInput = document.createElement('input')
       dateInput.type = 'date'
       dateInput.classList.add('date')
       dateInput.value = dateDiv.textContent
       dateDiv.remove()
       dateInput.addEventListener('focusout', confirmDateEdit.bind(null,itemList,itemDiv,dateInput))
       itemDiv.appendChild(dateInput)
    }

    const confirmDateEdit =(itemList,itemDiv,dateInput)=>{
        itemList.itemDate = dateInput.value
        _localStorage__WEBPACK_IMPORTED_MODULE_1__["default"].setStorage();
        addDatePicker(itemList,itemDiv)
        dateInput.remove()
    }

    const showNote = (event)=>{
        let item = event.target.parentNode.parentNode;
        item.querySelector('.note').classList.toggle('show')
        if(item.querySelector('.note').classList.contains('show')){
            item.querySelector('.arrow').innerHTML = `<i class="fas fa-angle-down"></i>`
        }else{
            item.querySelector('arrow').innerHTML = `<i class="fas fa-angle-right"></i>`
        }
    }

    const appendProject = (projectList,source)=>{
        const container = document.querySelector('.projectContainer');
        const project = document.createElement('div');
        project.classList.add('sideBarProject')
        const name = document.createElement('p')
        if(source === 'newProject'){
            name.textContent = projectList[projectList.length-1].projectName 
        }else(
            name.textContent = projectList.projectName
            )
            name.addEventListener('click',changeProject)
        const deleteIcon = document.createElement('div');
        deleteIcon.innerHTML = `<i class="fas fa-times"></i>`
        deleteIcon.addEventListener('click',deleteProject)
        deleteIcon.classList.add('deleteProject')
        project.appendChild(name)
        project.appendChild(deleteIcon)
        container.appendChild(project)
        document.querySelector('.projectName').textContent = name.textContent
    }

    const deleteProject=(event)=>{
        const projectContainer = event.target.parentNode.parentNode
        const projectName = projectContainer.querySelector('p').textContent
        for(let i=0;i<_getTodo__WEBPACK_IMPORTED_MODULE_0__["default"].projectList.length;i++){
            if(_getTodo__WEBPACK_IMPORTED_MODULE_0__["default"].projectList[i].projectName === projectName){
                _getTodo__WEBPACK_IMPORTED_MODULE_0__["default"].projectList.splice(i,1);
                while(document.querySelector('.itemContainer').firstChild){document.querySelector('.itemContainer').firstChild.remove()}
                if(i+1<_getTodo__WEBPACK_IMPORTED_MODULE_0__["default"].projectList.length){
                        console.log(i+1,_getTodo__WEBPACK_IMPORTED_MODULE_0__["default"].projectList.length)
                        document.querySelector('.projectName').textContent = _getTodo__WEBPACK_IMPORTED_MODULE_0__["default"].projectList[i+1].projectName
                        for(let j=0;j<_getTodo__WEBPACK_IMPORTED_MODULE_0__["default"].projectList[i+1].projectContent[j].length;j++){
                        appendList(_getTodo__WEBPACK_IMPORTED_MODULE_0__["default"].projectList[i+1].projectContent[j]);
                        break;
                    }
                }else{
                    document.querySelector('.projectName').textContent = _getTodo__WEBPACK_IMPORTED_MODULE_0__["default"].projectList[i-1].projectName
                    for(let j=0;j<_getTodo__WEBPACK_IMPORTED_MODULE_0__["default"].projectList[i-1].projectContent.length;j++){
                    appendList(_getTodo__WEBPACK_IMPORTED_MODULE_0__["default"].projectList[i-1].projectContent[j]);
                }
                break;
            }
        }
        projectContainer.remove()
        _localStorage__WEBPACK_IMPORTED_MODULE_1__["default"].setStorage();
        }
    }

    const changeProject = (event)=>{
        let name = event.target.firstChild.textContent;
        document.querySelector('.projectName').textContent = name;

        let currentProject= setCurrentProject(name);
        
        while(document.querySelector('.itemContainer').firstChild){
            document.querySelector('.itemContainer').lastChild.remove()
        }
        
        for(let i = 0;i<_getTodo__WEBPACK_IMPORTED_MODULE_0__["default"].projectList[currentProject].projectContent.length;i++){
            appendList(_getTodo__WEBPACK_IMPORTED_MODULE_0__["default"].projectList[currentProject].projectContent[i])
        }
            
    }
    
    const setCurrentProject=(name) =>{
        for(let i = 0; i<_getTodo__WEBPACK_IMPORTED_MODULE_0__["default"].projectList.length;i++){
            if(_getTodo__WEBPACK_IMPORTED_MODULE_0__["default"].projectList[i].projectName === name){
                 return  i;
            }
        }
    }

    const changeStatus=(event)=>{
        if(event.target !== event.currentTarget) return
        let item = event.target.parentNode
        let itemName = item.querySelector('.name').textContent
        const projectName =document.querySelector('.projectName').textContent
        for(let i=0;i<_getTodo__WEBPACK_IMPORTED_MODULE_0__["default"].projectList.length;i++){
            if(projectName === _getTodo__WEBPACK_IMPORTED_MODULE_0__["default"].projectList[i].projectName){
                for(let j = 0;j<_getTodo__WEBPACK_IMPORTED_MODULE_0__["default"].projectList[i].projectContent.length;j++){
                    if(_getTodo__WEBPACK_IMPORTED_MODULE_0__["default"].projectList[i].projectContent[j].itemName === itemName){
                        changeStatusDOM(_getTodo__WEBPACK_IMPORTED_MODULE_0__["default"].projectList[i].projectContent[j],item,'true')
                        break;
                    }
                }
            }
        }
        
    }

    const changeStatusDOM=(item,itemDiv,source)=>{
        if(source === 'true'){
            item.completed = !item.completed
        }
        if(item.completed){
            itemDiv.querySelector('.name').classList.add('strike')
            itemDiv.style.background = '#4bb44b'
            const checkedIcon =  document.createElement('div')
            checkedIcon.innerHTML = `<i class="fas fa-check"></i>`
            checkedIcon.classList.add('checkedIcon')
            checkedIcon.addEventListener('click',uncheck.bind(null,item,itemDiv))
            itemDiv.insertBefore(checkedIcon,itemDiv.querySelector('.name'))
            itemDiv.querySelector('.checkbox').style.visibility = 'hidden'
        }else if(!item.completed){ 
            itemDiv.querySelector('.name').classList.remove('strike')
            itemDiv.style.background = `#000000`
            itemDiv.querySelector('.checkbox').style.visibility = 'visible'
            itemDiv.querySelector('.checkbox').checked = false;
            if(itemDiv.querySelector('.checkedIcon') !== null) itemDiv.querySelector('.checkedIcon').remove()
        }    
            _localStorage__WEBPACK_IMPORTED_MODULE_1__["default"].setStorage();
    }

    
    const uncheck=(item,itemDiv)=>{
        itemDiv.querySelector('input').style.visibility = 'visible'
        changeStatusDOM(item,itemDiv,'true')
    }
        


     return {appendList,
            appendProject
            }
})();

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (DOMmanagement);

/***/ }),

/***/ "?5580":
/*!**************************************!*\
  !*** ./terminal-highlight (ignored) ***!
  \**************************************/
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ "?03fb":
/*!********************!*\
  !*** fs (ignored) ***!
  \********************/
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ "?6197":
/*!**********************!*\
  !*** path (ignored) ***!
  \**********************/
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ "?b8cb":
/*!*******************************!*\
  !*** source-map-js (ignored) ***!
  \*******************************/
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ "?c717":
/*!*********************!*\
  !*** url (ignored) ***!
  \*********************/
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ "./node_modules/nanoid/non-secure/index.cjs":
/*!**************************************************!*\
  !*** ./node_modules/nanoid/non-secure/index.cjs ***!
  \**************************************************/
/***/ ((module) => {

let urlAlphabet =
  'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict'
let customAlphabet = (alphabet, size) => {
  return () => {
    let id = ''
    let i = size
    while (i--) {
      id += alphabet[(Math.random() * alphabet.length) | 0]
    }
    return id
  }
}
let nanoid = (size = 21) => {
  let id = ''
  let i = size
  while (i--) {
    id += urlAlphabet[(Math.random() * 64) | 0]
  }
  return id
}
module.exports = { nanoid, customAlphabet }


/***/ }),

/***/ "./node_modules/postcss/lib/postcss.mjs":
/*!**********************************************!*\
  !*** ./node_modules/postcss/lib/postcss.mjs ***!
  \**********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   "stringify": () => (/* binding */ stringify),
/* harmony export */   "fromJSON": () => (/* binding */ fromJSON),
/* harmony export */   "plugin": () => (/* binding */ plugin),
/* harmony export */   "parse": () => (/* binding */ parse),
/* harmony export */   "list": () => (/* binding */ list),
/* harmony export */   "document": () => (/* binding */ document),
/* harmony export */   "comment": () => (/* binding */ comment),
/* harmony export */   "atRule": () => (/* binding */ atRule),
/* harmony export */   "rule": () => (/* binding */ rule),
/* harmony export */   "decl": () => (/* binding */ decl),
/* harmony export */   "root": () => (/* binding */ root),
/* harmony export */   "CssSyntaxError": () => (/* binding */ CssSyntaxError),
/* harmony export */   "Declaration": () => (/* binding */ Declaration),
/* harmony export */   "Container": () => (/* binding */ Container),
/* harmony export */   "Processor": () => (/* binding */ Processor),
/* harmony export */   "Document": () => (/* binding */ Document),
/* harmony export */   "Comment": () => (/* binding */ Comment),
/* harmony export */   "Warning": () => (/* binding */ Warning),
/* harmony export */   "AtRule": () => (/* binding */ AtRule),
/* harmony export */   "Result": () => (/* binding */ Result),
/* harmony export */   "Input": () => (/* binding */ Input),
/* harmony export */   "Rule": () => (/* binding */ Rule),
/* harmony export */   "Root": () => (/* binding */ Root),
/* harmony export */   "Node": () => (/* binding */ Node)
/* harmony export */ });
/* harmony import */ var _postcss_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./postcss.js */ "./node_modules/postcss/lib/postcss.js");


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_postcss_js__WEBPACK_IMPORTED_MODULE_0__);

const stringify = _postcss_js__WEBPACK_IMPORTED_MODULE_0__.stringify
const fromJSON = _postcss_js__WEBPACK_IMPORTED_MODULE_0__.fromJSON
const plugin = _postcss_js__WEBPACK_IMPORTED_MODULE_0__.plugin
const parse = _postcss_js__WEBPACK_IMPORTED_MODULE_0__.parse
const list = _postcss_js__WEBPACK_IMPORTED_MODULE_0__.list

const document = _postcss_js__WEBPACK_IMPORTED_MODULE_0__.document
const comment = _postcss_js__WEBPACK_IMPORTED_MODULE_0__.comment
const atRule = _postcss_js__WEBPACK_IMPORTED_MODULE_0__.atRule
const rule = _postcss_js__WEBPACK_IMPORTED_MODULE_0__.rule
const decl = _postcss_js__WEBPACK_IMPORTED_MODULE_0__.decl
const root = _postcss_js__WEBPACK_IMPORTED_MODULE_0__.root

const CssSyntaxError = _postcss_js__WEBPACK_IMPORTED_MODULE_0__.CssSyntaxError
const Declaration = _postcss_js__WEBPACK_IMPORTED_MODULE_0__.Declaration
const Container = _postcss_js__WEBPACK_IMPORTED_MODULE_0__.Container
const Processor = _postcss_js__WEBPACK_IMPORTED_MODULE_0__.Processor
const Document = _postcss_js__WEBPACK_IMPORTED_MODULE_0__.Document
const Comment = _postcss_js__WEBPACK_IMPORTED_MODULE_0__.Comment
const Warning = _postcss_js__WEBPACK_IMPORTED_MODULE_0__.Warning
const AtRule = _postcss_js__WEBPACK_IMPORTED_MODULE_0__.AtRule
const Result = _postcss_js__WEBPACK_IMPORTED_MODULE_0__.Result
const Input = _postcss_js__WEBPACK_IMPORTED_MODULE_0__.Input
const Rule = _postcss_js__WEBPACK_IMPORTED_MODULE_0__.Rule
const Root = _postcss_js__WEBPACK_IMPORTED_MODULE_0__.Root
const Node = _postcss_js__WEBPACK_IMPORTED_MODULE_0__.Node


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _components_getTodo__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./components/getTodo */ "./src/components/getTodo.js");
/* harmony import */ var _components_manageDOM__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./components/manageDOM */ "./src/components/manageDOM.js");
/* harmony import */ var _components_listItemObject__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./components/listItemObject */ "./src/components/listItemObject.js");






})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQTtBQUNBLHVCQUF1QixRQUFRO0FBQy9CO0FBQ0EsMkJBQTJCOzs7Ozs7Ozs7Ozs7QUNIZjs7QUFFWixnQkFBZ0IsbUJBQU8sQ0FBQyw0REFBYTs7QUFFckM7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7Ozs7Ozs7Ozs7OztBQ3hCWTs7QUFFWixXQUFXLG1CQUFPLENBQUMsa0RBQVE7O0FBRTNCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7QUNaWTs7QUFFWixNQUFNLGNBQWMsRUFBRSxtQkFBTyxDQUFDLHdEQUFXO0FBQ3pDLGtCQUFrQixtQkFBTyxDQUFDLGdFQUFlO0FBQ3pDLGNBQWMsbUJBQU8sQ0FBQyx3REFBVztBQUNqQyxXQUFXLG1CQUFPLENBQUMsa0RBQVE7O0FBRTNCOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsS0FBSztBQUNMOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0EsS0FBSzs7QUFFTDs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFD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O0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakIsUUFBUTtBQUNSO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0EsUUFBUSxJQUFxQztBQUM3QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FB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O0FBQ0E7O0FBRUE7QUFDQSx1QkFBdUI7QUFDdkI7QUFDQTtBQUNBO0FBQ0EsVUFBVSxvQkFBb0I7QUFDOUI7QUFDQTtBQUNBLFVBQVUsb0JBQW9CO0FBQzlCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLG9CQUFvQixZQUFZO0FBQ2hDO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQkFBMEI7QUFDMUI7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBLCtCQUErQjtBQUMvQjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBOztBQUVBO0FBQ0E7QUFDQSxNQUFNO0FBQ04sMkRBQTJEO0FBQzNEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxvQkFBb0IsdUJBQXVCO0FBQzNDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EscUNBQXFDOztBQUVyQztBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBOztBQUVBO0FBQ0EsbUJBQW1CO0FBQ25COztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQSxNQUFNO0FBQ047QUFDQSxNQUFNO0FBQ047QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsMkJBQTJCLGNBQWM7QUFDekM7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7O0FDaFdZOztBQUVaLGtCQUFrQixtQkFBTyxDQUFDLGdFQUFlOztBQUV6QztBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7QUNWWTs7QUFFWixzQkFBc0I7O0FBRXRCLGlCQUFpQjs7Ozs7Ozs7Ozs7O0FDSkw7O0FBRVo7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckIsc0JBQXNCO0FBQ3RCLG9CQUFvQjtBQUNwQjtBQUNBO0FBQ0E7O0FBRUEsb0NBQW9DLE9BQU87QUFDM0MsdUNBQXVDLFFBQVE7QUFDL0M7QUFDQTs7QUFFQSx1REFBdUQ7QUFDdkQ7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0I7QUFDaEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7O0FBRVo7O0FBRUE7QUFDQSxVQUFVO0FBQ1Y7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTs7QUFFVjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQ3pRQTtBQUNZOztBQUVaOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7O0FDWlk7O0FBRVo7QUFDQSw2QkFBNkI7QUFDN0I7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDcEM0QztBQUNKO0FBQ1E7QUFDaEI7QUFDaEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSwwQkFBMEIsK0RBQW9CO0FBQzlDO0FBQ0E7QUFDQTtBQUNBLFNBQVMsZ0VBQTJCO0FBQ3BDLFNBQVMsZ0VBQTZCO0FBQ3RDO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBLHNCQUFzQixnRUFBcUI7QUFDM0M7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQSxvQ0FBb0M7QUFDcEM7QUFDQTtBQUNBLFFBQVEsNkRBQXdCO0FBQ2hDO0FBQ0EsUUFBUSxnRUFBNkI7QUFDckM7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLGtEQUFrRDtBQUN4RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCLHFCQUFxQjtBQUMxQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUIsbUJBQW1CO0FBQ3hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQSxpRUFBZSxPQUFPOzs7Ozs7Ozs7Ozs7Ozs7QUNsRnRCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUVBQWUsWUFBWTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDcENLO0FBQ1E7QUFDSTtBQUM1QztBQUNBO0FBQ0E7QUFDQSwwREFBMEQsNERBQW1CO0FBQzdFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksaUVBQXdCO0FBQ3BDO0FBQ0EsU0FBUztBQUNUO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxXQUFXLG1FQUEwQjtBQUNyQyxRQUFRLCtEQUFzQixHQUFHLCtEQUFvQjtBQUNyRCxRQUFRLDJFQUFrQztBQUMxQyxRQUFRLDhFQUFxQztBQUM3QyxRQUFRLGdFQUEyQixDQUFDLDREQUFtQjtBQUN2RCxTQUFTO0FBQ1QsWUFBWSxvRUFBMkIsV0FBVyxnRUFBMkIsVUFBVTtBQUN2RixpRUFBaUUsMkVBQWtDO0FBQ25HLFlBQVksc0ZBQTZDO0FBQ3pELGdCQUFnQiw2REFBd0I7QUFDeEMsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQSxpRUFBZSxrQkFBa0I7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3RDRDtBQUNnQjtBQUNoRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCLEVBQUUsNERBQW1CLHVDQUF1QztBQUNqRixXQUFXLDREQUFtQjtBQUM5QjtBQUNBLFlBQVksNERBQW1CO0FBQy9CO0FBQ0E7QUFDQSxRQUFRLGdFQUE2QjtBQUNyQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtDQUFrQyxjQUFjO0FBQ2hEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0IsRUFBRSxtRUFBMEIsQ0FBQztBQUNqRCwrQkFBK0IsNERBQW1CO0FBQ2xELDhCQUE4QixFQUFFLDREQUFtQiwwQkFBMEI7QUFDN0U7QUFDQSxtQ0FBbUMsNERBQW1CO0FBQ3RELHdCQUF3Qiw0REFBbUI7QUFDM0MscUJBQXFCO0FBQ3JCLG1DQUFtQyw0REFBbUI7QUFDdEQsd0JBQXdCLDREQUFtQjtBQUMzQztBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixnRUFBNkI7QUFDckQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUSxnRUFBNkI7QUFDckM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0IsRUFBRSxtRUFBMEIsQ0FBQztBQUNqRCxlQUFlLDREQUFtQjtBQUNsQyxnQkFBZ0IsbUVBQTBCO0FBQzFDLDJFQUEyRTtBQUMzRSx1QkFBdUIsbUVBQTBCO0FBQ2pELHdDQUF3QyxtRUFBMEI7QUFDbEUsNkVBQTZFLDREQUFtQjtBQUNoRyxvQ0FBb0MsRUFBRSw0REFBbUIsK0JBQStCO0FBQ3hGLG1DQUFtQyw0REFBbUI7QUFDdEQ7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQix5RUFBeUUsNERBQW1CO0FBQzVGLGdDQUFnQyxFQUFFLDREQUFtQiw0QkFBNEI7QUFDakYsK0JBQStCLDREQUFtQjtBQUNsRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUSxnRUFBNkI7QUFDckM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IsRUFBRSw0REFBbUIsdUNBQXVDO0FBQ2xGLHVCQUF1Qiw0REFBbUI7QUFDMUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVCQUF1QixFQUFFLG1FQUEwQixDQUFDO0FBQ3BELGVBQWUsNERBQW1CO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CLEVBQUUsbUVBQTBCLENBQUM7QUFDakQsK0JBQStCLDREQUFtQjtBQUNsRCw4QkFBOEIsRUFBRSw0REFBbUIsMEJBQTBCO0FBQzdFLHVCQUF1Qiw0REFBbUI7QUFDMUMsd0NBQXdDLDREQUFtQjtBQUMzRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxnRUFBNkI7QUFDekM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBLGlFQUFlLGFBQWE7Ozs7Ozs7Ozs7QUNqVDVCOzs7Ozs7Ozs7O0FDQUE7Ozs7Ozs7Ozs7QUNBQTs7Ozs7Ozs7OztBQ0FBOzs7Ozs7Ozs7O0FDQUE7Ozs7Ozs7Ozs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1COzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3BCZTs7QUFFbEMsaUVBQWUsd0NBQU87O0FBRWYsa0JBQWtCLGtEQUFpQjtBQUNuQyxpQkFBaUIsaURBQWdCO0FBQ2pDLGVBQWUsK0NBQWM7QUFDN0IsY0FBYyw4Q0FBYTtBQUMzQixhQUFhLDZDQUFZOztBQUV6QixpQkFBaUIsaURBQWdCO0FBQ2pDLGdCQUFnQixnREFBZTtBQUMvQixlQUFlLCtDQUFjO0FBQzdCLGFBQWEsNkNBQVk7QUFDekIsYUFBYSw2Q0FBWTtBQUN6QixhQUFhLDZDQUFZOztBQUV6Qix1QkFBdUIsdURBQXNCO0FBQzdDLG9CQUFvQixvREFBbUI7QUFDdkMsa0JBQWtCLGtEQUFpQjtBQUNuQyxrQkFBa0Isa0RBQWlCO0FBQ25DLGlCQUFpQixpREFBZ0I7QUFDakMsZ0JBQWdCLGdEQUFlO0FBQy9CLGdCQUFnQixnREFBZTtBQUMvQixlQUFlLCtDQUFjO0FBQzdCLGVBQWUsK0NBQWM7QUFDN0IsY0FBYyw4Q0FBYTtBQUMzQixhQUFhLDZDQUFZO0FBQ3pCLGFBQWEsNkNBQVk7QUFDekIsYUFBYSw2Q0FBWTs7Ozs7OztVQzdCaEM7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0N0QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQTs7Ozs7V0NQQTs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0Q7Ozs7Ozs7Ozs7Ozs7OztBQ04wQztBQUNRO0FBQ0k7QUFDdEQ7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL3RvZG9saXN0Ly4vbm9kZV9tb2R1bGVzL3BpY29jb2xvcnMvcGljb2NvbG9ycy5icm93c2VyLmpzIiwid2VicGFjazovL3RvZG9saXN0Ly4vbm9kZV9tb2R1bGVzL3Bvc3Rjc3MvbGliL2F0LXJ1bGUuanMiLCJ3ZWJwYWNrOi8vdG9kb2xpc3QvLi9ub2RlX21vZHVsZXMvcG9zdGNzcy9saWIvY29tbWVudC5qcyIsIndlYnBhY2s6Ly90b2RvbGlzdC8uL25vZGVfbW9kdWxlcy9wb3N0Y3NzL2xpYi9jb250YWluZXIuanMiLCJ3ZWJwYWNrOi8vdG9kb2xpc3QvLi9ub2RlX21vZHVsZXMvcG9zdGNzcy9saWIvY3NzLXN5bnRheC1lcnJvci5qcyIsIndlYnBhY2s6Ly90b2RvbGlzdC8uL25vZGVfbW9kdWxlcy9wb3N0Y3NzL2xpYi9kZWNsYXJhdGlvbi5qcyIsIndlYnBhY2s6Ly90b2RvbGlzdC8uL25vZGVfbW9kdWxlcy9wb3N0Y3NzL2xpYi9kb2N1bWVudC5qcyIsIndlYnBhY2s6Ly90b2RvbGlzdC8uL25vZGVfbW9kdWxlcy9wb3N0Y3NzL2xpYi9mcm9tSlNPTi5qcyIsIndlYnBhY2s6Ly90b2RvbGlzdC8uL25vZGVfbW9kdWxlcy9wb3N0Y3NzL2xpYi9pbnB1dC5qcyIsIndlYnBhY2s6Ly90b2RvbGlzdC8uL25vZGVfbW9kdWxlcy9wb3N0Y3NzL2xpYi9sYXp5LXJlc3VsdC5qcyIsIndlYnBhY2s6Ly90b2RvbGlzdC8uL25vZGVfbW9kdWxlcy9wb3N0Y3NzL2xpYi9saXN0LmpzIiwid2VicGFjazovL3RvZG9saXN0Ly4vbm9kZV9tb2R1bGVzL3Bvc3Rjc3MvbGliL21hcC1nZW5lcmF0b3IuanMiLCJ3ZWJwYWNrOi8vdG9kb2xpc3QvLi9ub2RlX21vZHVsZXMvcG9zdGNzcy9saWIvbm8td29yay1yZXN1bHQuanMiLCJ3ZWJwYWNrOi8vdG9kb2xpc3QvLi9ub2RlX21vZHVsZXMvcG9zdGNzcy9saWIvbm9kZS5qcyIsIndlYnBhY2s6Ly90b2RvbGlzdC8uL25vZGVfbW9kdWxlcy9wb3N0Y3NzL2xpYi9wYXJzZS5qcyIsIndlYnBhY2s6Ly90b2RvbGlzdC8uL25vZGVfbW9kdWxlcy9wb3N0Y3NzL2xpYi9wYXJzZXIuanMiLCJ3ZWJwYWNrOi8vdG9kb2xpc3QvLi9ub2RlX21vZHVsZXMvcG9zdGNzcy9saWIvcG9zdGNzcy5qcyIsIndlYnBhY2s6Ly90b2RvbGlzdC8uL25vZGVfbW9kdWxlcy9wb3N0Y3NzL2xpYi9wcmV2aW91cy1tYXAuanMiLCJ3ZWJwYWNrOi8vdG9kb2xpc3QvLi9ub2RlX21vZHVsZXMvcG9zdGNzcy9saWIvcHJvY2Vzc29yLmpzIiwid2VicGFjazovL3RvZG9saXN0Ly4vbm9kZV9tb2R1bGVzL3Bvc3Rjc3MvbGliL3Jlc3VsdC5qcyIsIndlYnBhY2s6Ly90b2RvbGlzdC8uL25vZGVfbW9kdWxlcy9wb3N0Y3NzL2xpYi9yb290LmpzIiwid2VicGFjazovL3RvZG9saXN0Ly4vbm9kZV9tb2R1bGVzL3Bvc3Rjc3MvbGliL3J1bGUuanMiLCJ3ZWJwYWNrOi8vdG9kb2xpc3QvLi9ub2RlX21vZHVsZXMvcG9zdGNzcy9saWIvc3RyaW5naWZpZXIuanMiLCJ3ZWJwYWNrOi8vdG9kb2xpc3QvLi9ub2RlX21vZHVsZXMvcG9zdGNzcy9saWIvc3RyaW5naWZ5LmpzIiwid2VicGFjazovL3RvZG9saXN0Ly4vbm9kZV9tb2R1bGVzL3Bvc3Rjc3MvbGliL3N5bWJvbHMuanMiLCJ3ZWJwYWNrOi8vdG9kb2xpc3QvLi9ub2RlX21vZHVsZXMvcG9zdGNzcy9saWIvdG9rZW5pemUuanMiLCJ3ZWJwYWNrOi8vdG9kb2xpc3QvLi9ub2RlX21vZHVsZXMvcG9zdGNzcy9saWIvd2Fybi1vbmNlLmpzIiwid2VicGFjazovL3RvZG9saXN0Ly4vbm9kZV9tb2R1bGVzL3Bvc3Rjc3MvbGliL3dhcm5pbmcuanMiLCJ3ZWJwYWNrOi8vdG9kb2xpc3QvLi9zcmMvY29tcG9uZW50cy9nZXRUb2RvLmpzIiwid2VicGFjazovL3RvZG9saXN0Ly4vc3JjL2NvbXBvbmVudHMvbGlzdEl0ZW1PYmplY3QuanMiLCJ3ZWJwYWNrOi8vdG9kb2xpc3QvLi9zcmMvY29tcG9uZW50cy9sb2NhbFN0b3JhZ2UuanMiLCJ3ZWJwYWNrOi8vdG9kb2xpc3QvLi9zcmMvY29tcG9uZW50cy9tYW5hZ2VET00uanMiLCJ3ZWJwYWNrOi8vdG9kb2xpc3QvaWdub3JlZHwvbW50L2MvVXNlcnMvbHVjYXMvRGVza3RvcC9kaXNlw7FvIHdlYi90b2RvbGlzdC9ub2RlX21vZHVsZXMvcG9zdGNzcy9saWJ8Li90ZXJtaW5hbC1oaWdobGlnaHQiLCJ3ZWJwYWNrOi8vdG9kb2xpc3QvaWdub3JlZHwvbW50L2MvVXNlcnMvbHVjYXMvRGVza3RvcC9kaXNlw7FvIHdlYi90b2RvbGlzdC9ub2RlX21vZHVsZXMvcG9zdGNzcy9saWJ8ZnMiLCJ3ZWJwYWNrOi8vdG9kb2xpc3QvaWdub3JlZHwvbW50L2MvVXNlcnMvbHVjYXMvRGVza3RvcC9kaXNlw7FvIHdlYi90b2RvbGlzdC9ub2RlX21vZHVsZXMvcG9zdGNzcy9saWJ8cGF0aCIsIndlYnBhY2s6Ly90b2RvbGlzdC9pZ25vcmVkfC9tbnQvYy9Vc2Vycy9sdWNhcy9EZXNrdG9wL2Rpc2XDsW8gd2ViL3RvZG9saXN0L25vZGVfbW9kdWxlcy9wb3N0Y3NzL2xpYnxzb3VyY2UtbWFwLWpzIiwid2VicGFjazovL3RvZG9saXN0L2lnbm9yZWR8L21udC9jL1VzZXJzL2x1Y2FzL0Rlc2t0b3AvZGlzZcOxbyB3ZWIvdG9kb2xpc3Qvbm9kZV9tb2R1bGVzL3Bvc3Rjc3MvbGlifHVybCIsIndlYnBhY2s6Ly90b2RvbGlzdC8uL25vZGVfbW9kdWxlcy9uYW5vaWQvbm9uLXNlY3VyZS9pbmRleC5janMiLCJ3ZWJwYWNrOi8vdG9kb2xpc3QvLi9ub2RlX21vZHVsZXMvcG9zdGNzcy9saWIvcG9zdGNzcy5tanMiLCJ3ZWJwYWNrOi8vdG9kb2xpc3Qvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vdG9kb2xpc3Qvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL3RvZG9saXN0L3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vdG9kb2xpc3Qvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly90b2RvbGlzdC8uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgeD1TdHJpbmc7XG52YXIgY3JlYXRlPWZ1bmN0aW9uKCkge3JldHVybiB7aXNDb2xvclN1cHBvcnRlZDpmYWxzZSxyZXNldDp4LGJvbGQ6eCxkaW06eCxpdGFsaWM6eCx1bmRlcmxpbmU6eCxpbnZlcnNlOngsaGlkZGVuOngsc3RyaWtldGhyb3VnaDp4LGJsYWNrOngscmVkOngsZ3JlZW46eCx5ZWxsb3c6eCxibHVlOngsbWFnZW50YTp4LGN5YW46eCx3aGl0ZTp4LGdyYXk6eCxiZ0JsYWNrOngsYmdSZWQ6eCxiZ0dyZWVuOngsYmdZZWxsb3c6eCxiZ0JsdWU6eCxiZ01hZ2VudGE6eCxiZ0N5YW46eCxiZ1doaXRlOnh9fTtcbm1vZHVsZS5leHBvcnRzPWNyZWF0ZSgpO1xubW9kdWxlLmV4cG9ydHMuY3JlYXRlQ29sb3JzID0gY3JlYXRlO1xuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBDb250YWluZXIgPSByZXF1aXJlKCcuL2NvbnRhaW5lcicpXG5cbmNsYXNzIEF0UnVsZSBleHRlbmRzIENvbnRhaW5lciB7XG4gIGNvbnN0cnVjdG9yKGRlZmF1bHRzKSB7XG4gICAgc3VwZXIoZGVmYXVsdHMpXG4gICAgdGhpcy50eXBlID0gJ2F0cnVsZSdcbiAgfVxuXG4gIGFwcGVuZCguLi5jaGlsZHJlbikge1xuICAgIGlmICghdGhpcy5wcm94eU9mLm5vZGVzKSB0aGlzLm5vZGVzID0gW11cbiAgICByZXR1cm4gc3VwZXIuYXBwZW5kKC4uLmNoaWxkcmVuKVxuICB9XG5cbiAgcHJlcGVuZCguLi5jaGlsZHJlbikge1xuICAgIGlmICghdGhpcy5wcm94eU9mLm5vZGVzKSB0aGlzLm5vZGVzID0gW11cbiAgICByZXR1cm4gc3VwZXIucHJlcGVuZCguLi5jaGlsZHJlbilcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEF0UnVsZVxuQXRSdWxlLmRlZmF1bHQgPSBBdFJ1bGVcblxuQ29udGFpbmVyLnJlZ2lzdGVyQXRSdWxlKEF0UnVsZSlcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgTm9kZSA9IHJlcXVpcmUoJy4vbm9kZScpXG5cbmNsYXNzIENvbW1lbnQgZXh0ZW5kcyBOb2RlIHtcbiAgY29uc3RydWN0b3IoZGVmYXVsdHMpIHtcbiAgICBzdXBlcihkZWZhdWx0cylcbiAgICB0aGlzLnR5cGUgPSAnY29tbWVudCdcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbW1lbnRcbkNvbW1lbnQuZGVmYXVsdCA9IENvbW1lbnRcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgeyBpc0NsZWFuLCBteSB9ID0gcmVxdWlyZSgnLi9zeW1ib2xzJylcbmxldCBEZWNsYXJhdGlvbiA9IHJlcXVpcmUoJy4vZGVjbGFyYXRpb24nKVxubGV0IENvbW1lbnQgPSByZXF1aXJlKCcuL2NvbW1lbnQnKVxubGV0IE5vZGUgPSByZXF1aXJlKCcuL25vZGUnKVxuXG5sZXQgcGFyc2UsIFJ1bGUsIEF0UnVsZVxuXG5mdW5jdGlvbiBjbGVhblNvdXJjZShub2Rlcykge1xuICByZXR1cm4gbm9kZXMubWFwKGkgPT4ge1xuICAgIGlmIChpLm5vZGVzKSBpLm5vZGVzID0gY2xlYW5Tb3VyY2UoaS5ub2RlcylcbiAgICBkZWxldGUgaS5zb3VyY2VcbiAgICByZXR1cm4gaVxuICB9KVxufVxuXG5mdW5jdGlvbiBtYXJrRGlydHlVcChub2RlKSB7XG4gIG5vZGVbaXNDbGVhbl0gPSBmYWxzZVxuICBpZiAobm9kZS5wcm94eU9mLm5vZGVzKSB7XG4gICAgZm9yIChsZXQgaSBvZiBub2RlLnByb3h5T2Yubm9kZXMpIHtcbiAgICAgIG1hcmtEaXJ0eVVwKGkpXG4gICAgfVxuICB9XG59XG5cbmNsYXNzIENvbnRhaW5lciBleHRlbmRzIE5vZGUge1xuICBwdXNoKGNoaWxkKSB7XG4gICAgY2hpbGQucGFyZW50ID0gdGhpc1xuICAgIHRoaXMucHJveHlPZi5ub2Rlcy5wdXNoKGNoaWxkKVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBlYWNoKGNhbGxiYWNrKSB7XG4gICAgaWYgKCF0aGlzLnByb3h5T2Yubm9kZXMpIHJldHVybiB1bmRlZmluZWRcbiAgICBsZXQgaXRlcmF0b3IgPSB0aGlzLmdldEl0ZXJhdG9yKClcblxuICAgIGxldCBpbmRleCwgcmVzdWx0XG4gICAgd2hpbGUgKHRoaXMuaW5kZXhlc1tpdGVyYXRvcl0gPCB0aGlzLnByb3h5T2Yubm9kZXMubGVuZ3RoKSB7XG4gICAgICBpbmRleCA9IHRoaXMuaW5kZXhlc1tpdGVyYXRvcl1cbiAgICAgIHJlc3VsdCA9IGNhbGxiYWNrKHRoaXMucHJveHlPZi5ub2Rlc1tpbmRleF0sIGluZGV4KVxuICAgICAgaWYgKHJlc3VsdCA9PT0gZmFsc2UpIGJyZWFrXG5cbiAgICAgIHRoaXMuaW5kZXhlc1tpdGVyYXRvcl0gKz0gMVxuICAgIH1cblxuICAgIGRlbGV0ZSB0aGlzLmluZGV4ZXNbaXRlcmF0b3JdXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgd2FsayhjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmVhY2goKGNoaWxkLCBpKSA9PiB7XG4gICAgICBsZXQgcmVzdWx0XG4gICAgICB0cnkge1xuICAgICAgICByZXN1bHQgPSBjYWxsYmFjayhjaGlsZCwgaSlcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhyb3cgY2hpbGQuYWRkVG9FcnJvcihlKVxuICAgICAgfVxuICAgICAgaWYgKHJlc3VsdCAhPT0gZmFsc2UgJiYgY2hpbGQud2Fsaykge1xuICAgICAgICByZXN1bHQgPSBjaGlsZC53YWxrKGNhbGxiYWNrKVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzdWx0XG4gICAgfSlcbiAgfVxuXG4gIHdhbGtEZWNscyhwcm9wLCBjYWxsYmFjaykge1xuICAgIGlmICghY2FsbGJhY2spIHtcbiAgICAgIGNhbGxiYWNrID0gcHJvcFxuICAgICAgcmV0dXJuIHRoaXMud2FsaygoY2hpbGQsIGkpID0+IHtcbiAgICAgICAgaWYgKGNoaWxkLnR5cGUgPT09ICdkZWNsJykge1xuICAgICAgICAgIHJldHVybiBjYWxsYmFjayhjaGlsZCwgaSlcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG4gICAgaWYgKHByb3AgaW5zdGFuY2VvZiBSZWdFeHApIHtcbiAgICAgIHJldHVybiB0aGlzLndhbGsoKGNoaWxkLCBpKSA9PiB7XG4gICAgICAgIGlmIChjaGlsZC50eXBlID09PSAnZGVjbCcgJiYgcHJvcC50ZXN0KGNoaWxkLnByb3ApKSB7XG4gICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGNoaWxkLCBpKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy53YWxrKChjaGlsZCwgaSkgPT4ge1xuICAgICAgaWYgKGNoaWxkLnR5cGUgPT09ICdkZWNsJyAmJiBjaGlsZC5wcm9wID09PSBwcm9wKSB7XG4gICAgICAgIHJldHVybiBjYWxsYmFjayhjaGlsZCwgaSlcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgd2Fsa1J1bGVzKHNlbGVjdG9yLCBjYWxsYmFjaykge1xuICAgIGlmICghY2FsbGJhY2spIHtcbiAgICAgIGNhbGxiYWNrID0gc2VsZWN0b3JcblxuICAgICAgcmV0dXJuIHRoaXMud2FsaygoY2hpbGQsIGkpID0+IHtcbiAgICAgICAgaWYgKGNoaWxkLnR5cGUgPT09ICdydWxlJykge1xuICAgICAgICAgIHJldHVybiBjYWxsYmFjayhjaGlsZCwgaSlcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG4gICAgaWYgKHNlbGVjdG9yIGluc3RhbmNlb2YgUmVnRXhwKSB7XG4gICAgICByZXR1cm4gdGhpcy53YWxrKChjaGlsZCwgaSkgPT4ge1xuICAgICAgICBpZiAoY2hpbGQudHlwZSA9PT0gJ3J1bGUnICYmIHNlbGVjdG9yLnRlc3QoY2hpbGQuc2VsZWN0b3IpKSB7XG4gICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGNoaWxkLCBpKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy53YWxrKChjaGlsZCwgaSkgPT4ge1xuICAgICAgaWYgKGNoaWxkLnR5cGUgPT09ICdydWxlJyAmJiBjaGlsZC5zZWxlY3RvciA9PT0gc2VsZWN0b3IpIHtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGNoaWxkLCBpKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICB3YWxrQXRSdWxlcyhuYW1lLCBjYWxsYmFjaykge1xuICAgIGlmICghY2FsbGJhY2spIHtcbiAgICAgIGNhbGxiYWNrID0gbmFtZVxuICAgICAgcmV0dXJuIHRoaXMud2FsaygoY2hpbGQsIGkpID0+IHtcbiAgICAgICAgaWYgKGNoaWxkLnR5cGUgPT09ICdhdHJ1bGUnKSB7XG4gICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGNoaWxkLCBpKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgICBpZiAobmFtZSBpbnN0YW5jZW9mIFJlZ0V4cCkge1xuICAgICAgcmV0dXJuIHRoaXMud2FsaygoY2hpbGQsIGkpID0+IHtcbiAgICAgICAgaWYgKGNoaWxkLnR5cGUgPT09ICdhdHJ1bGUnICYmIG5hbWUudGVzdChjaGlsZC5uYW1lKSkge1xuICAgICAgICAgIHJldHVybiBjYWxsYmFjayhjaGlsZCwgaSlcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMud2FsaygoY2hpbGQsIGkpID0+IHtcbiAgICAgIGlmIChjaGlsZC50eXBlID09PSAnYXRydWxlJyAmJiBjaGlsZC5uYW1lID09PSBuYW1lKSB7XG4gICAgICAgIHJldHVybiBjYWxsYmFjayhjaGlsZCwgaSlcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgd2Fsa0NvbW1lbnRzKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMud2FsaygoY2hpbGQsIGkpID0+IHtcbiAgICAgIGlmIChjaGlsZC50eXBlID09PSAnY29tbWVudCcpIHtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGNoaWxkLCBpKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBhcHBlbmQoLi4uY2hpbGRyZW4pIHtcbiAgICBmb3IgKGxldCBjaGlsZCBvZiBjaGlsZHJlbikge1xuICAgICAgbGV0IG5vZGVzID0gdGhpcy5ub3JtYWxpemUoY2hpbGQsIHRoaXMubGFzdClcbiAgICAgIGZvciAobGV0IG5vZGUgb2Ygbm9kZXMpIHRoaXMucHJveHlPZi5ub2Rlcy5wdXNoKG5vZGUpXG4gICAgfVxuXG4gICAgdGhpcy5tYXJrRGlydHkoKVxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHByZXBlbmQoLi4uY2hpbGRyZW4pIHtcbiAgICBjaGlsZHJlbiA9IGNoaWxkcmVuLnJldmVyc2UoKVxuICAgIGZvciAobGV0IGNoaWxkIG9mIGNoaWxkcmVuKSB7XG4gICAgICBsZXQgbm9kZXMgPSB0aGlzLm5vcm1hbGl6ZShjaGlsZCwgdGhpcy5maXJzdCwgJ3ByZXBlbmQnKS5yZXZlcnNlKClcbiAgICAgIGZvciAobGV0IG5vZGUgb2Ygbm9kZXMpIHRoaXMucHJveHlPZi5ub2Rlcy51bnNoaWZ0KG5vZGUpXG4gICAgICBmb3IgKGxldCBpZCBpbiB0aGlzLmluZGV4ZXMpIHtcbiAgICAgICAgdGhpcy5pbmRleGVzW2lkXSA9IHRoaXMuaW5kZXhlc1tpZF0gKyBub2Rlcy5sZW5ndGhcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLm1hcmtEaXJ0eSgpXG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgY2xlYW5SYXdzKGtlZXBCZXR3ZWVuKSB7XG4gICAgc3VwZXIuY2xlYW5SYXdzKGtlZXBCZXR3ZWVuKVxuICAgIGlmICh0aGlzLm5vZGVzKSB7XG4gICAgICBmb3IgKGxldCBub2RlIG9mIHRoaXMubm9kZXMpIG5vZGUuY2xlYW5SYXdzKGtlZXBCZXR3ZWVuKVxuICAgIH1cbiAgfVxuXG4gIGluc2VydEJlZm9yZShleGlzdCwgYWRkKSB7XG4gICAgZXhpc3QgPSB0aGlzLmluZGV4KGV4aXN0KVxuXG4gICAgbGV0IHR5cGUgPSBleGlzdCA9PT0gMCA/ICdwcmVwZW5kJyA6IGZhbHNlXG4gICAgbGV0IG5vZGVzID0gdGhpcy5ub3JtYWxpemUoYWRkLCB0aGlzLnByb3h5T2Yubm9kZXNbZXhpc3RdLCB0eXBlKS5yZXZlcnNlKClcbiAgICBmb3IgKGxldCBub2RlIG9mIG5vZGVzKSB0aGlzLnByb3h5T2Yubm9kZXMuc3BsaWNlKGV4aXN0LCAwLCBub2RlKVxuXG4gICAgbGV0IGluZGV4XG4gICAgZm9yIChsZXQgaWQgaW4gdGhpcy5pbmRleGVzKSB7XG4gICAgICBpbmRleCA9IHRoaXMuaW5kZXhlc1tpZF1cbiAgICAgIGlmIChleGlzdCA8PSBpbmRleCkge1xuICAgICAgICB0aGlzLmluZGV4ZXNbaWRdID0gaW5kZXggKyBub2Rlcy5sZW5ndGhcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLm1hcmtEaXJ0eSgpXG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgaW5zZXJ0QWZ0ZXIoZXhpc3QsIGFkZCkge1xuICAgIGV4aXN0ID0gdGhpcy5pbmRleChleGlzdClcblxuICAgIGxldCBub2RlcyA9IHRoaXMubm9ybWFsaXplKGFkZCwgdGhpcy5wcm94eU9mLm5vZGVzW2V4aXN0XSkucmV2ZXJzZSgpXG4gICAgZm9yIChsZXQgbm9kZSBvZiBub2RlcykgdGhpcy5wcm94eU9mLm5vZGVzLnNwbGljZShleGlzdCArIDEsIDAsIG5vZGUpXG5cbiAgICBsZXQgaW5kZXhcbiAgICBmb3IgKGxldCBpZCBpbiB0aGlzLmluZGV4ZXMpIHtcbiAgICAgIGluZGV4ID0gdGhpcy5pbmRleGVzW2lkXVxuICAgICAgaWYgKGV4aXN0IDwgaW5kZXgpIHtcbiAgICAgICAgdGhpcy5pbmRleGVzW2lkXSA9IGluZGV4ICsgbm9kZXMubGVuZ3RoXG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5tYXJrRGlydHkoKVxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHJlbW92ZUNoaWxkKGNoaWxkKSB7XG4gICAgY2hpbGQgPSB0aGlzLmluZGV4KGNoaWxkKVxuICAgIHRoaXMucHJveHlPZi5ub2Rlc1tjaGlsZF0ucGFyZW50ID0gdW5kZWZpbmVkXG4gICAgdGhpcy5wcm94eU9mLm5vZGVzLnNwbGljZShjaGlsZCwgMSlcblxuICAgIGxldCBpbmRleFxuICAgIGZvciAobGV0IGlkIGluIHRoaXMuaW5kZXhlcykge1xuICAgICAgaW5kZXggPSB0aGlzLmluZGV4ZXNbaWRdXG4gICAgICBpZiAoaW5kZXggPj0gY2hpbGQpIHtcbiAgICAgICAgdGhpcy5pbmRleGVzW2lkXSA9IGluZGV4IC0gMVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMubWFya0RpcnR5KClcblxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICByZW1vdmVBbGwoKSB7XG4gICAgZm9yIChsZXQgbm9kZSBvZiB0aGlzLnByb3h5T2Yubm9kZXMpIG5vZGUucGFyZW50ID0gdW5kZWZpbmVkXG4gICAgdGhpcy5wcm94eU9mLm5vZGVzID0gW11cblxuICAgIHRoaXMubWFya0RpcnR5KClcblxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICByZXBsYWNlVmFsdWVzKHBhdHRlcm4sIG9wdHMsIGNhbGxiYWNrKSB7XG4gICAgaWYgKCFjYWxsYmFjaykge1xuICAgICAgY2FsbGJhY2sgPSBvcHRzXG4gICAgICBvcHRzID0ge31cbiAgICB9XG5cbiAgICB0aGlzLndhbGtEZWNscyhkZWNsID0+IHtcbiAgICAgIGlmIChvcHRzLnByb3BzICYmICFvcHRzLnByb3BzLmluY2x1ZGVzKGRlY2wucHJvcCkpIHJldHVyblxuICAgICAgaWYgKG9wdHMuZmFzdCAmJiAhZGVjbC52YWx1ZS5pbmNsdWRlcyhvcHRzLmZhc3QpKSByZXR1cm5cblxuICAgICAgZGVjbC52YWx1ZSA9IGRlY2wudmFsdWUucmVwbGFjZShwYXR0ZXJuLCBjYWxsYmFjaylcbiAgICB9KVxuXG4gICAgdGhpcy5tYXJrRGlydHkoKVxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGV2ZXJ5KGNvbmRpdGlvbikge1xuICAgIHJldHVybiB0aGlzLm5vZGVzLmV2ZXJ5KGNvbmRpdGlvbilcbiAgfVxuXG4gIHNvbWUoY29uZGl0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMubm9kZXMuc29tZShjb25kaXRpb24pXG4gIH1cblxuICBpbmRleChjaGlsZCkge1xuICAgIGlmICh0eXBlb2YgY2hpbGQgPT09ICdudW1iZXInKSByZXR1cm4gY2hpbGRcbiAgICBpZiAoY2hpbGQucHJveHlPZikgY2hpbGQgPSBjaGlsZC5wcm94eU9mXG4gICAgcmV0dXJuIHRoaXMucHJveHlPZi5ub2Rlcy5pbmRleE9mKGNoaWxkKVxuICB9XG5cbiAgZ2V0IGZpcnN0KCkge1xuICAgIGlmICghdGhpcy5wcm94eU9mLm5vZGVzKSByZXR1cm4gdW5kZWZpbmVkXG4gICAgcmV0dXJuIHRoaXMucHJveHlPZi5ub2Rlc1swXVxuICB9XG5cbiAgZ2V0IGxhc3QoKSB7XG4gICAgaWYgKCF0aGlzLnByb3h5T2Yubm9kZXMpIHJldHVybiB1bmRlZmluZWRcbiAgICByZXR1cm4gdGhpcy5wcm94eU9mLm5vZGVzW3RoaXMucHJveHlPZi5ub2Rlcy5sZW5ndGggLSAxXVxuICB9XG5cbiAgbm9ybWFsaXplKG5vZGVzLCBzYW1wbGUpIHtcbiAgICBpZiAodHlwZW9mIG5vZGVzID09PSAnc3RyaW5nJykge1xuICAgICAgbm9kZXMgPSBjbGVhblNvdXJjZShwYXJzZShub2Rlcykubm9kZXMpXG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KG5vZGVzKSkge1xuICAgICAgbm9kZXMgPSBub2Rlcy5zbGljZSgwKVxuICAgICAgZm9yIChsZXQgaSBvZiBub2Rlcykge1xuICAgICAgICBpZiAoaS5wYXJlbnQpIGkucGFyZW50LnJlbW92ZUNoaWxkKGksICdpZ25vcmUnKVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAobm9kZXMudHlwZSA9PT0gJ3Jvb3QnICYmIHRoaXMudHlwZSAhPT0gJ2RvY3VtZW50Jykge1xuICAgICAgbm9kZXMgPSBub2Rlcy5ub2Rlcy5zbGljZSgwKVxuICAgICAgZm9yIChsZXQgaSBvZiBub2Rlcykge1xuICAgICAgICBpZiAoaS5wYXJlbnQpIGkucGFyZW50LnJlbW92ZUNoaWxkKGksICdpZ25vcmUnKVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAobm9kZXMudHlwZSkge1xuICAgICAgbm9kZXMgPSBbbm9kZXNdXG4gICAgfSBlbHNlIGlmIChub2Rlcy5wcm9wKSB7XG4gICAgICBpZiAodHlwZW9mIG5vZGVzLnZhbHVlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1ZhbHVlIGZpZWxkIGlzIG1pc3NlZCBpbiBub2RlIGNyZWF0aW9uJylcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG5vZGVzLnZhbHVlICE9PSAnc3RyaW5nJykge1xuICAgICAgICBub2Rlcy52YWx1ZSA9IFN0cmluZyhub2Rlcy52YWx1ZSlcbiAgICAgIH1cbiAgICAgIG5vZGVzID0gW25ldyBEZWNsYXJhdGlvbihub2RlcyldXG4gICAgfSBlbHNlIGlmIChub2Rlcy5zZWxlY3Rvcikge1xuICAgICAgbm9kZXMgPSBbbmV3IFJ1bGUobm9kZXMpXVxuICAgIH0gZWxzZSBpZiAobm9kZXMubmFtZSkge1xuICAgICAgbm9kZXMgPSBbbmV3IEF0UnVsZShub2RlcyldXG4gICAgfSBlbHNlIGlmIChub2Rlcy50ZXh0KSB7XG4gICAgICBub2RlcyA9IFtuZXcgQ29tbWVudChub2RlcyldXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBub2RlIHR5cGUgaW4gbm9kZSBjcmVhdGlvbicpXG4gICAgfVxuXG4gICAgbGV0IHByb2Nlc3NlZCA9IG5vZGVzLm1hcChpID0+IHtcbiAgICAgIC8qIGM4IGlnbm9yZSBuZXh0ICovXG4gICAgICBpZiAoIWlbbXldKSBDb250YWluZXIucmVidWlsZChpKVxuICAgICAgaSA9IGkucHJveHlPZlxuICAgICAgaWYgKGkucGFyZW50KSBpLnBhcmVudC5yZW1vdmVDaGlsZChpKVxuICAgICAgaWYgKGlbaXNDbGVhbl0pIG1hcmtEaXJ0eVVwKGkpXG4gICAgICBpZiAodHlwZW9mIGkucmF3cy5iZWZvcmUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGlmIChzYW1wbGUgJiYgdHlwZW9mIHNhbXBsZS5yYXdzLmJlZm9yZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBpLnJhd3MuYmVmb3JlID0gc2FtcGxlLnJhd3MuYmVmb3JlLnJlcGxhY2UoL1xcUy9nLCAnJylcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaS5wYXJlbnQgPSB0aGlzXG4gICAgICByZXR1cm4gaVxuICAgIH0pXG5cbiAgICByZXR1cm4gcHJvY2Vzc2VkXG4gIH1cblxuICBnZXRQcm94eVByb2Nlc3NvcigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgc2V0KG5vZGUsIHByb3AsIHZhbHVlKSB7XG4gICAgICAgIGlmIChub2RlW3Byb3BdID09PSB2YWx1ZSkgcmV0dXJuIHRydWVcbiAgICAgICAgbm9kZVtwcm9wXSA9IHZhbHVlXG4gICAgICAgIGlmIChwcm9wID09PSAnbmFtZScgfHwgcHJvcCA9PT0gJ3BhcmFtcycgfHwgcHJvcCA9PT0gJ3NlbGVjdG9yJykge1xuICAgICAgICAgIG5vZGUubWFya0RpcnR5KClcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfSxcblxuICAgICAgZ2V0KG5vZGUsIHByb3ApIHtcbiAgICAgICAgaWYgKHByb3AgPT09ICdwcm94eU9mJykge1xuICAgICAgICAgIHJldHVybiBub2RlXG4gICAgICAgIH0gZWxzZSBpZiAoIW5vZGVbcHJvcF0pIHtcbiAgICAgICAgICByZXR1cm4gbm9kZVtwcm9wXVxuICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgIHByb3AgPT09ICdlYWNoJyB8fFxuICAgICAgICAgICh0eXBlb2YgcHJvcCA9PT0gJ3N0cmluZycgJiYgcHJvcC5zdGFydHNXaXRoKCd3YWxrJykpXG4gICAgICAgICkge1xuICAgICAgICAgIHJldHVybiAoLi4uYXJncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG5vZGVbcHJvcF0oXG4gICAgICAgICAgICAgIC4uLmFyZ3MubWFwKGkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgaSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIChjaGlsZCwgaW5kZXgpID0+IGkoY2hpbGQudG9Qcm94eSgpLCBpbmRleClcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHByb3AgPT09ICdldmVyeScgfHwgcHJvcCA9PT0gJ3NvbWUnKSB7XG4gICAgICAgICAgcmV0dXJuIGNiID0+IHtcbiAgICAgICAgICAgIHJldHVybiBub2RlW3Byb3BdKChjaGlsZCwgLi4ub3RoZXIpID0+XG4gICAgICAgICAgICAgIGNiKGNoaWxkLnRvUHJveHkoKSwgLi4ub3RoZXIpXG4gICAgICAgICAgICApXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHByb3AgPT09ICdyb290Jykge1xuICAgICAgICAgIHJldHVybiAoKSA9PiBub2RlLnJvb3QoKS50b1Byb3h5KClcbiAgICAgICAgfSBlbHNlIGlmIChwcm9wID09PSAnbm9kZXMnKSB7XG4gICAgICAgICAgcmV0dXJuIG5vZGUubm9kZXMubWFwKGkgPT4gaS50b1Byb3h5KCkpXG4gICAgICAgIH0gZWxzZSBpZiAocHJvcCA9PT0gJ2ZpcnN0JyB8fCBwcm9wID09PSAnbGFzdCcpIHtcbiAgICAgICAgICByZXR1cm4gbm9kZVtwcm9wXS50b1Byb3h5KClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gbm9kZVtwcm9wXVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZ2V0SXRlcmF0b3IoKSB7XG4gICAgaWYgKCF0aGlzLmxhc3RFYWNoKSB0aGlzLmxhc3RFYWNoID0gMFxuICAgIGlmICghdGhpcy5pbmRleGVzKSB0aGlzLmluZGV4ZXMgPSB7fVxuXG4gICAgdGhpcy5sYXN0RWFjaCArPSAxXG4gICAgbGV0IGl0ZXJhdG9yID0gdGhpcy5sYXN0RWFjaFxuICAgIHRoaXMuaW5kZXhlc1tpdGVyYXRvcl0gPSAwXG5cbiAgICByZXR1cm4gaXRlcmF0b3JcbiAgfVxufVxuXG5Db250YWluZXIucmVnaXN0ZXJQYXJzZSA9IGRlcGVuZGFudCA9PiB7XG4gIHBhcnNlID0gZGVwZW5kYW50XG59XG5cbkNvbnRhaW5lci5yZWdpc3RlclJ1bGUgPSBkZXBlbmRhbnQgPT4ge1xuICBSdWxlID0gZGVwZW5kYW50XG59XG5cbkNvbnRhaW5lci5yZWdpc3RlckF0UnVsZSA9IGRlcGVuZGFudCA9PiB7XG4gIEF0UnVsZSA9IGRlcGVuZGFudFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbnRhaW5lclxuQ29udGFpbmVyLmRlZmF1bHQgPSBDb250YWluZXJcblxuLyogYzggaWdub3JlIHN0YXJ0ICovXG5Db250YWluZXIucmVidWlsZCA9IG5vZGUgPT4ge1xuICBpZiAobm9kZS50eXBlID09PSAnYXRydWxlJykge1xuICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZihub2RlLCBBdFJ1bGUucHJvdG90eXBlKVxuICB9IGVsc2UgaWYgKG5vZGUudHlwZSA9PT0gJ3J1bGUnKSB7XG4gICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKG5vZGUsIFJ1bGUucHJvdG90eXBlKVxuICB9IGVsc2UgaWYgKG5vZGUudHlwZSA9PT0gJ2RlY2wnKSB7XG4gICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKG5vZGUsIERlY2xhcmF0aW9uLnByb3RvdHlwZSlcbiAgfSBlbHNlIGlmIChub2RlLnR5cGUgPT09ICdjb21tZW50Jykge1xuICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZihub2RlLCBDb21tZW50LnByb3RvdHlwZSlcbiAgfVxuXG4gIG5vZGVbbXldID0gdHJ1ZVxuXG4gIGlmIChub2RlLm5vZGVzKSB7XG4gICAgbm9kZS5ub2Rlcy5mb3JFYWNoKGNoaWxkID0+IHtcbiAgICAgIENvbnRhaW5lci5yZWJ1aWxkKGNoaWxkKVxuICAgIH0pXG4gIH1cbn1cbi8qIGM4IGlnbm9yZSBzdG9wICovXG4iLCIndXNlIHN0cmljdCdcblxubGV0IHBpY28gPSByZXF1aXJlKCdwaWNvY29sb3JzJylcblxubGV0IHRlcm1pbmFsSGlnaGxpZ2h0ID0gcmVxdWlyZSgnLi90ZXJtaW5hbC1oaWdobGlnaHQnKVxuXG5jbGFzcyBDc3NTeW50YXhFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZSwgbGluZSwgY29sdW1uLCBzb3VyY2UsIGZpbGUsIHBsdWdpbikge1xuICAgIHN1cGVyKG1lc3NhZ2UpXG4gICAgdGhpcy5uYW1lID0gJ0Nzc1N5bnRheEVycm9yJ1xuICAgIHRoaXMucmVhc29uID0gbWVzc2FnZVxuXG4gICAgaWYgKGZpbGUpIHtcbiAgICAgIHRoaXMuZmlsZSA9IGZpbGVcbiAgICB9XG4gICAgaWYgKHNvdXJjZSkge1xuICAgICAgdGhpcy5zb3VyY2UgPSBzb3VyY2VcbiAgICB9XG4gICAgaWYgKHBsdWdpbikge1xuICAgICAgdGhpcy5wbHVnaW4gPSBwbHVnaW5cbiAgICB9XG4gICAgaWYgKHR5cGVvZiBsaW5lICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgY29sdW1uICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgaWYgKHR5cGVvZiBsaW5lID09PSAnbnVtYmVyJykge1xuICAgICAgICB0aGlzLmxpbmUgPSBsaW5lXG4gICAgICAgIHRoaXMuY29sdW1uID0gY29sdW1uXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmxpbmUgPSBsaW5lLmxpbmVcbiAgICAgICAgdGhpcy5jb2x1bW4gPSBsaW5lLmNvbHVtblxuICAgICAgICB0aGlzLmVuZExpbmUgPSBjb2x1bW4ubGluZVxuICAgICAgICB0aGlzLmVuZENvbHVtbiA9IGNvbHVtbi5jb2x1bW5cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnNldE1lc3NhZ2UoKVxuXG4gICAgaWYgKEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKSB7XG4gICAgICBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSh0aGlzLCBDc3NTeW50YXhFcnJvcilcbiAgICB9XG4gIH1cblxuICBzZXRNZXNzYWdlKCkge1xuICAgIHRoaXMubWVzc2FnZSA9IHRoaXMucGx1Z2luID8gdGhpcy5wbHVnaW4gKyAnOiAnIDogJydcbiAgICB0aGlzLm1lc3NhZ2UgKz0gdGhpcy5maWxlID8gdGhpcy5maWxlIDogJzxjc3MgaW5wdXQ+J1xuICAgIGlmICh0eXBlb2YgdGhpcy5saW5lICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhpcy5tZXNzYWdlICs9ICc6JyArIHRoaXMubGluZSArICc6JyArIHRoaXMuY29sdW1uXG4gICAgfVxuICAgIHRoaXMubWVzc2FnZSArPSAnOiAnICsgdGhpcy5yZWFzb25cbiAgfVxuXG4gIHNob3dTb3VyY2VDb2RlKGNvbG9yKSB7XG4gICAgaWYgKCF0aGlzLnNvdXJjZSkgcmV0dXJuICcnXG5cbiAgICBsZXQgY3NzID0gdGhpcy5zb3VyY2VcbiAgICBpZiAoY29sb3IgPT0gbnVsbCkgY29sb3IgPSBwaWNvLmlzQ29sb3JTdXBwb3J0ZWRcbiAgICBpZiAodGVybWluYWxIaWdobGlnaHQpIHtcbiAgICAgIGlmIChjb2xvcikgY3NzID0gdGVybWluYWxIaWdobGlnaHQoY3NzKVxuICAgIH1cblxuICAgIGxldCBsaW5lcyA9IGNzcy5zcGxpdCgvXFxyP1xcbi8pXG4gICAgbGV0IHN0YXJ0ID0gTWF0aC5tYXgodGhpcy5saW5lIC0gMywgMClcbiAgICBsZXQgZW5kID0gTWF0aC5taW4odGhpcy5saW5lICsgMiwgbGluZXMubGVuZ3RoKVxuXG4gICAgbGV0IG1heFdpZHRoID0gU3RyaW5nKGVuZCkubGVuZ3RoXG5cbiAgICBsZXQgbWFyaywgYXNpZGVcbiAgICBpZiAoY29sb3IpIHtcbiAgICAgIGxldCB7IGJvbGQsIHJlZCwgZ3JheSB9ID0gcGljby5jcmVhdGVDb2xvcnModHJ1ZSlcbiAgICAgIG1hcmsgPSB0ZXh0ID0+IGJvbGQocmVkKHRleHQpKVxuICAgICAgYXNpZGUgPSB0ZXh0ID0+IGdyYXkodGV4dClcbiAgICB9IGVsc2Uge1xuICAgICAgbWFyayA9IGFzaWRlID0gc3RyID0+IHN0clxuICAgIH1cblxuICAgIHJldHVybiBsaW5lc1xuICAgICAgLnNsaWNlKHN0YXJ0LCBlbmQpXG4gICAgICAubWFwKChsaW5lLCBpbmRleCkgPT4ge1xuICAgICAgICBsZXQgbnVtYmVyID0gc3RhcnQgKyAxICsgaW5kZXhcbiAgICAgICAgbGV0IGd1dHRlciA9ICcgJyArICgnICcgKyBudW1iZXIpLnNsaWNlKC1tYXhXaWR0aCkgKyAnIHwgJ1xuICAgICAgICBpZiAobnVtYmVyID09PSB0aGlzLmxpbmUpIHtcbiAgICAgICAgICBsZXQgc3BhY2luZyA9XG4gICAgICAgICAgICBhc2lkZShndXR0ZXIucmVwbGFjZSgvXFxkL2csICcgJykpICtcbiAgICAgICAgICAgIGxpbmUuc2xpY2UoMCwgdGhpcy5jb2x1bW4gLSAxKS5yZXBsYWNlKC9bXlxcdF0vZywgJyAnKVxuICAgICAgICAgIHJldHVybiBtYXJrKCc+JykgKyBhc2lkZShndXR0ZXIpICsgbGluZSArICdcXG4gJyArIHNwYWNpbmcgKyBtYXJrKCdeJylcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gJyAnICsgYXNpZGUoZ3V0dGVyKSArIGxpbmVcbiAgICAgIH0pXG4gICAgICAuam9pbignXFxuJylcbiAgfVxuXG4gIHRvU3RyaW5nKCkge1xuICAgIGxldCBjb2RlID0gdGhpcy5zaG93U291cmNlQ29kZSgpXG4gICAgaWYgKGNvZGUpIHtcbiAgICAgIGNvZGUgPSAnXFxuXFxuJyArIGNvZGUgKyAnXFxuJ1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5uYW1lICsgJzogJyArIHRoaXMubWVzc2FnZSArIGNvZGVcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENzc1N5bnRheEVycm9yXG5Dc3NTeW50YXhFcnJvci5kZWZhdWx0ID0gQ3NzU3ludGF4RXJyb3JcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgTm9kZSA9IHJlcXVpcmUoJy4vbm9kZScpXG5cbmNsYXNzIERlY2xhcmF0aW9uIGV4dGVuZHMgTm9kZSB7XG4gIGNvbnN0cnVjdG9yKGRlZmF1bHRzKSB7XG4gICAgaWYgKFxuICAgICAgZGVmYXVsdHMgJiZcbiAgICAgIHR5cGVvZiBkZWZhdWx0cy52YWx1ZSAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgIHR5cGVvZiBkZWZhdWx0cy52YWx1ZSAhPT0gJ3N0cmluZydcbiAgICApIHtcbiAgICAgIGRlZmF1bHRzID0geyAuLi5kZWZhdWx0cywgdmFsdWU6IFN0cmluZyhkZWZhdWx0cy52YWx1ZSkgfVxuICAgIH1cbiAgICBzdXBlcihkZWZhdWx0cylcbiAgICB0aGlzLnR5cGUgPSAnZGVjbCdcbiAgfVxuXG4gIGdldCB2YXJpYWJsZSgpIHtcbiAgICByZXR1cm4gdGhpcy5wcm9wLnN0YXJ0c1dpdGgoJy0tJykgfHwgdGhpcy5wcm9wWzBdID09PSAnJCdcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IERlY2xhcmF0aW9uXG5EZWNsYXJhdGlvbi5kZWZhdWx0ID0gRGVjbGFyYXRpb25cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgQ29udGFpbmVyID0gcmVxdWlyZSgnLi9jb250YWluZXInKVxuXG5sZXQgTGF6eVJlc3VsdCwgUHJvY2Vzc29yXG5cbmNsYXNzIERvY3VtZW50IGV4dGVuZHMgQ29udGFpbmVyIHtcbiAgY29uc3RydWN0b3IoZGVmYXVsdHMpIHtcbiAgICAvLyB0eXBlIG5lZWRzIHRvIGJlIHBhc3NlZCB0byBzdXBlciwgb3RoZXJ3aXNlIGNoaWxkIHJvb3RzIHdvbid0IGJlIG5vcm1hbGl6ZWQgY29ycmVjdGx5XG4gICAgc3VwZXIoeyB0eXBlOiAnZG9jdW1lbnQnLCAuLi5kZWZhdWx0cyB9KVxuXG4gICAgaWYgKCF0aGlzLm5vZGVzKSB7XG4gICAgICB0aGlzLm5vZGVzID0gW11cbiAgICB9XG4gIH1cblxuICB0b1Jlc3VsdChvcHRzID0ge30pIHtcbiAgICBsZXQgbGF6eSA9IG5ldyBMYXp5UmVzdWx0KG5ldyBQcm9jZXNzb3IoKSwgdGhpcywgb3B0cylcblxuICAgIHJldHVybiBsYXp5LnN0cmluZ2lmeSgpXG4gIH1cbn1cblxuRG9jdW1lbnQucmVnaXN0ZXJMYXp5UmVzdWx0ID0gZGVwZW5kYW50ID0+IHtcbiAgTGF6eVJlc3VsdCA9IGRlcGVuZGFudFxufVxuXG5Eb2N1bWVudC5yZWdpc3RlclByb2Nlc3NvciA9IGRlcGVuZGFudCA9PiB7XG4gIFByb2Nlc3NvciA9IGRlcGVuZGFudFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IERvY3VtZW50XG5Eb2N1bWVudC5kZWZhdWx0ID0gRG9jdW1lbnRcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgRGVjbGFyYXRpb24gPSByZXF1aXJlKCcuL2RlY2xhcmF0aW9uJylcbmxldCBQcmV2aW91c01hcCA9IHJlcXVpcmUoJy4vcHJldmlvdXMtbWFwJylcbmxldCBDb21tZW50ID0gcmVxdWlyZSgnLi9jb21tZW50JylcbmxldCBBdFJ1bGUgPSByZXF1aXJlKCcuL2F0LXJ1bGUnKVxubGV0IElucHV0ID0gcmVxdWlyZSgnLi9pbnB1dCcpXG5sZXQgUm9vdCA9IHJlcXVpcmUoJy4vcm9vdCcpXG5sZXQgUnVsZSA9IHJlcXVpcmUoJy4vcnVsZScpXG5cbmZ1bmN0aW9uIGZyb21KU09OKGpzb24sIGlucHV0cykge1xuICBpZiAoQXJyYXkuaXNBcnJheShqc29uKSkgcmV0dXJuIGpzb24ubWFwKG4gPT4gZnJvbUpTT04obikpXG5cbiAgbGV0IHsgaW5wdXRzOiBvd25JbnB1dHMsIC4uLmRlZmF1bHRzIH0gPSBqc29uXG4gIGlmIChvd25JbnB1dHMpIHtcbiAgICBpbnB1dHMgPSBbXVxuICAgIGZvciAobGV0IGlucHV0IG9mIG93bklucHV0cykge1xuICAgICAgbGV0IGlucHV0SHlkcmF0ZWQgPSB7IC4uLmlucHV0LCBfX3Byb3RvX186IElucHV0LnByb3RvdHlwZSB9XG4gICAgICBpZiAoaW5wdXRIeWRyYXRlZC5tYXApIHtcbiAgICAgICAgaW5wdXRIeWRyYXRlZC5tYXAgPSB7XG4gICAgICAgICAgLi4uaW5wdXRIeWRyYXRlZC5tYXAsXG4gICAgICAgICAgX19wcm90b19fOiBQcmV2aW91c01hcC5wcm90b3R5cGVcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaW5wdXRzLnB1c2goaW5wdXRIeWRyYXRlZClcbiAgICB9XG4gIH1cbiAgaWYgKGRlZmF1bHRzLm5vZGVzKSB7XG4gICAgZGVmYXVsdHMubm9kZXMgPSBqc29uLm5vZGVzLm1hcChuID0+IGZyb21KU09OKG4sIGlucHV0cykpXG4gIH1cbiAgaWYgKGRlZmF1bHRzLnNvdXJjZSkge1xuICAgIGxldCB7IGlucHV0SWQsIC4uLnNvdXJjZSB9ID0gZGVmYXVsdHMuc291cmNlXG4gICAgZGVmYXVsdHMuc291cmNlID0gc291cmNlXG4gICAgaWYgKGlucHV0SWQgIT0gbnVsbCkge1xuICAgICAgZGVmYXVsdHMuc291cmNlLmlucHV0ID0gaW5wdXRzW2lucHV0SWRdXG4gICAgfVxuICB9XG4gIGlmIChkZWZhdWx0cy50eXBlID09PSAncm9vdCcpIHtcbiAgICByZXR1cm4gbmV3IFJvb3QoZGVmYXVsdHMpXG4gIH0gZWxzZSBpZiAoZGVmYXVsdHMudHlwZSA9PT0gJ2RlY2wnKSB7XG4gICAgcmV0dXJuIG5ldyBEZWNsYXJhdGlvbihkZWZhdWx0cylcbiAgfSBlbHNlIGlmIChkZWZhdWx0cy50eXBlID09PSAncnVsZScpIHtcbiAgICByZXR1cm4gbmV3IFJ1bGUoZGVmYXVsdHMpXG4gIH0gZWxzZSBpZiAoZGVmYXVsdHMudHlwZSA9PT0gJ2NvbW1lbnQnKSB7XG4gICAgcmV0dXJuIG5ldyBDb21tZW50KGRlZmF1bHRzKVxuICB9IGVsc2UgaWYgKGRlZmF1bHRzLnR5cGUgPT09ICdhdHJ1bGUnKSB7XG4gICAgcmV0dXJuIG5ldyBBdFJ1bGUoZGVmYXVsdHMpXG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIG5vZGUgdHlwZTogJyArIGpzb24udHlwZSlcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZyb21KU09OXG5mcm9tSlNPTi5kZWZhdWx0ID0gZnJvbUpTT05cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgeyBTb3VyY2VNYXBDb25zdW1lciwgU291cmNlTWFwR2VuZXJhdG9yIH0gPSByZXF1aXJlKCdzb3VyY2UtbWFwLWpzJylcbmxldCB7IGZpbGVVUkxUb1BhdGgsIHBhdGhUb0ZpbGVVUkwgfSA9IHJlcXVpcmUoJ3VybCcpXG5sZXQgeyByZXNvbHZlLCBpc0Fic29sdXRlIH0gPSByZXF1aXJlKCdwYXRoJylcbmxldCB7IG5hbm9pZCB9ID0gcmVxdWlyZSgnbmFub2lkL25vbi1zZWN1cmUnKVxuXG5sZXQgdGVybWluYWxIaWdobGlnaHQgPSByZXF1aXJlKCcuL3Rlcm1pbmFsLWhpZ2hsaWdodCcpXG5sZXQgQ3NzU3ludGF4RXJyb3IgPSByZXF1aXJlKCcuL2Nzcy1zeW50YXgtZXJyb3InKVxubGV0IFByZXZpb3VzTWFwID0gcmVxdWlyZSgnLi9wcmV2aW91cy1tYXAnKVxuXG5sZXQgZnJvbU9mZnNldENhY2hlID0gU3ltYm9sKCdmcm9tT2Zmc2V0Q2FjaGUnKVxuXG5sZXQgc291cmNlTWFwQXZhaWxhYmxlID0gQm9vbGVhbihTb3VyY2VNYXBDb25zdW1lciAmJiBTb3VyY2VNYXBHZW5lcmF0b3IpXG5sZXQgcGF0aEF2YWlsYWJsZSA9IEJvb2xlYW4ocmVzb2x2ZSAmJiBpc0Fic29sdXRlKVxuXG5jbGFzcyBJbnB1dCB7XG4gIGNvbnN0cnVjdG9yKGNzcywgb3B0cyA9IHt9KSB7XG4gICAgaWYgKFxuICAgICAgY3NzID09PSBudWxsIHx8XG4gICAgICB0eXBlb2YgY3NzID09PSAndW5kZWZpbmVkJyB8fFxuICAgICAgKHR5cGVvZiBjc3MgPT09ICdvYmplY3QnICYmICFjc3MudG9TdHJpbmcpXG4gICAgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFBvc3RDU1MgcmVjZWl2ZWQgJHtjc3N9IGluc3RlYWQgb2YgQ1NTIHN0cmluZ2ApXG4gICAgfVxuXG4gICAgdGhpcy5jc3MgPSBjc3MudG9TdHJpbmcoKVxuXG4gICAgaWYgKHRoaXMuY3NzWzBdID09PSAnXFx1RkVGRicgfHwgdGhpcy5jc3NbMF0gPT09ICdcXHVGRkZFJykge1xuICAgICAgdGhpcy5oYXNCT00gPSB0cnVlXG4gICAgICB0aGlzLmNzcyA9IHRoaXMuY3NzLnNsaWNlKDEpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuaGFzQk9NID0gZmFsc2VcbiAgICB9XG5cbiAgICBpZiAob3B0cy5mcm9tKSB7XG4gICAgICBpZiAoXG4gICAgICAgICFwYXRoQXZhaWxhYmxlIHx8XG4gICAgICAgIC9eXFx3KzpcXC9cXC8vLnRlc3Qob3B0cy5mcm9tKSB8fFxuICAgICAgICBpc0Fic29sdXRlKG9wdHMuZnJvbSlcbiAgICAgICkge1xuICAgICAgICB0aGlzLmZpbGUgPSBvcHRzLmZyb21cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZmlsZSA9IHJlc29sdmUob3B0cy5mcm9tKVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwYXRoQXZhaWxhYmxlICYmIHNvdXJjZU1hcEF2YWlsYWJsZSkge1xuICAgICAgbGV0IG1hcCA9IG5ldyBQcmV2aW91c01hcCh0aGlzLmNzcywgb3B0cylcbiAgICAgIGlmIChtYXAudGV4dCkge1xuICAgICAgICB0aGlzLm1hcCA9IG1hcFxuICAgICAgICBsZXQgZmlsZSA9IG1hcC5jb25zdW1lcigpLmZpbGVcbiAgICAgICAgaWYgKCF0aGlzLmZpbGUgJiYgZmlsZSkgdGhpcy5maWxlID0gdGhpcy5tYXBSZXNvbHZlKGZpbGUpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLmZpbGUpIHtcbiAgICAgIHRoaXMuaWQgPSAnPGlucHV0IGNzcyAnICsgbmFub2lkKDYpICsgJz4nXG4gICAgfVxuICAgIGlmICh0aGlzLm1hcCkgdGhpcy5tYXAuZmlsZSA9IHRoaXMuZnJvbVxuICB9XG5cbiAgZnJvbU9mZnNldChvZmZzZXQpIHtcbiAgICBsZXQgbGFzdExpbmUsIGxpbmVUb0luZGV4XG4gICAgaWYgKCF0aGlzW2Zyb21PZmZzZXRDYWNoZV0pIHtcbiAgICAgIGxldCBsaW5lcyA9IHRoaXMuY3NzLnNwbGl0KCdcXG4nKVxuICAgICAgbGluZVRvSW5kZXggPSBuZXcgQXJyYXkobGluZXMubGVuZ3RoKVxuICAgICAgbGV0IHByZXZJbmRleCA9IDBcblxuICAgICAgZm9yIChsZXQgaSA9IDAsIGwgPSBsaW5lcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgbGluZVRvSW5kZXhbaV0gPSBwcmV2SW5kZXhcbiAgICAgICAgcHJldkluZGV4ICs9IGxpbmVzW2ldLmxlbmd0aCArIDFcbiAgICAgIH1cblxuICAgICAgdGhpc1tmcm9tT2Zmc2V0Q2FjaGVdID0gbGluZVRvSW5kZXhcbiAgICB9IGVsc2Uge1xuICAgICAgbGluZVRvSW5kZXggPSB0aGlzW2Zyb21PZmZzZXRDYWNoZV1cbiAgICB9XG4gICAgbGFzdExpbmUgPSBsaW5lVG9JbmRleFtsaW5lVG9JbmRleC5sZW5ndGggLSAxXVxuXG4gICAgbGV0IG1pbiA9IDBcbiAgICBpZiAob2Zmc2V0ID49IGxhc3RMaW5lKSB7XG4gICAgICBtaW4gPSBsaW5lVG9JbmRleC5sZW5ndGggLSAxXG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBtYXggPSBsaW5lVG9JbmRleC5sZW5ndGggLSAyXG4gICAgICBsZXQgbWlkXG4gICAgICB3aGlsZSAobWluIDwgbWF4KSB7XG4gICAgICAgIG1pZCA9IG1pbiArICgobWF4IC0gbWluKSA+PiAxKVxuICAgICAgICBpZiAob2Zmc2V0IDwgbGluZVRvSW5kZXhbbWlkXSkge1xuICAgICAgICAgIG1heCA9IG1pZCAtIDFcbiAgICAgICAgfSBlbHNlIGlmIChvZmZzZXQgPj0gbGluZVRvSW5kZXhbbWlkICsgMV0pIHtcbiAgICAgICAgICBtaW4gPSBtaWQgKyAxXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbWluID0gbWlkXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgbGluZTogbWluICsgMSxcbiAgICAgIGNvbDogb2Zmc2V0IC0gbGluZVRvSW5kZXhbbWluXSArIDFcbiAgICB9XG4gIH1cblxuICBlcnJvcihtZXNzYWdlLCBsaW5lLCBjb2x1bW4sIG9wdHMgPSB7fSkge1xuICAgIGxldCByZXN1bHQsIGVuZExpbmUsIGVuZENvbHVtblxuXG4gICAgaWYgKGxpbmUgJiYgdHlwZW9mIGxpbmUgPT09ICdvYmplY3QnKSB7XG4gICAgICBsZXQgc3RhcnQgPSBsaW5lXG4gICAgICBsZXQgZW5kID0gY29sdW1uXG4gICAgICBpZiAodHlwZW9mIGxpbmUub2Zmc2V0ID09PSAnbnVtYmVyJykge1xuICAgICAgICBsZXQgcG9zID0gdGhpcy5mcm9tT2Zmc2V0KHN0YXJ0Lm9mZnNldClcbiAgICAgICAgbGluZSA9IHBvcy5saW5lXG4gICAgICAgIGNvbHVtbiA9IHBvcy5jb2xcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxpbmUgPSBzdGFydC5saW5lXG4gICAgICAgIGNvbHVtbiA9IHN0YXJ0LmNvbHVtblxuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBlbmQub2Zmc2V0ID09PSAnbnVtYmVyJykge1xuICAgICAgICBsZXQgcG9zID0gdGhpcy5mcm9tT2Zmc2V0KGVuZC5vZmZzZXQpXG4gICAgICAgIGVuZExpbmUgPSBwb3MubGluZVxuICAgICAgICBlbmRDb2x1bW4gPSBwb3MuY29sXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbmRMaW5lID0gZW5kLmxpbmVcbiAgICAgICAgZW5kQ29sdW1uID0gZW5kLmNvbHVtblxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoIWNvbHVtbikge1xuICAgICAgbGV0IHBvcyA9IHRoaXMuZnJvbU9mZnNldChsaW5lKVxuICAgICAgbGluZSA9IHBvcy5saW5lXG4gICAgICBjb2x1bW4gPSBwb3MuY29sXG4gICAgfVxuXG4gICAgbGV0IG9yaWdpbiA9IHRoaXMub3JpZ2luKGxpbmUsIGNvbHVtbiwgZW5kTGluZSwgZW5kQ29sdW1uKVxuICAgIGlmIChvcmlnaW4pIHtcbiAgICAgIHJlc3VsdCA9IG5ldyBDc3NTeW50YXhFcnJvcihcbiAgICAgICAgbWVzc2FnZSxcbiAgICAgICAgb3JpZ2luLmVuZExpbmUgPT09IHVuZGVmaW5lZFxuICAgICAgICAgID8gb3JpZ2luLmxpbmVcbiAgICAgICAgICA6IHsgbGluZTogb3JpZ2luLmxpbmUsIGNvbHVtbjogb3JpZ2luLmNvbHVtbiB9LFxuICAgICAgICBvcmlnaW4uZW5kTGluZSA9PT0gdW5kZWZpbmVkXG4gICAgICAgICAgPyBvcmlnaW4uY29sdW1uXG4gICAgICAgICAgOiB7IGxpbmU6IG9yaWdpbi5lbmRMaW5lLCBjb2x1bW46IG9yaWdpbi5lbmRDb2x1bW4gfSxcbiAgICAgICAgb3JpZ2luLnNvdXJjZSxcbiAgICAgICAgb3JpZ2luLmZpbGUsXG4gICAgICAgIG9wdHMucGx1Z2luXG4gICAgICApXG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdCA9IG5ldyBDc3NTeW50YXhFcnJvcihcbiAgICAgICAgbWVzc2FnZSxcbiAgICAgICAgZW5kTGluZSA9PT0gdW5kZWZpbmVkID8gbGluZSA6IHsgbGluZSwgY29sdW1uIH0sXG4gICAgICAgIGVuZExpbmUgPT09IHVuZGVmaW5lZCA/IGNvbHVtbiA6IHsgbGluZTogZW5kTGluZSwgY29sdW1uOiBlbmRDb2x1bW4gfSxcbiAgICAgICAgdGhpcy5jc3MsXG4gICAgICAgIHRoaXMuZmlsZSxcbiAgICAgICAgb3B0cy5wbHVnaW5cbiAgICAgIClcbiAgICB9XG5cbiAgICByZXN1bHQuaW5wdXQgPSB7IGxpbmUsIGNvbHVtbiwgZW5kTGluZSwgZW5kQ29sdW1uLCBzb3VyY2U6IHRoaXMuY3NzIH1cbiAgICBpZiAodGhpcy5maWxlKSB7XG4gICAgICBpZiAocGF0aFRvRmlsZVVSTCkge1xuICAgICAgICByZXN1bHQuaW5wdXQudXJsID0gcGF0aFRvRmlsZVVSTCh0aGlzLmZpbGUpLnRvU3RyaW5nKClcbiAgICAgIH1cbiAgICAgIHJlc3VsdC5pbnB1dC5maWxlID0gdGhpcy5maWxlXG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgb3JpZ2luKGxpbmUsIGNvbHVtbiwgZW5kTGluZSwgZW5kQ29sdW1uKSB7XG4gICAgaWYgKCF0aGlzLm1hcCkgcmV0dXJuIGZhbHNlXG4gICAgbGV0IGNvbnN1bWVyID0gdGhpcy5tYXAuY29uc3VtZXIoKVxuXG4gICAgbGV0IGZyb20gPSBjb25zdW1lci5vcmlnaW5hbFBvc2l0aW9uRm9yKHsgbGluZSwgY29sdW1uIH0pXG4gICAgaWYgKCFmcm9tLnNvdXJjZSkgcmV0dXJuIGZhbHNlXG5cbiAgICBsZXQgdG9cbiAgICBpZiAodHlwZW9mIGVuZExpbmUgPT09ICdudW1iZXInKSB7XG4gICAgICB0byA9IGNvbnN1bWVyLm9yaWdpbmFsUG9zaXRpb25Gb3IoeyBsaW5lOiBlbmRMaW5lLCBjb2x1bW46IGVuZENvbHVtbiB9KVxuICAgIH1cblxuICAgIGxldCBmcm9tVXJsXG5cbiAgICBpZiAoaXNBYnNvbHV0ZShmcm9tLnNvdXJjZSkpIHtcbiAgICAgIGZyb21VcmwgPSBwYXRoVG9GaWxlVVJMKGZyb20uc291cmNlKVxuICAgIH0gZWxzZSB7XG4gICAgICBmcm9tVXJsID0gbmV3IFVSTChcbiAgICAgICAgZnJvbS5zb3VyY2UsXG4gICAgICAgIHRoaXMubWFwLmNvbnN1bWVyKCkuc291cmNlUm9vdCB8fCBwYXRoVG9GaWxlVVJMKHRoaXMubWFwLm1hcEZpbGUpXG4gICAgICApXG4gICAgfVxuXG4gICAgbGV0IHJlc3VsdCA9IHtcbiAgICAgIHVybDogZnJvbVVybC50b1N0cmluZygpLFxuICAgICAgbGluZTogZnJvbS5saW5lLFxuICAgICAgY29sdW1uOiBmcm9tLmNvbHVtbixcbiAgICAgIGVuZExpbmU6IHRvICYmIHRvLmxpbmUsXG4gICAgICBlbmRDb2x1bW46IHRvICYmIHRvLmNvbHVtblxuICAgIH1cblxuICAgIGlmIChmcm9tVXJsLnByb3RvY29sID09PSAnZmlsZTonKSB7XG4gICAgICBpZiAoZmlsZVVSTFRvUGF0aCkge1xuICAgICAgICByZXN1bHQuZmlsZSA9IGZpbGVVUkxUb1BhdGgoZnJvbVVybClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8qIGM4IGlnbm9yZSBuZXh0IDIgKi9cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBmaWxlOiBwcm90b2NvbCBpcyBub3QgYXZhaWxhYmxlIGluIHRoaXMgUG9zdENTUyBidWlsZGApXG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IHNvdXJjZSA9IGNvbnN1bWVyLnNvdXJjZUNvbnRlbnRGb3IoZnJvbS5zb3VyY2UpXG4gICAgaWYgKHNvdXJjZSkgcmVzdWx0LnNvdXJjZSA9IHNvdXJjZVxuXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgbWFwUmVzb2x2ZShmaWxlKSB7XG4gICAgaWYgKC9eXFx3KzpcXC9cXC8vLnRlc3QoZmlsZSkpIHtcbiAgICAgIHJldHVybiBmaWxlXG4gICAgfVxuICAgIHJldHVybiByZXNvbHZlKHRoaXMubWFwLmNvbnN1bWVyKCkuc291cmNlUm9vdCB8fCB0aGlzLm1hcC5yb290IHx8ICcuJywgZmlsZSlcbiAgfVxuXG4gIGdldCBmcm9tKCkge1xuICAgIHJldHVybiB0aGlzLmZpbGUgfHwgdGhpcy5pZFxuICB9XG5cbiAgdG9KU09OKCkge1xuICAgIGxldCBqc29uID0ge31cbiAgICBmb3IgKGxldCBuYW1lIG9mIFsnaGFzQk9NJywgJ2NzcycsICdmaWxlJywgJ2lkJ10pIHtcbiAgICAgIGlmICh0aGlzW25hbWVdICE9IG51bGwpIHtcbiAgICAgICAganNvbltuYW1lXSA9IHRoaXNbbmFtZV1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRoaXMubWFwKSB7XG4gICAgICBqc29uLm1hcCA9IHsgLi4udGhpcy5tYXAgfVxuICAgICAgaWYgKGpzb24ubWFwLmNvbnN1bWVyQ2FjaGUpIHtcbiAgICAgICAganNvbi5tYXAuY29uc3VtZXJDYWNoZSA9IHVuZGVmaW5lZFxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4ganNvblxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gSW5wdXRcbklucHV0LmRlZmF1bHQgPSBJbnB1dFxuXG5pZiAodGVybWluYWxIaWdobGlnaHQgJiYgdGVybWluYWxIaWdobGlnaHQucmVnaXN0ZXJJbnB1dCkge1xuICB0ZXJtaW5hbEhpZ2hsaWdodC5yZWdpc3RlcklucHV0KElucHV0KVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCB7IGlzQ2xlYW4sIG15IH0gPSByZXF1aXJlKCcuL3N5bWJvbHMnKVxubGV0IE1hcEdlbmVyYXRvciA9IHJlcXVpcmUoJy4vbWFwLWdlbmVyYXRvcicpXG5sZXQgc3RyaW5naWZ5ID0gcmVxdWlyZSgnLi9zdHJpbmdpZnknKVxubGV0IENvbnRhaW5lciA9IHJlcXVpcmUoJy4vY29udGFpbmVyJylcbmxldCBEb2N1bWVudCA9IHJlcXVpcmUoJy4vZG9jdW1lbnQnKVxubGV0IHdhcm5PbmNlID0gcmVxdWlyZSgnLi93YXJuLW9uY2UnKVxubGV0IFJlc3VsdCA9IHJlcXVpcmUoJy4vcmVzdWx0JylcbmxldCBwYXJzZSA9IHJlcXVpcmUoJy4vcGFyc2UnKVxubGV0IFJvb3QgPSByZXF1aXJlKCcuL3Jvb3QnKVxuXG5jb25zdCBUWVBFX1RPX0NMQVNTX05BTUUgPSB7XG4gIGRvY3VtZW50OiAnRG9jdW1lbnQnLFxuICByb290OiAnUm9vdCcsXG4gIGF0cnVsZTogJ0F0UnVsZScsXG4gIHJ1bGU6ICdSdWxlJyxcbiAgZGVjbDogJ0RlY2xhcmF0aW9uJyxcbiAgY29tbWVudDogJ0NvbW1lbnQnXG59XG5cbmNvbnN0IFBMVUdJTl9QUk9QUyA9IHtcbiAgcG9zdGNzc1BsdWdpbjogdHJ1ZSxcbiAgcHJlcGFyZTogdHJ1ZSxcbiAgT25jZTogdHJ1ZSxcbiAgRG9jdW1lbnQ6IHRydWUsXG4gIFJvb3Q6IHRydWUsXG4gIERlY2xhcmF0aW9uOiB0cnVlLFxuICBSdWxlOiB0cnVlLFxuICBBdFJ1bGU6IHRydWUsXG4gIENvbW1lbnQ6IHRydWUsXG4gIERlY2xhcmF0aW9uRXhpdDogdHJ1ZSxcbiAgUnVsZUV4aXQ6IHRydWUsXG4gIEF0UnVsZUV4aXQ6IHRydWUsXG4gIENvbW1lbnRFeGl0OiB0cnVlLFxuICBSb290RXhpdDogdHJ1ZSxcbiAgRG9jdW1lbnRFeGl0OiB0cnVlLFxuICBPbmNlRXhpdDogdHJ1ZVxufVxuXG5jb25zdCBOT1RfVklTSVRPUlMgPSB7XG4gIHBvc3Rjc3NQbHVnaW46IHRydWUsXG4gIHByZXBhcmU6IHRydWUsXG4gIE9uY2U6IHRydWVcbn1cblxuY29uc3QgQ0hJTERSRU4gPSAwXG5cbmZ1bmN0aW9uIGlzUHJvbWlzZShvYmopIHtcbiAgcmV0dXJuIHR5cGVvZiBvYmogPT09ICdvYmplY3QnICYmIHR5cGVvZiBvYmoudGhlbiA9PT0gJ2Z1bmN0aW9uJ1xufVxuXG5mdW5jdGlvbiBnZXRFdmVudHMobm9kZSkge1xuICBsZXQga2V5ID0gZmFsc2VcbiAgbGV0IHR5cGUgPSBUWVBFX1RPX0NMQVNTX05BTUVbbm9kZS50eXBlXVxuICBpZiAobm9kZS50eXBlID09PSAnZGVjbCcpIHtcbiAgICBrZXkgPSBub2RlLnByb3AudG9Mb3dlckNhc2UoKVxuICB9IGVsc2UgaWYgKG5vZGUudHlwZSA9PT0gJ2F0cnVsZScpIHtcbiAgICBrZXkgPSBub2RlLm5hbWUudG9Mb3dlckNhc2UoKVxuICB9XG5cbiAgaWYgKGtleSAmJiBub2RlLmFwcGVuZCkge1xuICAgIHJldHVybiBbXG4gICAgICB0eXBlLFxuICAgICAgdHlwZSArICctJyArIGtleSxcbiAgICAgIENISUxEUkVOLFxuICAgICAgdHlwZSArICdFeGl0JyxcbiAgICAgIHR5cGUgKyAnRXhpdC0nICsga2V5XG4gICAgXVxuICB9IGVsc2UgaWYgKGtleSkge1xuICAgIHJldHVybiBbdHlwZSwgdHlwZSArICctJyArIGtleSwgdHlwZSArICdFeGl0JywgdHlwZSArICdFeGl0LScgKyBrZXldXG4gIH0gZWxzZSBpZiAobm9kZS5hcHBlbmQpIHtcbiAgICByZXR1cm4gW3R5cGUsIENISUxEUkVOLCB0eXBlICsgJ0V4aXQnXVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBbdHlwZSwgdHlwZSArICdFeGl0J11cbiAgfVxufVxuXG5mdW5jdGlvbiB0b1N0YWNrKG5vZGUpIHtcbiAgbGV0IGV2ZW50c1xuICBpZiAobm9kZS50eXBlID09PSAnZG9jdW1lbnQnKSB7XG4gICAgZXZlbnRzID0gWydEb2N1bWVudCcsIENISUxEUkVOLCAnRG9jdW1lbnRFeGl0J11cbiAgfSBlbHNlIGlmIChub2RlLnR5cGUgPT09ICdyb290Jykge1xuICAgIGV2ZW50cyA9IFsnUm9vdCcsIENISUxEUkVOLCAnUm9vdEV4aXQnXVxuICB9IGVsc2Uge1xuICAgIGV2ZW50cyA9IGdldEV2ZW50cyhub2RlKVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBub2RlLFxuICAgIGV2ZW50cyxcbiAgICBldmVudEluZGV4OiAwLFxuICAgIHZpc2l0b3JzOiBbXSxcbiAgICB2aXNpdG9ySW5kZXg6IDAsXG4gICAgaXRlcmF0b3I6IDBcbiAgfVxufVxuXG5mdW5jdGlvbiBjbGVhbk1hcmtzKG5vZGUpIHtcbiAgbm9kZVtpc0NsZWFuXSA9IGZhbHNlXG4gIGlmIChub2RlLm5vZGVzKSBub2RlLm5vZGVzLmZvckVhY2goaSA9PiBjbGVhbk1hcmtzKGkpKVxuICByZXR1cm4gbm9kZVxufVxuXG5sZXQgcG9zdGNzcyA9IHt9XG5cbmNsYXNzIExhenlSZXN1bHQge1xuICBjb25zdHJ1Y3Rvcihwcm9jZXNzb3IsIGNzcywgb3B0cykge1xuICAgIHRoaXMuc3RyaW5naWZpZWQgPSBmYWxzZVxuICAgIHRoaXMucHJvY2Vzc2VkID0gZmFsc2VcblxuICAgIGxldCByb290XG4gICAgaWYgKFxuICAgICAgdHlwZW9mIGNzcyA9PT0gJ29iamVjdCcgJiZcbiAgICAgIGNzcyAhPT0gbnVsbCAmJlxuICAgICAgKGNzcy50eXBlID09PSAncm9vdCcgfHwgY3NzLnR5cGUgPT09ICdkb2N1bWVudCcpXG4gICAgKSB7XG4gICAgICByb290ID0gY2xlYW5NYXJrcyhjc3MpXG4gICAgfSBlbHNlIGlmIChjc3MgaW5zdGFuY2VvZiBMYXp5UmVzdWx0IHx8IGNzcyBpbnN0YW5jZW9mIFJlc3VsdCkge1xuICAgICAgcm9vdCA9IGNsZWFuTWFya3MoY3NzLnJvb3QpXG4gICAgICBpZiAoY3NzLm1hcCkge1xuICAgICAgICBpZiAodHlwZW9mIG9wdHMubWFwID09PSAndW5kZWZpbmVkJykgb3B0cy5tYXAgPSB7fVxuICAgICAgICBpZiAoIW9wdHMubWFwLmlubGluZSkgb3B0cy5tYXAuaW5saW5lID0gZmFsc2VcbiAgICAgICAgb3B0cy5tYXAucHJldiA9IGNzcy5tYXBcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHBhcnNlciA9IHBhcnNlXG4gICAgICBpZiAob3B0cy5zeW50YXgpIHBhcnNlciA9IG9wdHMuc3ludGF4LnBhcnNlXG4gICAgICBpZiAob3B0cy5wYXJzZXIpIHBhcnNlciA9IG9wdHMucGFyc2VyXG4gICAgICBpZiAocGFyc2VyLnBhcnNlKSBwYXJzZXIgPSBwYXJzZXIucGFyc2VcblxuICAgICAgdHJ5IHtcbiAgICAgICAgcm9vdCA9IHBhcnNlcihjc3MsIG9wdHMpXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICB0aGlzLnByb2Nlc3NlZCA9IHRydWVcbiAgICAgICAgdGhpcy5lcnJvciA9IGVycm9yXG4gICAgICB9XG5cbiAgICAgIGlmIChyb290ICYmICFyb290W215XSkge1xuICAgICAgICAvKiBjOCBpZ25vcmUgbmV4dCAyICovXG4gICAgICAgIENvbnRhaW5lci5yZWJ1aWxkKHJvb3QpXG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5yZXN1bHQgPSBuZXcgUmVzdWx0KHByb2Nlc3Nvciwgcm9vdCwgb3B0cylcbiAgICB0aGlzLmhlbHBlcnMgPSB7IC4uLnBvc3Rjc3MsIHJlc3VsdDogdGhpcy5yZXN1bHQsIHBvc3Rjc3MgfVxuICAgIHRoaXMucGx1Z2lucyA9IHRoaXMucHJvY2Vzc29yLnBsdWdpbnMubWFwKHBsdWdpbiA9PiB7XG4gICAgICBpZiAodHlwZW9mIHBsdWdpbiA9PT0gJ29iamVjdCcgJiYgcGx1Z2luLnByZXBhcmUpIHtcbiAgICAgICAgcmV0dXJuIHsgLi4ucGx1Z2luLCAuLi5wbHVnaW4ucHJlcGFyZSh0aGlzLnJlc3VsdCkgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHBsdWdpblxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBnZXQgW1N5bWJvbC50b1N0cmluZ1RhZ10oKSB7XG4gICAgcmV0dXJuICdMYXp5UmVzdWx0J1xuICB9XG5cbiAgZ2V0IHByb2Nlc3NvcigpIHtcbiAgICByZXR1cm4gdGhpcy5yZXN1bHQucHJvY2Vzc29yXG4gIH1cblxuICBnZXQgb3B0cygpIHtcbiAgICByZXR1cm4gdGhpcy5yZXN1bHQub3B0c1xuICB9XG5cbiAgZ2V0IGNzcygpIHtcbiAgICByZXR1cm4gdGhpcy5zdHJpbmdpZnkoKS5jc3NcbiAgfVxuXG4gIGdldCBjb250ZW50KCkge1xuICAgIHJldHVybiB0aGlzLnN0cmluZ2lmeSgpLmNvbnRlbnRcbiAgfVxuXG4gIGdldCBtYXAoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RyaW5naWZ5KCkubWFwXG4gIH1cblxuICBnZXQgcm9vdCgpIHtcbiAgICByZXR1cm4gdGhpcy5zeW5jKCkucm9vdFxuICB9XG5cbiAgZ2V0IG1lc3NhZ2VzKCkge1xuICAgIHJldHVybiB0aGlzLnN5bmMoKS5tZXNzYWdlc1xuICB9XG5cbiAgd2FybmluZ3MoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3luYygpLndhcm5pbmdzKClcbiAgfVxuXG4gIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiB0aGlzLmNzc1xuICB9XG5cbiAgdGhlbihvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCkge1xuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICBpZiAoISgnZnJvbScgaW4gdGhpcy5vcHRzKSkge1xuICAgICAgICB3YXJuT25jZShcbiAgICAgICAgICAnV2l0aG91dCBgZnJvbWAgb3B0aW9uIFBvc3RDU1MgY291bGQgZ2VuZXJhdGUgd3Jvbmcgc291cmNlIG1hcCAnICtcbiAgICAgICAgICAgICdhbmQgd2lsbCBub3QgZmluZCBCcm93c2Vyc2xpc3QgY29uZmlnLiBTZXQgaXQgdG8gQ1NTIGZpbGUgcGF0aCAnICtcbiAgICAgICAgICAgICdvciB0byBgdW5kZWZpbmVkYCB0byBwcmV2ZW50IHRoaXMgd2FybmluZy4nXG4gICAgICAgIClcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuYXN5bmMoKS50aGVuKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKVxuICB9XG5cbiAgY2F0Y2gob25SZWplY3RlZCkge1xuICAgIHJldHVybiB0aGlzLmFzeW5jKCkuY2F0Y2gob25SZWplY3RlZClcbiAgfVxuXG4gIGZpbmFsbHkob25GaW5hbGx5KSB7XG4gICAgcmV0dXJuIHRoaXMuYXN5bmMoKS50aGVuKG9uRmluYWxseSwgb25GaW5hbGx5KVxuICB9XG5cbiAgYXN5bmMoKSB7XG4gICAgaWYgKHRoaXMuZXJyb3IpIHJldHVybiBQcm9taXNlLnJlamVjdCh0aGlzLmVycm9yKVxuICAgIGlmICh0aGlzLnByb2Nlc3NlZCkgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLnJlc3VsdClcbiAgICBpZiAoIXRoaXMucHJvY2Vzc2luZykge1xuICAgICAgdGhpcy5wcm9jZXNzaW5nID0gdGhpcy5ydW5Bc3luYygpXG4gICAgfVxuICAgIHJldHVybiB0aGlzLnByb2Nlc3NpbmdcbiAgfVxuXG4gIHN5bmMoKSB7XG4gICAgaWYgKHRoaXMuZXJyb3IpIHRocm93IHRoaXMuZXJyb3JcbiAgICBpZiAodGhpcy5wcm9jZXNzZWQpIHJldHVybiB0aGlzLnJlc3VsdFxuICAgIHRoaXMucHJvY2Vzc2VkID0gdHJ1ZVxuXG4gICAgaWYgKHRoaXMucHJvY2Vzc2luZykge1xuICAgICAgdGhyb3cgdGhpcy5nZXRBc3luY0Vycm9yKClcbiAgICB9XG5cbiAgICBmb3IgKGxldCBwbHVnaW4gb2YgdGhpcy5wbHVnaW5zKSB7XG4gICAgICBsZXQgcHJvbWlzZSA9IHRoaXMucnVuT25Sb290KHBsdWdpbilcbiAgICAgIGlmIChpc1Byb21pc2UocHJvbWlzZSkpIHtcbiAgICAgICAgdGhyb3cgdGhpcy5nZXRBc3luY0Vycm9yKClcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnByZXBhcmVWaXNpdG9ycygpXG4gICAgaWYgKHRoaXMuaGFzTGlzdGVuZXIpIHtcbiAgICAgIGxldCByb290ID0gdGhpcy5yZXN1bHQucm9vdFxuICAgICAgd2hpbGUgKCFyb290W2lzQ2xlYW5dKSB7XG4gICAgICAgIHJvb3RbaXNDbGVhbl0gPSB0cnVlXG4gICAgICAgIHRoaXMud2Fsa1N5bmMocm9vdClcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmxpc3RlbmVycy5PbmNlRXhpdCkge1xuICAgICAgICBpZiAocm9vdC50eXBlID09PSAnZG9jdW1lbnQnKSB7XG4gICAgICAgICAgZm9yIChsZXQgc3ViUm9vdCBvZiByb290Lm5vZGVzKSB7XG4gICAgICAgICAgICB0aGlzLnZpc2l0U3luYyh0aGlzLmxpc3RlbmVycy5PbmNlRXhpdCwgc3ViUm9vdClcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy52aXNpdFN5bmModGhpcy5saXN0ZW5lcnMuT25jZUV4aXQsIHJvb3QpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5yZXN1bHRcbiAgfVxuXG4gIHN0cmluZ2lmeSgpIHtcbiAgICBpZiAodGhpcy5lcnJvcikgdGhyb3cgdGhpcy5lcnJvclxuICAgIGlmICh0aGlzLnN0cmluZ2lmaWVkKSByZXR1cm4gdGhpcy5yZXN1bHRcbiAgICB0aGlzLnN0cmluZ2lmaWVkID0gdHJ1ZVxuXG4gICAgdGhpcy5zeW5jKClcblxuICAgIGxldCBvcHRzID0gdGhpcy5yZXN1bHQub3B0c1xuICAgIGxldCBzdHIgPSBzdHJpbmdpZnlcbiAgICBpZiAob3B0cy5zeW50YXgpIHN0ciA9IG9wdHMuc3ludGF4LnN0cmluZ2lmeVxuICAgIGlmIChvcHRzLnN0cmluZ2lmaWVyKSBzdHIgPSBvcHRzLnN0cmluZ2lmaWVyXG4gICAgaWYgKHN0ci5zdHJpbmdpZnkpIHN0ciA9IHN0ci5zdHJpbmdpZnlcblxuICAgIGxldCBtYXAgPSBuZXcgTWFwR2VuZXJhdG9yKHN0ciwgdGhpcy5yZXN1bHQucm9vdCwgdGhpcy5yZXN1bHQub3B0cylcbiAgICBsZXQgZGF0YSA9IG1hcC5nZW5lcmF0ZSgpXG4gICAgdGhpcy5yZXN1bHQuY3NzID0gZGF0YVswXVxuICAgIHRoaXMucmVzdWx0Lm1hcCA9IGRhdGFbMV1cblxuICAgIHJldHVybiB0aGlzLnJlc3VsdFxuICB9XG5cbiAgd2Fsa1N5bmMobm9kZSkge1xuICAgIG5vZGVbaXNDbGVhbl0gPSB0cnVlXG4gICAgbGV0IGV2ZW50cyA9IGdldEV2ZW50cyhub2RlKVxuICAgIGZvciAobGV0IGV2ZW50IG9mIGV2ZW50cykge1xuICAgICAgaWYgKGV2ZW50ID09PSBDSElMRFJFTikge1xuICAgICAgICBpZiAobm9kZS5ub2Rlcykge1xuICAgICAgICAgIG5vZGUuZWFjaChjaGlsZCA9PiB7XG4gICAgICAgICAgICBpZiAoIWNoaWxkW2lzQ2xlYW5dKSB0aGlzLndhbGtTeW5jKGNoaWxkKVxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCB2aXNpdG9ycyA9IHRoaXMubGlzdGVuZXJzW2V2ZW50XVxuICAgICAgICBpZiAodmlzaXRvcnMpIHtcbiAgICAgICAgICBpZiAodGhpcy52aXNpdFN5bmModmlzaXRvcnMsIG5vZGUudG9Qcm94eSgpKSkgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB2aXNpdFN5bmModmlzaXRvcnMsIG5vZGUpIHtcbiAgICBmb3IgKGxldCBbcGx1Z2luLCB2aXNpdG9yXSBvZiB2aXNpdG9ycykge1xuICAgICAgdGhpcy5yZXN1bHQubGFzdFBsdWdpbiA9IHBsdWdpblxuICAgICAgbGV0IHByb21pc2VcbiAgICAgIHRyeSB7XG4gICAgICAgIHByb21pc2UgPSB2aXNpdG9yKG5vZGUsIHRoaXMuaGVscGVycylcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhyb3cgdGhpcy5oYW5kbGVFcnJvcihlLCBub2RlLnByb3h5T2YpXG4gICAgICB9XG4gICAgICBpZiAobm9kZS50eXBlICE9PSAncm9vdCcgJiYgbm9kZS50eXBlICE9PSAnZG9jdW1lbnQnICYmICFub2RlLnBhcmVudCkge1xuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfVxuICAgICAgaWYgKGlzUHJvbWlzZShwcm9taXNlKSkge1xuICAgICAgICB0aHJvdyB0aGlzLmdldEFzeW5jRXJyb3IoKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJ1bk9uUm9vdChwbHVnaW4pIHtcbiAgICB0aGlzLnJlc3VsdC5sYXN0UGx1Z2luID0gcGx1Z2luXG4gICAgdHJ5IHtcbiAgICAgIGlmICh0eXBlb2YgcGx1Z2luID09PSAnb2JqZWN0JyAmJiBwbHVnaW4uT25jZSkge1xuICAgICAgICBpZiAodGhpcy5yZXN1bHQucm9vdC50eXBlID09PSAnZG9jdW1lbnQnKSB7XG4gICAgICAgICAgbGV0IHJvb3RzID0gdGhpcy5yZXN1bHQucm9vdC5ub2Rlcy5tYXAocm9vdCA9PlxuICAgICAgICAgICAgcGx1Z2luLk9uY2Uocm9vdCwgdGhpcy5oZWxwZXJzKVxuICAgICAgICAgIClcblxuICAgICAgICAgIGlmIChpc1Byb21pc2Uocm9vdHNbMF0pKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwocm9vdHMpXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHJvb3RzXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGx1Z2luLk9uY2UodGhpcy5yZXN1bHQucm9vdCwgdGhpcy5oZWxwZXJzKVxuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgcGx1Z2luID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJldHVybiBwbHVnaW4odGhpcy5yZXN1bHQucm9vdCwgdGhpcy5yZXN1bHQpXG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHRocm93IHRoaXMuaGFuZGxlRXJyb3IoZXJyb3IpXG4gICAgfVxuICB9XG5cbiAgZ2V0QXN5bmNFcnJvcigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1VzZSBwcm9jZXNzKGNzcykudGhlbihjYikgdG8gd29yayB3aXRoIGFzeW5jIHBsdWdpbnMnKVxuICB9XG5cbiAgaGFuZGxlRXJyb3IoZXJyb3IsIG5vZGUpIHtcbiAgICBsZXQgcGx1Z2luID0gdGhpcy5yZXN1bHQubGFzdFBsdWdpblxuICAgIHRyeSB7XG4gICAgICBpZiAobm9kZSkgbm9kZS5hZGRUb0Vycm9yKGVycm9yKVxuICAgICAgdGhpcy5lcnJvciA9IGVycm9yXG4gICAgICBpZiAoZXJyb3IubmFtZSA9PT0gJ0Nzc1N5bnRheEVycm9yJyAmJiAhZXJyb3IucGx1Z2luKSB7XG4gICAgICAgIGVycm9yLnBsdWdpbiA9IHBsdWdpbi5wb3N0Y3NzUGx1Z2luXG4gICAgICAgIGVycm9yLnNldE1lc3NhZ2UoKVxuICAgICAgfSBlbHNlIGlmIChwbHVnaW4ucG9zdGNzc1ZlcnNpb24pIHtcbiAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgICAgICBsZXQgcGx1Z2luTmFtZSA9IHBsdWdpbi5wb3N0Y3NzUGx1Z2luXG4gICAgICAgICAgbGV0IHBsdWdpblZlciA9IHBsdWdpbi5wb3N0Y3NzVmVyc2lvblxuICAgICAgICAgIGxldCBydW50aW1lVmVyID0gdGhpcy5yZXN1bHQucHJvY2Vzc29yLnZlcnNpb25cbiAgICAgICAgICBsZXQgYSA9IHBsdWdpblZlci5zcGxpdCgnLicpXG4gICAgICAgICAgbGV0IGIgPSBydW50aW1lVmVyLnNwbGl0KCcuJylcblxuICAgICAgICAgIGlmIChhWzBdICE9PSBiWzBdIHx8IHBhcnNlSW50KGFbMV0pID4gcGFyc2VJbnQoYlsxXSkpIHtcbiAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICAgICAgICAnVW5rbm93biBlcnJvciBmcm9tIFBvc3RDU1MgcGx1Z2luLiBZb3VyIGN1cnJlbnQgUG9zdENTUyAnICtcbiAgICAgICAgICAgICAgICAndmVyc2lvbiBpcyAnICtcbiAgICAgICAgICAgICAgICBydW50aW1lVmVyICtcbiAgICAgICAgICAgICAgICAnLCBidXQgJyArXG4gICAgICAgICAgICAgICAgcGx1Z2luTmFtZSArXG4gICAgICAgICAgICAgICAgJyB1c2VzICcgK1xuICAgICAgICAgICAgICAgIHBsdWdpblZlciArXG4gICAgICAgICAgICAgICAgJy4gUGVyaGFwcyB0aGlzIGlzIHRoZSBzb3VyY2Ugb2YgdGhlIGVycm9yIGJlbG93LidcbiAgICAgICAgICAgIClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIC8qIGM4IGlnbm9yZSBuZXh0IDMgKi9cbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICBpZiAoY29uc29sZSAmJiBjb25zb2xlLmVycm9yKSBjb25zb2xlLmVycm9yKGVycilcbiAgICB9XG4gICAgcmV0dXJuIGVycm9yXG4gIH1cblxuICBhc3luYyBydW5Bc3luYygpIHtcbiAgICB0aGlzLnBsdWdpbiA9IDBcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucGx1Z2lucy5sZW5ndGg7IGkrKykge1xuICAgICAgbGV0IHBsdWdpbiA9IHRoaXMucGx1Z2luc1tpXVxuICAgICAgbGV0IHByb21pc2UgPSB0aGlzLnJ1bk9uUm9vdChwbHVnaW4pXG4gICAgICBpZiAoaXNQcm9taXNlKHByb21pc2UpKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgYXdhaXQgcHJvbWlzZVxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIHRocm93IHRoaXMuaGFuZGxlRXJyb3IoZXJyb3IpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnByZXBhcmVWaXNpdG9ycygpXG4gICAgaWYgKHRoaXMuaGFzTGlzdGVuZXIpIHtcbiAgICAgIGxldCByb290ID0gdGhpcy5yZXN1bHQucm9vdFxuICAgICAgd2hpbGUgKCFyb290W2lzQ2xlYW5dKSB7XG4gICAgICAgIHJvb3RbaXNDbGVhbl0gPSB0cnVlXG4gICAgICAgIGxldCBzdGFjayA9IFt0b1N0YWNrKHJvb3QpXVxuICAgICAgICB3aGlsZSAoc3RhY2subGVuZ3RoID4gMCkge1xuICAgICAgICAgIGxldCBwcm9taXNlID0gdGhpcy52aXNpdFRpY2soc3RhY2spXG4gICAgICAgICAgaWYgKGlzUHJvbWlzZShwcm9taXNlKSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgYXdhaXQgcHJvbWlzZVxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICBsZXQgbm9kZSA9IHN0YWNrW3N0YWNrLmxlbmd0aCAtIDFdLm5vZGVcbiAgICAgICAgICAgICAgdGhyb3cgdGhpcy5oYW5kbGVFcnJvcihlLCBub2RlKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5saXN0ZW5lcnMuT25jZUV4aXQpIHtcbiAgICAgICAgZm9yIChsZXQgW3BsdWdpbiwgdmlzaXRvcl0gb2YgdGhpcy5saXN0ZW5lcnMuT25jZUV4aXQpIHtcbiAgICAgICAgICB0aGlzLnJlc3VsdC5sYXN0UGx1Z2luID0gcGx1Z2luXG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmIChyb290LnR5cGUgPT09ICdkb2N1bWVudCcpIHtcbiAgICAgICAgICAgICAgbGV0IHJvb3RzID0gcm9vdC5ub2Rlcy5tYXAoc3ViUm9vdCA9PlxuICAgICAgICAgICAgICAgIHZpc2l0b3Ioc3ViUm9vdCwgdGhpcy5oZWxwZXJzKVxuICAgICAgICAgICAgICApXG5cbiAgICAgICAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwocm9vdHMpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBhd2FpdCB2aXNpdG9yKHJvb3QsIHRoaXMuaGVscGVycylcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aHJvdyB0aGlzLmhhbmRsZUVycm9yKGUpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5wcm9jZXNzZWQgPSB0cnVlXG4gICAgcmV0dXJuIHRoaXMuc3RyaW5naWZ5KClcbiAgfVxuXG4gIHByZXBhcmVWaXNpdG9ycygpIHtcbiAgICB0aGlzLmxpc3RlbmVycyA9IHt9XG4gICAgbGV0IGFkZCA9IChwbHVnaW4sIHR5cGUsIGNiKSA9PiB7XG4gICAgICBpZiAoIXRoaXMubGlzdGVuZXJzW3R5cGVdKSB0aGlzLmxpc3RlbmVyc1t0eXBlXSA9IFtdXG4gICAgICB0aGlzLmxpc3RlbmVyc1t0eXBlXS5wdXNoKFtwbHVnaW4sIGNiXSlcbiAgICB9XG4gICAgZm9yIChsZXQgcGx1Z2luIG9mIHRoaXMucGx1Z2lucykge1xuICAgICAgaWYgKHR5cGVvZiBwbHVnaW4gPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGZvciAobGV0IGV2ZW50IGluIHBsdWdpbikge1xuICAgICAgICAgIGlmICghUExVR0lOX1BST1BTW2V2ZW50XSAmJiAvXltBLVpdLy50ZXN0KGV2ZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICBgVW5rbm93biBldmVudCAke2V2ZW50fSBpbiAke3BsdWdpbi5wb3N0Y3NzUGx1Z2lufS4gYCArXG4gICAgICAgICAgICAgICAgYFRyeSB0byB1cGRhdGUgUG9zdENTUyAoJHt0aGlzLnByb2Nlc3Nvci52ZXJzaW9ufSBub3cpLmBcbiAgICAgICAgICAgIClcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFOT1RfVklTSVRPUlNbZXZlbnRdKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHBsdWdpbltldmVudF0gPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgIGZvciAobGV0IGZpbHRlciBpbiBwbHVnaW5bZXZlbnRdKSB7XG4gICAgICAgICAgICAgICAgaWYgKGZpbHRlciA9PT0gJyonKSB7XG4gICAgICAgICAgICAgICAgICBhZGQocGx1Z2luLCBldmVudCwgcGx1Z2luW2V2ZW50XVtmaWx0ZXJdKVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBhZGQoXG4gICAgICAgICAgICAgICAgICAgIHBsdWdpbixcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQgKyAnLScgKyBmaWx0ZXIudG9Mb3dlckNhc2UoKSxcbiAgICAgICAgICAgICAgICAgICAgcGx1Z2luW2V2ZW50XVtmaWx0ZXJdXG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBwbHVnaW5bZXZlbnRdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgIGFkZChwbHVnaW4sIGV2ZW50LCBwbHVnaW5bZXZlbnRdKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmhhc0xpc3RlbmVyID0gT2JqZWN0LmtleXModGhpcy5saXN0ZW5lcnMpLmxlbmd0aCA+IDBcbiAgfVxuXG4gIHZpc2l0VGljayhzdGFjaykge1xuICAgIGxldCB2aXNpdCA9IHN0YWNrW3N0YWNrLmxlbmd0aCAtIDFdXG4gICAgbGV0IHsgbm9kZSwgdmlzaXRvcnMgfSA9IHZpc2l0XG5cbiAgICBpZiAobm9kZS50eXBlICE9PSAncm9vdCcgJiYgbm9kZS50eXBlICE9PSAnZG9jdW1lbnQnICYmICFub2RlLnBhcmVudCkge1xuICAgICAgc3RhY2sucG9wKClcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGlmICh2aXNpdG9ycy5sZW5ndGggPiAwICYmIHZpc2l0LnZpc2l0b3JJbmRleCA8IHZpc2l0b3JzLmxlbmd0aCkge1xuICAgICAgbGV0IFtwbHVnaW4sIHZpc2l0b3JdID0gdmlzaXRvcnNbdmlzaXQudmlzaXRvckluZGV4XVxuICAgICAgdmlzaXQudmlzaXRvckluZGV4ICs9IDFcbiAgICAgIGlmICh2aXNpdC52aXNpdG9ySW5kZXggPT09IHZpc2l0b3JzLmxlbmd0aCkge1xuICAgICAgICB2aXNpdC52aXNpdG9ycyA9IFtdXG4gICAgICAgIHZpc2l0LnZpc2l0b3JJbmRleCA9IDBcbiAgICAgIH1cbiAgICAgIHRoaXMucmVzdWx0Lmxhc3RQbHVnaW4gPSBwbHVnaW5cbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiB2aXNpdG9yKG5vZGUudG9Qcm94eSgpLCB0aGlzLmhlbHBlcnMpXG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHRocm93IHRoaXMuaGFuZGxlRXJyb3IoZSwgbm9kZSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodmlzaXQuaXRlcmF0b3IgIT09IDApIHtcbiAgICAgIGxldCBpdGVyYXRvciA9IHZpc2l0Lml0ZXJhdG9yXG4gICAgICBsZXQgY2hpbGRcbiAgICAgIHdoaWxlICgoY2hpbGQgPSBub2RlLm5vZGVzW25vZGUuaW5kZXhlc1tpdGVyYXRvcl1dKSkge1xuICAgICAgICBub2RlLmluZGV4ZXNbaXRlcmF0b3JdICs9IDFcbiAgICAgICAgaWYgKCFjaGlsZFtpc0NsZWFuXSkge1xuICAgICAgICAgIGNoaWxkW2lzQ2xlYW5dID0gdHJ1ZVxuICAgICAgICAgIHN0YWNrLnB1c2godG9TdGFjayhjaGlsZCkpXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHZpc2l0Lml0ZXJhdG9yID0gMFxuICAgICAgZGVsZXRlIG5vZGUuaW5kZXhlc1tpdGVyYXRvcl1cbiAgICB9XG5cbiAgICBsZXQgZXZlbnRzID0gdmlzaXQuZXZlbnRzXG4gICAgd2hpbGUgKHZpc2l0LmV2ZW50SW5kZXggPCBldmVudHMubGVuZ3RoKSB7XG4gICAgICBsZXQgZXZlbnQgPSBldmVudHNbdmlzaXQuZXZlbnRJbmRleF1cbiAgICAgIHZpc2l0LmV2ZW50SW5kZXggKz0gMVxuICAgICAgaWYgKGV2ZW50ID09PSBDSElMRFJFTikge1xuICAgICAgICBpZiAobm9kZS5ub2RlcyAmJiBub2RlLm5vZGVzLmxlbmd0aCkge1xuICAgICAgICAgIG5vZGVbaXNDbGVhbl0gPSB0cnVlXG4gICAgICAgICAgdmlzaXQuaXRlcmF0b3IgPSBub2RlLmdldEl0ZXJhdG9yKClcbiAgICAgICAgfVxuICAgICAgICByZXR1cm5cbiAgICAgIH0gZWxzZSBpZiAodGhpcy5saXN0ZW5lcnNbZXZlbnRdKSB7XG4gICAgICAgIHZpc2l0LnZpc2l0b3JzID0gdGhpcy5saXN0ZW5lcnNbZXZlbnRdXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgIH1cbiAgICBzdGFjay5wb3AoKVxuICB9XG59XG5cbkxhenlSZXN1bHQucmVnaXN0ZXJQb3N0Y3NzID0gZGVwZW5kYW50ID0+IHtcbiAgcG9zdGNzcyA9IGRlcGVuZGFudFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IExhenlSZXN1bHRcbkxhenlSZXN1bHQuZGVmYXVsdCA9IExhenlSZXN1bHRcblxuUm9vdC5yZWdpc3RlckxhenlSZXN1bHQoTGF6eVJlc3VsdClcbkRvY3VtZW50LnJlZ2lzdGVyTGF6eVJlc3VsdChMYXp5UmVzdWx0KVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBsaXN0ID0ge1xuICBzcGxpdChzdHJpbmcsIHNlcGFyYXRvcnMsIGxhc3QpIHtcbiAgICBsZXQgYXJyYXkgPSBbXVxuICAgIGxldCBjdXJyZW50ID0gJydcbiAgICBsZXQgc3BsaXQgPSBmYWxzZVxuXG4gICAgbGV0IGZ1bmMgPSAwXG4gICAgbGV0IHF1b3RlID0gZmFsc2VcbiAgICBsZXQgZXNjYXBlID0gZmFsc2VcblxuICAgIGZvciAobGV0IGxldHRlciBvZiBzdHJpbmcpIHtcbiAgICAgIGlmIChlc2NhcGUpIHtcbiAgICAgICAgZXNjYXBlID0gZmFsc2VcbiAgICAgIH0gZWxzZSBpZiAobGV0dGVyID09PSAnXFxcXCcpIHtcbiAgICAgICAgZXNjYXBlID0gdHJ1ZVxuICAgICAgfSBlbHNlIGlmIChxdW90ZSkge1xuICAgICAgICBpZiAobGV0dGVyID09PSBxdW90ZSkge1xuICAgICAgICAgIHF1b3RlID0gZmFsc2VcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChsZXR0ZXIgPT09ICdcIicgfHwgbGV0dGVyID09PSBcIidcIikge1xuICAgICAgICBxdW90ZSA9IGxldHRlclxuICAgICAgfSBlbHNlIGlmIChsZXR0ZXIgPT09ICcoJykge1xuICAgICAgICBmdW5jICs9IDFcbiAgICAgIH0gZWxzZSBpZiAobGV0dGVyID09PSAnKScpIHtcbiAgICAgICAgaWYgKGZ1bmMgPiAwKSBmdW5jIC09IDFcbiAgICAgIH0gZWxzZSBpZiAoZnVuYyA9PT0gMCkge1xuICAgICAgICBpZiAoc2VwYXJhdG9ycy5pbmNsdWRlcyhsZXR0ZXIpKSBzcGxpdCA9IHRydWVcbiAgICAgIH1cblxuICAgICAgaWYgKHNwbGl0KSB7XG4gICAgICAgIGlmIChjdXJyZW50ICE9PSAnJykgYXJyYXkucHVzaChjdXJyZW50LnRyaW0oKSlcbiAgICAgICAgY3VycmVudCA9ICcnXG4gICAgICAgIHNwbGl0ID0gZmFsc2VcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGN1cnJlbnQgKz0gbGV0dGVyXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGxhc3QgfHwgY3VycmVudCAhPT0gJycpIGFycmF5LnB1c2goY3VycmVudC50cmltKCkpXG4gICAgcmV0dXJuIGFycmF5XG4gIH0sXG5cbiAgc3BhY2Uoc3RyaW5nKSB7XG4gICAgbGV0IHNwYWNlcyA9IFsnICcsICdcXG4nLCAnXFx0J11cbiAgICByZXR1cm4gbGlzdC5zcGxpdChzdHJpbmcsIHNwYWNlcylcbiAgfSxcblxuICBjb21tYShzdHJpbmcpIHtcbiAgICByZXR1cm4gbGlzdC5zcGxpdChzdHJpbmcsIFsnLCddLCB0cnVlKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbGlzdFxubGlzdC5kZWZhdWx0ID0gbGlzdFxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCB7IFNvdXJjZU1hcENvbnN1bWVyLCBTb3VyY2VNYXBHZW5lcmF0b3IgfSA9IHJlcXVpcmUoJ3NvdXJjZS1tYXAtanMnKVxubGV0IHsgZGlybmFtZSwgcmVzb2x2ZSwgcmVsYXRpdmUsIHNlcCB9ID0gcmVxdWlyZSgncGF0aCcpXG5sZXQgeyBwYXRoVG9GaWxlVVJMIH0gPSByZXF1aXJlKCd1cmwnKVxuXG5sZXQgSW5wdXQgPSByZXF1aXJlKCcuL2lucHV0JylcblxubGV0IHNvdXJjZU1hcEF2YWlsYWJsZSA9IEJvb2xlYW4oU291cmNlTWFwQ29uc3VtZXIgJiYgU291cmNlTWFwR2VuZXJhdG9yKVxubGV0IHBhdGhBdmFpbGFibGUgPSBCb29sZWFuKGRpcm5hbWUgJiYgcmVzb2x2ZSAmJiByZWxhdGl2ZSAmJiBzZXApXG5cbmNsYXNzIE1hcEdlbmVyYXRvciB7XG4gIGNvbnN0cnVjdG9yKHN0cmluZ2lmeSwgcm9vdCwgb3B0cywgY3NzU3RyaW5nKSB7XG4gICAgdGhpcy5zdHJpbmdpZnkgPSBzdHJpbmdpZnlcbiAgICB0aGlzLm1hcE9wdHMgPSBvcHRzLm1hcCB8fCB7fVxuICAgIHRoaXMucm9vdCA9IHJvb3RcbiAgICB0aGlzLm9wdHMgPSBvcHRzXG4gICAgdGhpcy5jc3MgPSBjc3NTdHJpbmdcbiAgfVxuXG4gIGlzTWFwKCkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5vcHRzLm1hcCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJldHVybiAhIXRoaXMub3B0cy5tYXBcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucHJldmlvdXMoKS5sZW5ndGggPiAwXG4gIH1cblxuICBwcmV2aW91cygpIHtcbiAgICBpZiAoIXRoaXMucHJldmlvdXNNYXBzKSB7XG4gICAgICB0aGlzLnByZXZpb3VzTWFwcyA9IFtdXG4gICAgICBpZiAodGhpcy5yb290KSB7XG4gICAgICAgIHRoaXMucm9vdC53YWxrKG5vZGUgPT4ge1xuICAgICAgICAgIGlmIChub2RlLnNvdXJjZSAmJiBub2RlLnNvdXJjZS5pbnB1dC5tYXApIHtcbiAgICAgICAgICAgIGxldCBtYXAgPSBub2RlLnNvdXJjZS5pbnB1dC5tYXBcbiAgICAgICAgICAgIGlmICghdGhpcy5wcmV2aW91c01hcHMuaW5jbHVkZXMobWFwKSkge1xuICAgICAgICAgICAgICB0aGlzLnByZXZpb3VzTWFwcy5wdXNoKG1hcClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgaW5wdXQgPSBuZXcgSW5wdXQodGhpcy5jc3MsIHRoaXMub3B0cylcbiAgICAgICAgaWYgKGlucHV0Lm1hcCkgdGhpcy5wcmV2aW91c01hcHMucHVzaChpbnB1dC5tYXApXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMucHJldmlvdXNNYXBzXG4gIH1cblxuICBpc0lubGluZSgpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMubWFwT3B0cy5pbmxpbmUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm4gdGhpcy5tYXBPcHRzLmlubGluZVxuICAgIH1cblxuICAgIGxldCBhbm5vdGF0aW9uID0gdGhpcy5tYXBPcHRzLmFubm90YXRpb25cbiAgICBpZiAodHlwZW9mIGFubm90YXRpb24gIT09ICd1bmRlZmluZWQnICYmIGFubm90YXRpb24gIT09IHRydWUpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIGlmICh0aGlzLnByZXZpb3VzKCkubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcmV2aW91cygpLnNvbWUoaSA9PiBpLmlubGluZSlcbiAgICB9XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIGlzU291cmNlc0NvbnRlbnQoKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLm1hcE9wdHMuc291cmNlc0NvbnRlbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm4gdGhpcy5tYXBPcHRzLnNvdXJjZXNDb250ZW50XG4gICAgfVxuICAgIGlmICh0aGlzLnByZXZpb3VzKCkubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcmV2aW91cygpLnNvbWUoaSA9PiBpLndpdGhDb250ZW50KCkpXG4gICAgfVxuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBjbGVhckFubm90YXRpb24oKSB7XG4gICAgaWYgKHRoaXMubWFwT3B0cy5hbm5vdGF0aW9uID09PSBmYWxzZSkgcmV0dXJuXG5cbiAgICBpZiAodGhpcy5yb290KSB7XG4gICAgICBsZXQgbm9kZVxuICAgICAgZm9yIChsZXQgaSA9IHRoaXMucm9vdC5ub2Rlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICBub2RlID0gdGhpcy5yb290Lm5vZGVzW2ldXG4gICAgICAgIGlmIChub2RlLnR5cGUgIT09ICdjb21tZW50JykgY29udGludWVcbiAgICAgICAgaWYgKG5vZGUudGV4dC5pbmRleE9mKCcjIHNvdXJjZU1hcHBpbmdVUkw9JykgPT09IDApIHtcbiAgICAgICAgICB0aGlzLnJvb3QucmVtb3ZlQ2hpbGQoaSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGhpcy5jc3MpIHtcbiAgICAgIHRoaXMuY3NzID0gdGhpcy5jc3MucmVwbGFjZSgvKFxcbik/XFwvXFwqI1tcXFNcXHNdKj9cXCpcXC8kL2dtLCAnJylcbiAgICB9XG4gIH1cblxuICBzZXRTb3VyY2VzQ29udGVudCgpIHtcbiAgICBsZXQgYWxyZWFkeSA9IHt9XG4gICAgaWYgKHRoaXMucm9vdCkge1xuICAgICAgdGhpcy5yb290LndhbGsobm9kZSA9PiB7XG4gICAgICAgIGlmIChub2RlLnNvdXJjZSkge1xuICAgICAgICAgIGxldCBmcm9tID0gbm9kZS5zb3VyY2UuaW5wdXQuZnJvbVxuICAgICAgICAgIGlmIChmcm9tICYmICFhbHJlYWR5W2Zyb21dKSB7XG4gICAgICAgICAgICBhbHJlYWR5W2Zyb21dID0gdHJ1ZVxuICAgICAgICAgICAgdGhpcy5tYXAuc2V0U291cmNlQ29udGVudChcbiAgICAgICAgICAgICAgdGhpcy50b1VybCh0aGlzLnBhdGgoZnJvbSkpLFxuICAgICAgICAgICAgICBub2RlLnNvdXJjZS5pbnB1dC5jc3NcbiAgICAgICAgICAgIClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSBlbHNlIGlmICh0aGlzLmNzcykge1xuICAgICAgbGV0IGZyb20gPSB0aGlzLm9wdHMuZnJvbVxuICAgICAgICA/IHRoaXMudG9VcmwodGhpcy5wYXRoKHRoaXMub3B0cy5mcm9tKSlcbiAgICAgICAgOiAnPG5vIHNvdXJjZT4nXG4gICAgICB0aGlzLm1hcC5zZXRTb3VyY2VDb250ZW50KGZyb20sIHRoaXMuY3NzKVxuICAgIH1cbiAgfVxuXG4gIGFwcGx5UHJldk1hcHMoKSB7XG4gICAgZm9yIChsZXQgcHJldiBvZiB0aGlzLnByZXZpb3VzKCkpIHtcbiAgICAgIGxldCBmcm9tID0gdGhpcy50b1VybCh0aGlzLnBhdGgocHJldi5maWxlKSlcbiAgICAgIGxldCByb290ID0gcHJldi5yb290IHx8IGRpcm5hbWUocHJldi5maWxlKVxuICAgICAgbGV0IG1hcFxuXG4gICAgICBpZiAodGhpcy5tYXBPcHRzLnNvdXJjZXNDb250ZW50ID09PSBmYWxzZSkge1xuICAgICAgICBtYXAgPSBuZXcgU291cmNlTWFwQ29uc3VtZXIocHJldi50ZXh0KVxuICAgICAgICBpZiAobWFwLnNvdXJjZXNDb250ZW50KSB7XG4gICAgICAgICAgbWFwLnNvdXJjZXNDb250ZW50ID0gbWFwLnNvdXJjZXNDb250ZW50Lm1hcCgoKSA9PiBudWxsKVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtYXAgPSBwcmV2LmNvbnN1bWVyKClcbiAgICAgIH1cblxuICAgICAgdGhpcy5tYXAuYXBwbHlTb3VyY2VNYXAobWFwLCBmcm9tLCB0aGlzLnRvVXJsKHRoaXMucGF0aChyb290KSkpXG4gICAgfVxuICB9XG5cbiAgaXNBbm5vdGF0aW9uKCkge1xuICAgIGlmICh0aGlzLmlzSW5saW5lKCkpIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICAgIGlmICh0eXBlb2YgdGhpcy5tYXBPcHRzLmFubm90YXRpb24gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm4gdGhpcy5tYXBPcHRzLmFubm90YXRpb25cbiAgICB9XG4gICAgaWYgKHRoaXMucHJldmlvdXMoKS5sZW5ndGgpIHtcbiAgICAgIHJldHVybiB0aGlzLnByZXZpb3VzKCkuc29tZShpID0+IGkuYW5ub3RhdGlvbilcbiAgICB9XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIHRvQmFzZTY0KHN0cikge1xuICAgIGlmIChCdWZmZXIpIHtcbiAgICAgIHJldHVybiBCdWZmZXIuZnJvbShzdHIpLnRvU3RyaW5nKCdiYXNlNjQnKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gd2luZG93LmJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KHN0cikpKVxuICAgIH1cbiAgfVxuXG4gIGFkZEFubm90YXRpb24oKSB7XG4gICAgbGV0IGNvbnRlbnRcblxuICAgIGlmICh0aGlzLmlzSW5saW5lKCkpIHtcbiAgICAgIGNvbnRlbnQgPVxuICAgICAgICAnZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCwnICsgdGhpcy50b0Jhc2U2NCh0aGlzLm1hcC50b1N0cmluZygpKVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMubWFwT3B0cy5hbm5vdGF0aW9uID09PSAnc3RyaW5nJykge1xuICAgICAgY29udGVudCA9IHRoaXMubWFwT3B0cy5hbm5vdGF0aW9uXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5tYXBPcHRzLmFubm90YXRpb24gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbnRlbnQgPSB0aGlzLm1hcE9wdHMuYW5ub3RhdGlvbih0aGlzLm9wdHMudG8sIHRoaXMucm9vdClcbiAgICB9IGVsc2Uge1xuICAgICAgY29udGVudCA9IHRoaXMub3V0cHV0RmlsZSgpICsgJy5tYXAnXG4gICAgfVxuICAgIGxldCBlb2wgPSAnXFxuJ1xuICAgIGlmICh0aGlzLmNzcy5pbmNsdWRlcygnXFxyXFxuJykpIGVvbCA9ICdcXHJcXG4nXG5cbiAgICB0aGlzLmNzcyArPSBlb2wgKyAnLyojIHNvdXJjZU1hcHBpbmdVUkw9JyArIGNvbnRlbnQgKyAnICovJ1xuICB9XG5cbiAgb3V0cHV0RmlsZSgpIHtcbiAgICBpZiAodGhpcy5vcHRzLnRvKSB7XG4gICAgICByZXR1cm4gdGhpcy5wYXRoKHRoaXMub3B0cy50bylcbiAgICB9IGVsc2UgaWYgKHRoaXMub3B0cy5mcm9tKSB7XG4gICAgICByZXR1cm4gdGhpcy5wYXRoKHRoaXMub3B0cy5mcm9tKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gJ3RvLmNzcydcbiAgICB9XG4gIH1cblxuICBnZW5lcmF0ZU1hcCgpIHtcbiAgICBpZiAodGhpcy5yb290KSB7XG4gICAgICB0aGlzLmdlbmVyYXRlU3RyaW5nKClcbiAgICB9IGVsc2UgaWYgKHRoaXMucHJldmlvdXMoKS5sZW5ndGggPT09IDEpIHtcbiAgICAgIGxldCBwcmV2ID0gdGhpcy5wcmV2aW91cygpWzBdLmNvbnN1bWVyKClcbiAgICAgIHByZXYuZmlsZSA9IHRoaXMub3V0cHV0RmlsZSgpXG4gICAgICB0aGlzLm1hcCA9IFNvdXJjZU1hcEdlbmVyYXRvci5mcm9tU291cmNlTWFwKHByZXYpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubWFwID0gbmV3IFNvdXJjZU1hcEdlbmVyYXRvcih7IGZpbGU6IHRoaXMub3V0cHV0RmlsZSgpIH0pXG4gICAgICB0aGlzLm1hcC5hZGRNYXBwaW5nKHtcbiAgICAgICAgc291cmNlOiB0aGlzLm9wdHMuZnJvbVxuICAgICAgICAgID8gdGhpcy50b1VybCh0aGlzLnBhdGgodGhpcy5vcHRzLmZyb20pKVxuICAgICAgICAgIDogJzxubyBzb3VyY2U+JyxcbiAgICAgICAgZ2VuZXJhdGVkOiB7IGxpbmU6IDEsIGNvbHVtbjogMCB9LFxuICAgICAgICBvcmlnaW5hbDogeyBsaW5lOiAxLCBjb2x1bW46IDAgfVxuICAgICAgfSlcbiAgICB9XG5cbiAgICBpZiAodGhpcy5pc1NvdXJjZXNDb250ZW50KCkpIHRoaXMuc2V0U291cmNlc0NvbnRlbnQoKVxuICAgIGlmICh0aGlzLnJvb3QgJiYgdGhpcy5wcmV2aW91cygpLmxlbmd0aCA+IDApIHRoaXMuYXBwbHlQcmV2TWFwcygpXG4gICAgaWYgKHRoaXMuaXNBbm5vdGF0aW9uKCkpIHRoaXMuYWRkQW5ub3RhdGlvbigpXG5cbiAgICBpZiAodGhpcy5pc0lubGluZSgpKSB7XG4gICAgICByZXR1cm4gW3RoaXMuY3NzXVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gW3RoaXMuY3NzLCB0aGlzLm1hcF1cbiAgICB9XG4gIH1cblxuICBwYXRoKGZpbGUpIHtcbiAgICBpZiAoZmlsZS5pbmRleE9mKCc8JykgPT09IDApIHJldHVybiBmaWxlXG4gICAgaWYgKC9eXFx3KzpcXC9cXC8vLnRlc3QoZmlsZSkpIHJldHVybiBmaWxlXG4gICAgaWYgKHRoaXMubWFwT3B0cy5hYnNvbHV0ZSkgcmV0dXJuIGZpbGVcblxuICAgIGxldCBmcm9tID0gdGhpcy5vcHRzLnRvID8gZGlybmFtZSh0aGlzLm9wdHMudG8pIDogJy4nXG5cbiAgICBpZiAodHlwZW9mIHRoaXMubWFwT3B0cy5hbm5vdGF0aW9uID09PSAnc3RyaW5nJykge1xuICAgICAgZnJvbSA9IGRpcm5hbWUocmVzb2x2ZShmcm9tLCB0aGlzLm1hcE9wdHMuYW5ub3RhdGlvbikpXG4gICAgfVxuXG4gICAgZmlsZSA9IHJlbGF0aXZlKGZyb20sIGZpbGUpXG4gICAgcmV0dXJuIGZpbGVcbiAgfVxuXG4gIHRvVXJsKHBhdGgpIHtcbiAgICBpZiAoc2VwID09PSAnXFxcXCcpIHtcbiAgICAgIHBhdGggPSBwYXRoLnJlcGxhY2UoL1xcXFwvZywgJy8nKVxuICAgIH1cbiAgICByZXR1cm4gZW5jb2RlVVJJKHBhdGgpLnJlcGxhY2UoL1sjP10vZywgZW5jb2RlVVJJQ29tcG9uZW50KVxuICB9XG5cbiAgc291cmNlUGF0aChub2RlKSB7XG4gICAgaWYgKHRoaXMubWFwT3B0cy5mcm9tKSB7XG4gICAgICByZXR1cm4gdGhpcy50b1VybCh0aGlzLm1hcE9wdHMuZnJvbSlcbiAgICB9IGVsc2UgaWYgKHRoaXMubWFwT3B0cy5hYnNvbHV0ZSkge1xuICAgICAgaWYgKHBhdGhUb0ZpbGVVUkwpIHtcbiAgICAgICAgcmV0dXJuIHBhdGhUb0ZpbGVVUkwobm9kZS5zb3VyY2UuaW5wdXQuZnJvbSkudG9TdHJpbmcoKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICdgbWFwLmFic29sdXRlYCBvcHRpb24gaXMgbm90IGF2YWlsYWJsZSBpbiB0aGlzIFBvc3RDU1MgYnVpbGQnXG4gICAgICAgIClcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMudG9VcmwodGhpcy5wYXRoKG5vZGUuc291cmNlLmlucHV0LmZyb20pKVxuICAgIH1cbiAgfVxuXG4gIGdlbmVyYXRlU3RyaW5nKCkge1xuICAgIHRoaXMuY3NzID0gJydcbiAgICB0aGlzLm1hcCA9IG5ldyBTb3VyY2VNYXBHZW5lcmF0b3IoeyBmaWxlOiB0aGlzLm91dHB1dEZpbGUoKSB9KVxuXG4gICAgbGV0IGxpbmUgPSAxXG4gICAgbGV0IGNvbHVtbiA9IDFcblxuICAgIGxldCBub1NvdXJjZSA9ICc8bm8gc291cmNlPidcbiAgICBsZXQgbWFwcGluZyA9IHtcbiAgICAgIHNvdXJjZTogJycsXG4gICAgICBnZW5lcmF0ZWQ6IHsgbGluZTogMCwgY29sdW1uOiAwIH0sXG4gICAgICBvcmlnaW5hbDogeyBsaW5lOiAwLCBjb2x1bW46IDAgfVxuICAgIH1cblxuICAgIGxldCBsaW5lcywgbGFzdFxuICAgIHRoaXMuc3RyaW5naWZ5KHRoaXMucm9vdCwgKHN0ciwgbm9kZSwgdHlwZSkgPT4ge1xuICAgICAgdGhpcy5jc3MgKz0gc3RyXG5cbiAgICAgIGlmIChub2RlICYmIHR5cGUgIT09ICdlbmQnKSB7XG4gICAgICAgIG1hcHBpbmcuZ2VuZXJhdGVkLmxpbmUgPSBsaW5lXG4gICAgICAgIG1hcHBpbmcuZ2VuZXJhdGVkLmNvbHVtbiA9IGNvbHVtbiAtIDFcbiAgICAgICAgaWYgKG5vZGUuc291cmNlICYmIG5vZGUuc291cmNlLnN0YXJ0KSB7XG4gICAgICAgICAgbWFwcGluZy5zb3VyY2UgPSB0aGlzLnNvdXJjZVBhdGgobm9kZSlcbiAgICAgICAgICBtYXBwaW5nLm9yaWdpbmFsLmxpbmUgPSBub2RlLnNvdXJjZS5zdGFydC5saW5lXG4gICAgICAgICAgbWFwcGluZy5vcmlnaW5hbC5jb2x1bW4gPSBub2RlLnNvdXJjZS5zdGFydC5jb2x1bW4gLSAxXG4gICAgICAgICAgdGhpcy5tYXAuYWRkTWFwcGluZyhtYXBwaW5nKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG1hcHBpbmcuc291cmNlID0gbm9Tb3VyY2VcbiAgICAgICAgICBtYXBwaW5nLm9yaWdpbmFsLmxpbmUgPSAxXG4gICAgICAgICAgbWFwcGluZy5vcmlnaW5hbC5jb2x1bW4gPSAwXG4gICAgICAgICAgdGhpcy5tYXAuYWRkTWFwcGluZyhtYXBwaW5nKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGxpbmVzID0gc3RyLm1hdGNoKC9cXG4vZylcbiAgICAgIGlmIChsaW5lcykge1xuICAgICAgICBsaW5lICs9IGxpbmVzLmxlbmd0aFxuICAgICAgICBsYXN0ID0gc3RyLmxhc3RJbmRleE9mKCdcXG4nKVxuICAgICAgICBjb2x1bW4gPSBzdHIubGVuZ3RoIC0gbGFzdFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29sdW1uICs9IHN0ci5sZW5ndGhcbiAgICAgIH1cblxuICAgICAgaWYgKG5vZGUgJiYgdHlwZSAhPT0gJ3N0YXJ0Jykge1xuICAgICAgICBsZXQgcCA9IG5vZGUucGFyZW50IHx8IHsgcmF3czoge30gfVxuICAgICAgICBpZiAobm9kZS50eXBlICE9PSAnZGVjbCcgfHwgbm9kZSAhPT0gcC5sYXN0IHx8IHAucmF3cy5zZW1pY29sb24pIHtcbiAgICAgICAgICBpZiAobm9kZS5zb3VyY2UgJiYgbm9kZS5zb3VyY2UuZW5kKSB7XG4gICAgICAgICAgICBtYXBwaW5nLnNvdXJjZSA9IHRoaXMuc291cmNlUGF0aChub2RlKVxuICAgICAgICAgICAgbWFwcGluZy5vcmlnaW5hbC5saW5lID0gbm9kZS5zb3VyY2UuZW5kLmxpbmVcbiAgICAgICAgICAgIG1hcHBpbmcub3JpZ2luYWwuY29sdW1uID0gbm9kZS5zb3VyY2UuZW5kLmNvbHVtbiAtIDFcbiAgICAgICAgICAgIG1hcHBpbmcuZ2VuZXJhdGVkLmxpbmUgPSBsaW5lXG4gICAgICAgICAgICBtYXBwaW5nLmdlbmVyYXRlZC5jb2x1bW4gPSBjb2x1bW4gLSAyXG4gICAgICAgICAgICB0aGlzLm1hcC5hZGRNYXBwaW5nKG1hcHBpbmcpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1hcHBpbmcuc291cmNlID0gbm9Tb3VyY2VcbiAgICAgICAgICAgIG1hcHBpbmcub3JpZ2luYWwubGluZSA9IDFcbiAgICAgICAgICAgIG1hcHBpbmcub3JpZ2luYWwuY29sdW1uID0gMFxuICAgICAgICAgICAgbWFwcGluZy5nZW5lcmF0ZWQubGluZSA9IGxpbmVcbiAgICAgICAgICAgIG1hcHBpbmcuZ2VuZXJhdGVkLmNvbHVtbiA9IGNvbHVtbiAtIDFcbiAgICAgICAgICAgIHRoaXMubWFwLmFkZE1hcHBpbmcobWFwcGluZylcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgZ2VuZXJhdGUoKSB7XG4gICAgdGhpcy5jbGVhckFubm90YXRpb24oKVxuICAgIGlmIChwYXRoQXZhaWxhYmxlICYmIHNvdXJjZU1hcEF2YWlsYWJsZSAmJiB0aGlzLmlzTWFwKCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmdlbmVyYXRlTWFwKClcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHJlc3VsdCA9ICcnXG4gICAgICB0aGlzLnN0cmluZ2lmeSh0aGlzLnJvb3QsIGkgPT4ge1xuICAgICAgICByZXN1bHQgKz0gaVxuICAgICAgfSlcbiAgICAgIHJldHVybiBbcmVzdWx0XVxuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1hcEdlbmVyYXRvclxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBNYXBHZW5lcmF0b3IgPSByZXF1aXJlKCcuL21hcC1nZW5lcmF0b3InKVxubGV0IHN0cmluZ2lmeSA9IHJlcXVpcmUoJy4vc3RyaW5naWZ5JylcbmxldCB3YXJuT25jZSA9IHJlcXVpcmUoJy4vd2Fybi1vbmNlJylcbmxldCBwYXJzZSA9IHJlcXVpcmUoJy4vcGFyc2UnKVxuY29uc3QgUmVzdWx0ID0gcmVxdWlyZSgnLi9yZXN1bHQnKVxuXG5jbGFzcyBOb1dvcmtSZXN1bHQge1xuICBjb25zdHJ1Y3Rvcihwcm9jZXNzb3IsIGNzcywgb3B0cykge1xuICAgIGNzcyA9IGNzcy50b1N0cmluZygpXG4gICAgdGhpcy5zdHJpbmdpZmllZCA9IGZhbHNlXG5cbiAgICB0aGlzLl9wcm9jZXNzb3IgPSBwcm9jZXNzb3JcbiAgICB0aGlzLl9jc3MgPSBjc3NcbiAgICB0aGlzLl9vcHRzID0gb3B0c1xuICAgIHRoaXMuX21hcCA9IHVuZGVmaW5lZFxuICAgIGxldCByb290XG5cbiAgICBsZXQgc3RyID0gc3RyaW5naWZ5XG4gICAgdGhpcy5yZXN1bHQgPSBuZXcgUmVzdWx0KHRoaXMuX3Byb2Nlc3Nvciwgcm9vdCwgdGhpcy5fb3B0cylcbiAgICB0aGlzLnJlc3VsdC5jc3MgPSBjc3NcblxuICAgIGxldCBzZWxmID0gdGhpc1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLnJlc3VsdCwgJ3Jvb3QnLCB7XG4gICAgICBnZXQoKSB7XG4gICAgICAgIHJldHVybiBzZWxmLnJvb3RcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgbGV0IG1hcCA9IG5ldyBNYXBHZW5lcmF0b3Ioc3RyLCByb290LCB0aGlzLl9vcHRzLCBjc3MpXG4gICAgaWYgKG1hcC5pc01hcCgpKSB7XG4gICAgICBsZXQgW2dlbmVyYXRlZENTUywgZ2VuZXJhdGVkTWFwXSA9IG1hcC5nZW5lcmF0ZSgpXG4gICAgICBpZiAoZ2VuZXJhdGVkQ1NTKSB7XG4gICAgICAgIHRoaXMucmVzdWx0LmNzcyA9IGdlbmVyYXRlZENTU1xuICAgICAgfVxuICAgICAgaWYgKGdlbmVyYXRlZE1hcCkge1xuICAgICAgICB0aGlzLnJlc3VsdC5tYXAgPSBnZW5lcmF0ZWRNYXBcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnZXQgW1N5bWJvbC50b1N0cmluZ1RhZ10oKSB7XG4gICAgcmV0dXJuICdOb1dvcmtSZXN1bHQnXG4gIH1cblxuICBnZXQgcHJvY2Vzc29yKCkge1xuICAgIHJldHVybiB0aGlzLnJlc3VsdC5wcm9jZXNzb3JcbiAgfVxuXG4gIGdldCBvcHRzKCkge1xuICAgIHJldHVybiB0aGlzLnJlc3VsdC5vcHRzXG4gIH1cblxuICBnZXQgY3NzKCkge1xuICAgIHJldHVybiB0aGlzLnJlc3VsdC5jc3NcbiAgfVxuXG4gIGdldCBjb250ZW50KCkge1xuICAgIHJldHVybiB0aGlzLnJlc3VsdC5jc3NcbiAgfVxuXG4gIGdldCBtYXAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVzdWx0Lm1hcFxuICB9XG5cbiAgZ2V0IHJvb3QoKSB7XG4gICAgaWYgKHRoaXMuX3Jvb3QpIHtcbiAgICAgIHJldHVybiB0aGlzLl9yb290XG4gICAgfVxuXG4gICAgbGV0IHJvb3RcbiAgICBsZXQgcGFyc2VyID0gcGFyc2VcblxuICAgIHRyeSB7XG4gICAgICByb290ID0gcGFyc2VyKHRoaXMuX2NzcywgdGhpcy5fb3B0cylcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdGhpcy5lcnJvciA9IGVycm9yXG4gICAgfVxuXG4gICAgdGhpcy5fcm9vdCA9IHJvb3RcblxuICAgIHJldHVybiByb290XG4gIH1cblxuICBnZXQgbWVzc2FnZXMoKSB7XG4gICAgcmV0dXJuIFtdXG4gIH1cblxuICB3YXJuaW5ncygpIHtcbiAgICByZXR1cm4gW11cbiAgfVxuXG4gIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiB0aGlzLl9jc3NcbiAgfVxuXG4gIHRoZW4ob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQpIHtcbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgaWYgKCEoJ2Zyb20nIGluIHRoaXMuX29wdHMpKSB7XG4gICAgICAgIHdhcm5PbmNlKFxuICAgICAgICAgICdXaXRob3V0IGBmcm9tYCBvcHRpb24gUG9zdENTUyBjb3VsZCBnZW5lcmF0ZSB3cm9uZyBzb3VyY2UgbWFwICcgK1xuICAgICAgICAgICAgJ2FuZCB3aWxsIG5vdCBmaW5kIEJyb3dzZXJzbGlzdCBjb25maWcuIFNldCBpdCB0byBDU1MgZmlsZSBwYXRoICcgK1xuICAgICAgICAgICAgJ29yIHRvIGB1bmRlZmluZWRgIHRvIHByZXZlbnQgdGhpcyB3YXJuaW5nLidcbiAgICAgICAgKVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmFzeW5jKCkudGhlbihvbkZ1bGZpbGxlZCwgb25SZWplY3RlZClcbiAgfVxuXG4gIGNhdGNoKG9uUmVqZWN0ZWQpIHtcbiAgICByZXR1cm4gdGhpcy5hc3luYygpLmNhdGNoKG9uUmVqZWN0ZWQpXG4gIH1cblxuICBmaW5hbGx5KG9uRmluYWxseSkge1xuICAgIHJldHVybiB0aGlzLmFzeW5jKCkudGhlbihvbkZpbmFsbHksIG9uRmluYWxseSlcbiAgfVxuXG4gIGFzeW5jKCkge1xuICAgIGlmICh0aGlzLmVycm9yKSByZXR1cm4gUHJvbWlzZS5yZWplY3QodGhpcy5lcnJvcilcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMucmVzdWx0KVxuICB9XG5cbiAgc3luYygpIHtcbiAgICBpZiAodGhpcy5lcnJvcikgdGhyb3cgdGhpcy5lcnJvclxuICAgIHJldHVybiB0aGlzLnJlc3VsdFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTm9Xb3JrUmVzdWx0XG5Ob1dvcmtSZXN1bHQuZGVmYXVsdCA9IE5vV29ya1Jlc3VsdFxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCB7IGlzQ2xlYW4sIG15IH0gPSByZXF1aXJlKCcuL3N5bWJvbHMnKVxubGV0IENzc1N5bnRheEVycm9yID0gcmVxdWlyZSgnLi9jc3Mtc3ludGF4LWVycm9yJylcbmxldCBTdHJpbmdpZmllciA9IHJlcXVpcmUoJy4vc3RyaW5naWZpZXInKVxubGV0IHN0cmluZ2lmeSA9IHJlcXVpcmUoJy4vc3RyaW5naWZ5JylcblxuZnVuY3Rpb24gY2xvbmVOb2RlKG9iaiwgcGFyZW50KSB7XG4gIGxldCBjbG9uZWQgPSBuZXcgb2JqLmNvbnN0cnVjdG9yKClcblxuICBmb3IgKGxldCBpIGluIG9iaikge1xuICAgIGlmICghT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgaSkpIHtcbiAgICAgIC8qIGM4IGlnbm9yZSBuZXh0IDIgKi9cbiAgICAgIGNvbnRpbnVlXG4gICAgfVxuICAgIGlmIChpID09PSAncHJveHlDYWNoZScpIGNvbnRpbnVlXG4gICAgbGV0IHZhbHVlID0gb2JqW2ldXG4gICAgbGV0IHR5cGUgPSB0eXBlb2YgdmFsdWVcblxuICAgIGlmIChpID09PSAncGFyZW50JyAmJiB0eXBlID09PSAnb2JqZWN0Jykge1xuICAgICAgaWYgKHBhcmVudCkgY2xvbmVkW2ldID0gcGFyZW50XG4gICAgfSBlbHNlIGlmIChpID09PSAnc291cmNlJykge1xuICAgICAgY2xvbmVkW2ldID0gdmFsdWVcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICBjbG9uZWRbaV0gPSB2YWx1ZS5tYXAoaiA9PiBjbG9uZU5vZGUoaiwgY2xvbmVkKSlcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHR5cGUgPT09ICdvYmplY3QnICYmIHZhbHVlICE9PSBudWxsKSB2YWx1ZSA9IGNsb25lTm9kZSh2YWx1ZSlcbiAgICAgIGNsb25lZFtpXSA9IHZhbHVlXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGNsb25lZFxufVxuXG5jbGFzcyBOb2RlIHtcbiAgY29uc3RydWN0b3IoZGVmYXVsdHMgPSB7fSkge1xuICAgIHRoaXMucmF3cyA9IHt9XG4gICAgdGhpc1tpc0NsZWFuXSA9IGZhbHNlXG4gICAgdGhpc1tteV0gPSB0cnVlXG5cbiAgICBmb3IgKGxldCBuYW1lIGluIGRlZmF1bHRzKSB7XG4gICAgICBpZiAobmFtZSA9PT0gJ25vZGVzJykge1xuICAgICAgICB0aGlzLm5vZGVzID0gW11cbiAgICAgICAgZm9yIChsZXQgbm9kZSBvZiBkZWZhdWx0c1tuYW1lXSkge1xuICAgICAgICAgIGlmICh0eXBlb2Ygbm9kZS5jbG9uZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgdGhpcy5hcHBlbmQobm9kZS5jbG9uZSgpKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmFwcGVuZChub2RlKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpc1tuYW1lXSA9IGRlZmF1bHRzW25hbWVdXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZXJyb3IobWVzc2FnZSwgb3B0cyA9IHt9KSB7XG4gICAgaWYgKHRoaXMuc291cmNlKSB7XG4gICAgICBsZXQgeyBzdGFydCwgZW5kIH0gPSB0aGlzLnJhbmdlQnkob3B0cylcbiAgICAgIHJldHVybiB0aGlzLnNvdXJjZS5pbnB1dC5lcnJvcihcbiAgICAgICAgbWVzc2FnZSxcbiAgICAgICAgeyBsaW5lOiBzdGFydC5saW5lLCBjb2x1bW46IHN0YXJ0LmNvbHVtbiB9LFxuICAgICAgICB7IGxpbmU6IGVuZC5saW5lLCBjb2x1bW46IGVuZC5jb2x1bW4gfSxcbiAgICAgICAgb3B0c1xuICAgICAgKVxuICAgIH1cbiAgICByZXR1cm4gbmV3IENzc1N5bnRheEVycm9yKG1lc3NhZ2UpXG4gIH1cblxuICB3YXJuKHJlc3VsdCwgdGV4dCwgb3B0cykge1xuICAgIGxldCBkYXRhID0geyBub2RlOiB0aGlzIH1cbiAgICBmb3IgKGxldCBpIGluIG9wdHMpIGRhdGFbaV0gPSBvcHRzW2ldXG4gICAgcmV0dXJuIHJlc3VsdC53YXJuKHRleHQsIGRhdGEpXG4gIH1cblxuICByZW1vdmUoKSB7XG4gICAgaWYgKHRoaXMucGFyZW50KSB7XG4gICAgICB0aGlzLnBhcmVudC5yZW1vdmVDaGlsZCh0aGlzKVxuICAgIH1cbiAgICB0aGlzLnBhcmVudCA9IHVuZGVmaW5lZFxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICB0b1N0cmluZyhzdHJpbmdpZmllciA9IHN0cmluZ2lmeSkge1xuICAgIGlmIChzdHJpbmdpZmllci5zdHJpbmdpZnkpIHN0cmluZ2lmaWVyID0gc3RyaW5naWZpZXIuc3RyaW5naWZ5XG4gICAgbGV0IHJlc3VsdCA9ICcnXG4gICAgc3RyaW5naWZpZXIodGhpcywgaSA9PiB7XG4gICAgICByZXN1bHQgKz0gaVxuICAgIH0pXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgYXNzaWduKG92ZXJyaWRlcyA9IHt9KSB7XG4gICAgZm9yIChsZXQgbmFtZSBpbiBvdmVycmlkZXMpIHtcbiAgICAgIHRoaXNbbmFtZV0gPSBvdmVycmlkZXNbbmFtZV1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGNsb25lKG92ZXJyaWRlcyA9IHt9KSB7XG4gICAgbGV0IGNsb25lZCA9IGNsb25lTm9kZSh0aGlzKVxuICAgIGZvciAobGV0IG5hbWUgaW4gb3ZlcnJpZGVzKSB7XG4gICAgICBjbG9uZWRbbmFtZV0gPSBvdmVycmlkZXNbbmFtZV1cbiAgICB9XG4gICAgcmV0dXJuIGNsb25lZFxuICB9XG5cbiAgY2xvbmVCZWZvcmUob3ZlcnJpZGVzID0ge30pIHtcbiAgICBsZXQgY2xvbmVkID0gdGhpcy5jbG9uZShvdmVycmlkZXMpXG4gICAgdGhpcy5wYXJlbnQuaW5zZXJ0QmVmb3JlKHRoaXMsIGNsb25lZClcbiAgICByZXR1cm4gY2xvbmVkXG4gIH1cblxuICBjbG9uZUFmdGVyKG92ZXJyaWRlcyA9IHt9KSB7XG4gICAgbGV0IGNsb25lZCA9IHRoaXMuY2xvbmUob3ZlcnJpZGVzKVxuICAgIHRoaXMucGFyZW50Lmluc2VydEFmdGVyKHRoaXMsIGNsb25lZClcbiAgICByZXR1cm4gY2xvbmVkXG4gIH1cblxuICByZXBsYWNlV2l0aCguLi5ub2Rlcykge1xuICAgIGlmICh0aGlzLnBhcmVudCkge1xuICAgICAgbGV0IGJvb2ttYXJrID0gdGhpc1xuICAgICAgbGV0IGZvdW5kU2VsZiA9IGZhbHNlXG4gICAgICBmb3IgKGxldCBub2RlIG9mIG5vZGVzKSB7XG4gICAgICAgIGlmIChub2RlID09PSB0aGlzKSB7XG4gICAgICAgICAgZm91bmRTZWxmID0gdHJ1ZVxuICAgICAgICB9IGVsc2UgaWYgKGZvdW5kU2VsZikge1xuICAgICAgICAgIHRoaXMucGFyZW50Lmluc2VydEFmdGVyKGJvb2ttYXJrLCBub2RlKVxuICAgICAgICAgIGJvb2ttYXJrID0gbm9kZVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMucGFyZW50Lmluc2VydEJlZm9yZShib29rbWFyaywgbm9kZSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoIWZvdW5kU2VsZikge1xuICAgICAgICB0aGlzLnJlbW92ZSgpXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIG5leHQoKSB7XG4gICAgaWYgKCF0aGlzLnBhcmVudCkgcmV0dXJuIHVuZGVmaW5lZFxuICAgIGxldCBpbmRleCA9IHRoaXMucGFyZW50LmluZGV4KHRoaXMpXG4gICAgcmV0dXJuIHRoaXMucGFyZW50Lm5vZGVzW2luZGV4ICsgMV1cbiAgfVxuXG4gIHByZXYoKSB7XG4gICAgaWYgKCF0aGlzLnBhcmVudCkgcmV0dXJuIHVuZGVmaW5lZFxuICAgIGxldCBpbmRleCA9IHRoaXMucGFyZW50LmluZGV4KHRoaXMpXG4gICAgcmV0dXJuIHRoaXMucGFyZW50Lm5vZGVzW2luZGV4IC0gMV1cbiAgfVxuXG4gIGJlZm9yZShhZGQpIHtcbiAgICB0aGlzLnBhcmVudC5pbnNlcnRCZWZvcmUodGhpcywgYWRkKVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBhZnRlcihhZGQpIHtcbiAgICB0aGlzLnBhcmVudC5pbnNlcnRBZnRlcih0aGlzLCBhZGQpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHJvb3QoKSB7XG4gICAgbGV0IHJlc3VsdCA9IHRoaXNcbiAgICB3aGlsZSAocmVzdWx0LnBhcmVudCAmJiByZXN1bHQucGFyZW50LnR5cGUgIT09ICdkb2N1bWVudCcpIHtcbiAgICAgIHJlc3VsdCA9IHJlc3VsdC5wYXJlbnRcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgcmF3KHByb3AsIGRlZmF1bHRUeXBlKSB7XG4gICAgbGV0IHN0ciA9IG5ldyBTdHJpbmdpZmllcigpXG4gICAgcmV0dXJuIHN0ci5yYXcodGhpcywgcHJvcCwgZGVmYXVsdFR5cGUpXG4gIH1cblxuICBjbGVhblJhd3Moa2VlcEJldHdlZW4pIHtcbiAgICBkZWxldGUgdGhpcy5yYXdzLmJlZm9yZVxuICAgIGRlbGV0ZSB0aGlzLnJhd3MuYWZ0ZXJcbiAgICBpZiAoIWtlZXBCZXR3ZWVuKSBkZWxldGUgdGhpcy5yYXdzLmJldHdlZW5cbiAgfVxuXG4gIHRvSlNPTihfLCBpbnB1dHMpIHtcbiAgICBsZXQgZml4ZWQgPSB7fVxuICAgIGxldCBlbWl0SW5wdXRzID0gaW5wdXRzID09IG51bGxcbiAgICBpbnB1dHMgPSBpbnB1dHMgfHwgbmV3IE1hcCgpXG4gICAgbGV0IGlucHV0c05leHRJbmRleCA9IDBcblxuICAgIGZvciAobGV0IG5hbWUgaW4gdGhpcykge1xuICAgICAgaWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcywgbmFtZSkpIHtcbiAgICAgICAgLyogYzggaWdub3JlIG5leHQgMiAqL1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuICAgICAgaWYgKG5hbWUgPT09ICdwYXJlbnQnIHx8IG5hbWUgPT09ICdwcm94eUNhY2hlJykgY29udGludWVcbiAgICAgIGxldCB2YWx1ZSA9IHRoaXNbbmFtZV1cblxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgIGZpeGVkW25hbWVdID0gdmFsdWUubWFwKGkgPT4ge1xuICAgICAgICAgIGlmICh0eXBlb2YgaSA9PT0gJ29iamVjdCcgJiYgaS50b0pTT04pIHtcbiAgICAgICAgICAgIHJldHVybiBpLnRvSlNPTihudWxsLCBpbnB1dHMpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBpXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlLnRvSlNPTikge1xuICAgICAgICBmaXhlZFtuYW1lXSA9IHZhbHVlLnRvSlNPTihudWxsLCBpbnB1dHMpXG4gICAgICB9IGVsc2UgaWYgKG5hbWUgPT09ICdzb3VyY2UnKSB7XG4gICAgICAgIGxldCBpbnB1dElkID0gaW5wdXRzLmdldCh2YWx1ZS5pbnB1dClcbiAgICAgICAgaWYgKGlucHV0SWQgPT0gbnVsbCkge1xuICAgICAgICAgIGlucHV0SWQgPSBpbnB1dHNOZXh0SW5kZXhcbiAgICAgICAgICBpbnB1dHMuc2V0KHZhbHVlLmlucHV0LCBpbnB1dHNOZXh0SW5kZXgpXG4gICAgICAgICAgaW5wdXRzTmV4dEluZGV4KytcbiAgICAgICAgfVxuICAgICAgICBmaXhlZFtuYW1lXSA9IHtcbiAgICAgICAgICBpbnB1dElkLFxuICAgICAgICAgIHN0YXJ0OiB2YWx1ZS5zdGFydCxcbiAgICAgICAgICBlbmQ6IHZhbHVlLmVuZFxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmaXhlZFtuYW1lXSA9IHZhbHVlXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGVtaXRJbnB1dHMpIHtcbiAgICAgIGZpeGVkLmlucHV0cyA9IFsuLi5pbnB1dHMua2V5cygpXS5tYXAoaW5wdXQgPT4gaW5wdXQudG9KU09OKCkpXG4gICAgfVxuXG4gICAgcmV0dXJuIGZpeGVkXG4gIH1cblxuICBwb3NpdGlvbkluc2lkZShpbmRleCkge1xuICAgIGxldCBzdHJpbmcgPSB0aGlzLnRvU3RyaW5nKClcbiAgICBsZXQgY29sdW1uID0gdGhpcy5zb3VyY2Uuc3RhcnQuY29sdW1uXG4gICAgbGV0IGxpbmUgPSB0aGlzLnNvdXJjZS5zdGFydC5saW5lXG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGluZGV4OyBpKyspIHtcbiAgICAgIGlmIChzdHJpbmdbaV0gPT09ICdcXG4nKSB7XG4gICAgICAgIGNvbHVtbiA9IDFcbiAgICAgICAgbGluZSArPSAxXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb2x1bW4gKz0gMVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7IGxpbmUsIGNvbHVtbiB9XG4gIH1cblxuICBwb3NpdGlvbkJ5KG9wdHMpIHtcbiAgICBsZXQgcG9zID0gdGhpcy5zb3VyY2Uuc3RhcnRcbiAgICBpZiAob3B0cy5pbmRleCkge1xuICAgICAgcG9zID0gdGhpcy5wb3NpdGlvbkluc2lkZShvcHRzLmluZGV4KVxuICAgIH0gZWxzZSBpZiAob3B0cy53b3JkKSB7XG4gICAgICBsZXQgaW5kZXggPSB0aGlzLnRvU3RyaW5nKCkuaW5kZXhPZihvcHRzLndvcmQpXG4gICAgICBpZiAoaW5kZXggIT09IC0xKSBwb3MgPSB0aGlzLnBvc2l0aW9uSW5zaWRlKGluZGV4KVxuICAgIH1cbiAgICByZXR1cm4gcG9zXG4gIH1cblxuICByYW5nZUJ5KG9wdHMpIHtcbiAgICBsZXQgc3RhcnQgPSB7XG4gICAgICBsaW5lOiB0aGlzLnNvdXJjZS5zdGFydC5saW5lLFxuICAgICAgY29sdW1uOiB0aGlzLnNvdXJjZS5zdGFydC5jb2x1bW5cbiAgICB9XG4gICAgbGV0IGVuZCA9IHRoaXMuc291cmNlLmVuZFxuICAgICAgPyB7XG4gICAgICAgICAgbGluZTogdGhpcy5zb3VyY2UuZW5kLmxpbmUsXG4gICAgICAgICAgY29sdW1uOiB0aGlzLnNvdXJjZS5lbmQuY29sdW1uICsgMVxuICAgICAgICB9XG4gICAgICA6IHtcbiAgICAgICAgICBsaW5lOiBzdGFydC5saW5lLFxuICAgICAgICAgIGNvbHVtbjogc3RhcnQuY29sdW1uICsgMVxuICAgICAgICB9XG5cbiAgICBpZiAob3B0cy53b3JkKSB7XG4gICAgICBsZXQgaW5kZXggPSB0aGlzLnRvU3RyaW5nKCkuaW5kZXhPZihvcHRzLndvcmQpXG4gICAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgIHN0YXJ0ID0gdGhpcy5wb3NpdGlvbkluc2lkZShpbmRleClcbiAgICAgICAgZW5kID0gdGhpcy5wb3NpdGlvbkluc2lkZShpbmRleCArIG9wdHMud29yZC5sZW5ndGgpXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChvcHRzLnN0YXJ0KSB7XG4gICAgICAgIHN0YXJ0ID0ge1xuICAgICAgICAgIGxpbmU6IG9wdHMuc3RhcnQubGluZSxcbiAgICAgICAgICBjb2x1bW46IG9wdHMuc3RhcnQuY29sdW1uXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAob3B0cy5pbmRleCkge1xuICAgICAgICBzdGFydCA9IHRoaXMucG9zaXRpb25JbnNpZGUob3B0cy5pbmRleClcbiAgICAgIH1cblxuICAgICAgaWYgKG9wdHMuZW5kKSB7XG4gICAgICAgIGVuZCA9IHtcbiAgICAgICAgICBsaW5lOiBvcHRzLmVuZC5saW5lLFxuICAgICAgICAgIGNvbHVtbjogb3B0cy5lbmQuY29sdW1uXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAob3B0cy5lbmRJbmRleCkge1xuICAgICAgICBlbmQgPSB0aGlzLnBvc2l0aW9uSW5zaWRlKG9wdHMuZW5kSW5kZXgpXG4gICAgICB9IGVsc2UgaWYgKG9wdHMuaW5kZXgpIHtcbiAgICAgICAgZW5kID0gdGhpcy5wb3NpdGlvbkluc2lkZShvcHRzLmluZGV4ICsgMSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICBlbmQubGluZSA8IHN0YXJ0LmxpbmUgfHxcbiAgICAgIChlbmQubGluZSA9PT0gc3RhcnQubGluZSAmJiBlbmQuY29sdW1uIDw9IHN0YXJ0LmNvbHVtbilcbiAgICApIHtcbiAgICAgIGVuZCA9IHsgbGluZTogc3RhcnQubGluZSwgY29sdW1uOiBzdGFydC5jb2x1bW4gKyAxIH1cbiAgICB9XG5cbiAgICByZXR1cm4geyBzdGFydCwgZW5kIH1cbiAgfVxuXG4gIGdldFByb3h5UHJvY2Vzc29yKCkge1xuICAgIHJldHVybiB7XG4gICAgICBzZXQobm9kZSwgcHJvcCwgdmFsdWUpIHtcbiAgICAgICAgaWYgKG5vZGVbcHJvcF0gPT09IHZhbHVlKSByZXR1cm4gdHJ1ZVxuICAgICAgICBub2RlW3Byb3BdID0gdmFsdWVcbiAgICAgICAgaWYgKFxuICAgICAgICAgIHByb3AgPT09ICdwcm9wJyB8fFxuICAgICAgICAgIHByb3AgPT09ICd2YWx1ZScgfHxcbiAgICAgICAgICBwcm9wID09PSAnbmFtZScgfHxcbiAgICAgICAgICBwcm9wID09PSAncGFyYW1zJyB8fFxuICAgICAgICAgIHByb3AgPT09ICdpbXBvcnRhbnQnIHx8XG4gICAgICAgICAgLyogYzggaWdub3JlIG5leHQgKi9cbiAgICAgICAgICBwcm9wID09PSAndGV4dCdcbiAgICAgICAgKSB7XG4gICAgICAgICAgbm9kZS5tYXJrRGlydHkoKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9LFxuXG4gICAgICBnZXQobm9kZSwgcHJvcCkge1xuICAgICAgICBpZiAocHJvcCA9PT0gJ3Byb3h5T2YnKSB7XG4gICAgICAgICAgcmV0dXJuIG5vZGVcbiAgICAgICAgfSBlbHNlIGlmIChwcm9wID09PSAncm9vdCcpIHtcbiAgICAgICAgICByZXR1cm4gKCkgPT4gbm9kZS5yb290KCkudG9Qcm94eSgpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIG5vZGVbcHJvcF1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHRvUHJveHkoKSB7XG4gICAgaWYgKCF0aGlzLnByb3h5Q2FjaGUpIHtcbiAgICAgIHRoaXMucHJveHlDYWNoZSA9IG5ldyBQcm94eSh0aGlzLCB0aGlzLmdldFByb3h5UHJvY2Vzc29yKCkpXG4gICAgfVxuICAgIHJldHVybiB0aGlzLnByb3h5Q2FjaGVcbiAgfVxuXG4gIGFkZFRvRXJyb3IoZXJyb3IpIHtcbiAgICBlcnJvci5wb3N0Y3NzTm9kZSA9IHRoaXNcbiAgICBpZiAoZXJyb3Iuc3RhY2sgJiYgdGhpcy5zb3VyY2UgJiYgL1xcblxcc3s0fWF0IC8udGVzdChlcnJvci5zdGFjaykpIHtcbiAgICAgIGxldCBzID0gdGhpcy5zb3VyY2VcbiAgICAgIGVycm9yLnN0YWNrID0gZXJyb3Iuc3RhY2sucmVwbGFjZShcbiAgICAgICAgL1xcblxcc3s0fWF0IC8sXG4gICAgICAgIGAkJiR7cy5pbnB1dC5mcm9tfToke3Muc3RhcnQubGluZX06JHtzLnN0YXJ0LmNvbHVtbn0kJmBcbiAgICAgIClcbiAgICB9XG4gICAgcmV0dXJuIGVycm9yXG4gIH1cblxuICBtYXJrRGlydHkoKSB7XG4gICAgaWYgKHRoaXNbaXNDbGVhbl0pIHtcbiAgICAgIHRoaXNbaXNDbGVhbl0gPSBmYWxzZVxuICAgICAgbGV0IG5leHQgPSB0aGlzXG4gICAgICB3aGlsZSAoKG5leHQgPSBuZXh0LnBhcmVudCkpIHtcbiAgICAgICAgbmV4dFtpc0NsZWFuXSA9IGZhbHNlXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZ2V0IHByb3h5T2YoKSB7XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE5vZGVcbk5vZGUuZGVmYXVsdCA9IE5vZGVcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgQ29udGFpbmVyID0gcmVxdWlyZSgnLi9jb250YWluZXInKVxubGV0IFBhcnNlciA9IHJlcXVpcmUoJy4vcGFyc2VyJylcbmxldCBJbnB1dCA9IHJlcXVpcmUoJy4vaW5wdXQnKVxuXG5mdW5jdGlvbiBwYXJzZShjc3MsIG9wdHMpIHtcbiAgbGV0IGlucHV0ID0gbmV3IElucHV0KGNzcywgb3B0cylcbiAgbGV0IHBhcnNlciA9IG5ldyBQYXJzZXIoaW5wdXQpXG4gIHRyeSB7XG4gICAgcGFyc2VyLnBhcnNlKClcbiAgfSBjYXRjaCAoZSkge1xuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICBpZiAoZS5uYW1lID09PSAnQ3NzU3ludGF4RXJyb3InICYmIG9wdHMgJiYgb3B0cy5mcm9tKSB7XG4gICAgICAgIGlmICgvXFwuc2NzcyQvaS50ZXN0KG9wdHMuZnJvbSkpIHtcbiAgICAgICAgICBlLm1lc3NhZ2UgKz1cbiAgICAgICAgICAgICdcXG5Zb3UgdHJpZWQgdG8gcGFyc2UgU0NTUyB3aXRoICcgK1xuICAgICAgICAgICAgJ3RoZSBzdGFuZGFyZCBDU1MgcGFyc2VyOyAnICtcbiAgICAgICAgICAgICd0cnkgYWdhaW4gd2l0aCB0aGUgcG9zdGNzcy1zY3NzIHBhcnNlcidcbiAgICAgICAgfSBlbHNlIGlmICgvXFwuc2Fzcy9pLnRlc3Qob3B0cy5mcm9tKSkge1xuICAgICAgICAgIGUubWVzc2FnZSArPVxuICAgICAgICAgICAgJ1xcbllvdSB0cmllZCB0byBwYXJzZSBTYXNzIHdpdGggJyArXG4gICAgICAgICAgICAndGhlIHN0YW5kYXJkIENTUyBwYXJzZXI7ICcgK1xuICAgICAgICAgICAgJ3RyeSBhZ2FpbiB3aXRoIHRoZSBwb3N0Y3NzLXNhc3MgcGFyc2VyJ1xuICAgICAgICB9IGVsc2UgaWYgKC9cXC5sZXNzJC9pLnRlc3Qob3B0cy5mcm9tKSkge1xuICAgICAgICAgIGUubWVzc2FnZSArPVxuICAgICAgICAgICAgJ1xcbllvdSB0cmllZCB0byBwYXJzZSBMZXNzIHdpdGggJyArXG4gICAgICAgICAgICAndGhlIHN0YW5kYXJkIENTUyBwYXJzZXI7ICcgK1xuICAgICAgICAgICAgJ3RyeSBhZ2FpbiB3aXRoIHRoZSBwb3N0Y3NzLWxlc3MgcGFyc2VyJ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHRocm93IGVcbiAgfVxuXG4gIHJldHVybiBwYXJzZXIucm9vdFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHBhcnNlXG5wYXJzZS5kZWZhdWx0ID0gcGFyc2VcblxuQ29udGFpbmVyLnJlZ2lzdGVyUGFyc2UocGFyc2UpXG4iLCIndXNlIHN0cmljdCdcblxubGV0IERlY2xhcmF0aW9uID0gcmVxdWlyZSgnLi9kZWNsYXJhdGlvbicpXG5sZXQgdG9rZW5pemVyID0gcmVxdWlyZSgnLi90b2tlbml6ZScpXG5sZXQgQ29tbWVudCA9IHJlcXVpcmUoJy4vY29tbWVudCcpXG5sZXQgQXRSdWxlID0gcmVxdWlyZSgnLi9hdC1ydWxlJylcbmxldCBSb290ID0gcmVxdWlyZSgnLi9yb290JylcbmxldCBSdWxlID0gcmVxdWlyZSgnLi9ydWxlJylcblxuY2xhc3MgUGFyc2VyIHtcbiAgY29uc3RydWN0b3IoaW5wdXQpIHtcbiAgICB0aGlzLmlucHV0ID0gaW5wdXRcblxuICAgIHRoaXMucm9vdCA9IG5ldyBSb290KClcbiAgICB0aGlzLmN1cnJlbnQgPSB0aGlzLnJvb3RcbiAgICB0aGlzLnNwYWNlcyA9ICcnXG4gICAgdGhpcy5zZW1pY29sb24gPSBmYWxzZVxuICAgIHRoaXMuY3VzdG9tUHJvcGVydHkgPSBmYWxzZVxuXG4gICAgdGhpcy5jcmVhdGVUb2tlbml6ZXIoKVxuICAgIHRoaXMucm9vdC5zb3VyY2UgPSB7IGlucHV0LCBzdGFydDogeyBvZmZzZXQ6IDAsIGxpbmU6IDEsIGNvbHVtbjogMSB9IH1cbiAgfVxuXG4gIGNyZWF0ZVRva2VuaXplcigpIHtcbiAgICB0aGlzLnRva2VuaXplciA9IHRva2VuaXplcih0aGlzLmlucHV0KVxuICB9XG5cbiAgcGFyc2UoKSB7XG4gICAgbGV0IHRva2VuXG4gICAgd2hpbGUgKCF0aGlzLnRva2VuaXplci5lbmRPZkZpbGUoKSkge1xuICAgICAgdG9rZW4gPSB0aGlzLnRva2VuaXplci5uZXh0VG9rZW4oKVxuXG4gICAgICBzd2l0Y2ggKHRva2VuWzBdKSB7XG4gICAgICAgIGNhc2UgJ3NwYWNlJzpcbiAgICAgICAgICB0aGlzLnNwYWNlcyArPSB0b2tlblsxXVxuICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgY2FzZSAnOyc6XG4gICAgICAgICAgdGhpcy5mcmVlU2VtaWNvbG9uKHRva2VuKVxuICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgY2FzZSAnfSc6XG4gICAgICAgICAgdGhpcy5lbmQodG9rZW4pXG4gICAgICAgICAgYnJlYWtcblxuICAgICAgICBjYXNlICdjb21tZW50JzpcbiAgICAgICAgICB0aGlzLmNvbW1lbnQodG9rZW4pXG4gICAgICAgICAgYnJlYWtcblxuICAgICAgICBjYXNlICdhdC13b3JkJzpcbiAgICAgICAgICB0aGlzLmF0cnVsZSh0b2tlbilcbiAgICAgICAgICBicmVha1xuXG4gICAgICAgIGNhc2UgJ3snOlxuICAgICAgICAgIHRoaXMuZW1wdHlSdWxlKHRva2VuKVxuICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICB0aGlzLm90aGVyKHRva2VuKVxuICAgICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuZW5kRmlsZSgpXG4gIH1cblxuICBjb21tZW50KHRva2VuKSB7XG4gICAgbGV0IG5vZGUgPSBuZXcgQ29tbWVudCgpXG4gICAgdGhpcy5pbml0KG5vZGUsIHRva2VuWzJdKVxuICAgIG5vZGUuc291cmNlLmVuZCA9IHRoaXMuZ2V0UG9zaXRpb24odG9rZW5bM10gfHwgdG9rZW5bMl0pXG5cbiAgICBsZXQgdGV4dCA9IHRva2VuWzFdLnNsaWNlKDIsIC0yKVxuICAgIGlmICgvXlxccyokLy50ZXN0KHRleHQpKSB7XG4gICAgICBub2RlLnRleHQgPSAnJ1xuICAgICAgbm9kZS5yYXdzLmxlZnQgPSB0ZXh0XG4gICAgICBub2RlLnJhd3MucmlnaHQgPSAnJ1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgbWF0Y2ggPSB0ZXh0Lm1hdGNoKC9eKFxccyopKFteXSpcXFMpKFxccyopJC8pXG4gICAgICBub2RlLnRleHQgPSBtYXRjaFsyXVxuICAgICAgbm9kZS5yYXdzLmxlZnQgPSBtYXRjaFsxXVxuICAgICAgbm9kZS5yYXdzLnJpZ2h0ID0gbWF0Y2hbM11cbiAgICB9XG4gIH1cblxuICBlbXB0eVJ1bGUodG9rZW4pIHtcbiAgICBsZXQgbm9kZSA9IG5ldyBSdWxlKClcbiAgICB0aGlzLmluaXQobm9kZSwgdG9rZW5bMl0pXG4gICAgbm9kZS5zZWxlY3RvciA9ICcnXG4gICAgbm9kZS5yYXdzLmJldHdlZW4gPSAnJ1xuICAgIHRoaXMuY3VycmVudCA9IG5vZGVcbiAgfVxuXG4gIG90aGVyKHN0YXJ0KSB7XG4gICAgbGV0IGVuZCA9IGZhbHNlXG4gICAgbGV0IHR5cGUgPSBudWxsXG4gICAgbGV0IGNvbG9uID0gZmFsc2VcbiAgICBsZXQgYnJhY2tldCA9IG51bGxcbiAgICBsZXQgYnJhY2tldHMgPSBbXVxuICAgIGxldCBjdXN0b21Qcm9wZXJ0eSA9IHN0YXJ0WzFdLnN0YXJ0c1dpdGgoJy0tJylcblxuICAgIGxldCB0b2tlbnMgPSBbXVxuICAgIGxldCB0b2tlbiA9IHN0YXJ0XG4gICAgd2hpbGUgKHRva2VuKSB7XG4gICAgICB0eXBlID0gdG9rZW5bMF1cbiAgICAgIHRva2Vucy5wdXNoKHRva2VuKVxuXG4gICAgICBpZiAodHlwZSA9PT0gJygnIHx8IHR5cGUgPT09ICdbJykge1xuICAgICAgICBpZiAoIWJyYWNrZXQpIGJyYWNrZXQgPSB0b2tlblxuICAgICAgICBicmFja2V0cy5wdXNoKHR5cGUgPT09ICcoJyA/ICcpJyA6ICddJylcbiAgICAgIH0gZWxzZSBpZiAoY3VzdG9tUHJvcGVydHkgJiYgY29sb24gJiYgdHlwZSA9PT0gJ3snKSB7XG4gICAgICAgIGlmICghYnJhY2tldCkgYnJhY2tldCA9IHRva2VuXG4gICAgICAgIGJyYWNrZXRzLnB1c2goJ30nKVxuICAgICAgfSBlbHNlIGlmIChicmFja2V0cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgaWYgKHR5cGUgPT09ICc7Jykge1xuICAgICAgICAgIGlmIChjb2xvbikge1xuICAgICAgICAgICAgdGhpcy5kZWNsKHRva2VucywgY3VzdG9tUHJvcGVydHkpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ3snKSB7XG4gICAgICAgICAgdGhpcy5ydWxlKHRva2VucylcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnfScpIHtcbiAgICAgICAgICB0aGlzLnRva2VuaXplci5iYWNrKHRva2Vucy5wb3AoKSlcbiAgICAgICAgICBlbmQgPSB0cnVlXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnOicpIHtcbiAgICAgICAgICBjb2xvbiA9IHRydWVcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh0eXBlID09PSBicmFja2V0c1ticmFja2V0cy5sZW5ndGggLSAxXSkge1xuICAgICAgICBicmFja2V0cy5wb3AoKVxuICAgICAgICBpZiAoYnJhY2tldHMubGVuZ3RoID09PSAwKSBicmFja2V0ID0gbnVsbFxuICAgICAgfVxuXG4gICAgICB0b2tlbiA9IHRoaXMudG9rZW5pemVyLm5leHRUb2tlbigpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMudG9rZW5pemVyLmVuZE9mRmlsZSgpKSBlbmQgPSB0cnVlXG4gICAgaWYgKGJyYWNrZXRzLmxlbmd0aCA+IDApIHRoaXMudW5jbG9zZWRCcmFja2V0KGJyYWNrZXQpXG5cbiAgICBpZiAoZW5kICYmIGNvbG9uKSB7XG4gICAgICB3aGlsZSAodG9rZW5zLmxlbmd0aCkge1xuICAgICAgICB0b2tlbiA9IHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV1bMF1cbiAgICAgICAgaWYgKHRva2VuICE9PSAnc3BhY2UnICYmIHRva2VuICE9PSAnY29tbWVudCcpIGJyZWFrXG4gICAgICAgIHRoaXMudG9rZW5pemVyLmJhY2sodG9rZW5zLnBvcCgpKVxuICAgICAgfVxuICAgICAgdGhpcy5kZWNsKHRva2VucywgY3VzdG9tUHJvcGVydHkpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudW5rbm93bldvcmQodG9rZW5zKVxuICAgIH1cbiAgfVxuXG4gIHJ1bGUodG9rZW5zKSB7XG4gICAgdG9rZW5zLnBvcCgpXG5cbiAgICBsZXQgbm9kZSA9IG5ldyBSdWxlKClcbiAgICB0aGlzLmluaXQobm9kZSwgdG9rZW5zWzBdWzJdKVxuXG4gICAgbm9kZS5yYXdzLmJldHdlZW4gPSB0aGlzLnNwYWNlc0FuZENvbW1lbnRzRnJvbUVuZCh0b2tlbnMpXG4gICAgdGhpcy5yYXcobm9kZSwgJ3NlbGVjdG9yJywgdG9rZW5zKVxuICAgIHRoaXMuY3VycmVudCA9IG5vZGVcbiAgfVxuXG4gIGRlY2wodG9rZW5zLCBjdXN0b21Qcm9wZXJ0eSkge1xuICAgIGxldCBub2RlID0gbmV3IERlY2xhcmF0aW9uKClcbiAgICB0aGlzLmluaXQobm9kZSwgdG9rZW5zWzBdWzJdKVxuXG4gICAgbGV0IGxhc3QgPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdXG4gICAgaWYgKGxhc3RbMF0gPT09ICc7Jykge1xuICAgICAgdGhpcy5zZW1pY29sb24gPSB0cnVlXG4gICAgICB0b2tlbnMucG9wKClcbiAgICB9XG4gICAgbm9kZS5zb3VyY2UuZW5kID0gdGhpcy5nZXRQb3NpdGlvbihsYXN0WzNdIHx8IGxhc3RbMl0pXG5cbiAgICB3aGlsZSAodG9rZW5zWzBdWzBdICE9PSAnd29yZCcpIHtcbiAgICAgIGlmICh0b2tlbnMubGVuZ3RoID09PSAxKSB0aGlzLnVua25vd25Xb3JkKHRva2VucylcbiAgICAgIG5vZGUucmF3cy5iZWZvcmUgKz0gdG9rZW5zLnNoaWZ0KClbMV1cbiAgICB9XG4gICAgbm9kZS5zb3VyY2Uuc3RhcnQgPSB0aGlzLmdldFBvc2l0aW9uKHRva2Vuc1swXVsyXSlcblxuICAgIG5vZGUucHJvcCA9ICcnXG4gICAgd2hpbGUgKHRva2Vucy5sZW5ndGgpIHtcbiAgICAgIGxldCB0eXBlID0gdG9rZW5zWzBdWzBdXG4gICAgICBpZiAodHlwZSA9PT0gJzonIHx8IHR5cGUgPT09ICdzcGFjZScgfHwgdHlwZSA9PT0gJ2NvbW1lbnQnKSB7XG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgICBub2RlLnByb3AgKz0gdG9rZW5zLnNoaWZ0KClbMV1cbiAgICB9XG5cbiAgICBub2RlLnJhd3MuYmV0d2VlbiA9ICcnXG5cbiAgICBsZXQgdG9rZW5cbiAgICB3aGlsZSAodG9rZW5zLmxlbmd0aCkge1xuICAgICAgdG9rZW4gPSB0b2tlbnMuc2hpZnQoKVxuXG4gICAgICBpZiAodG9rZW5bMF0gPT09ICc6Jykge1xuICAgICAgICBub2RlLnJhd3MuYmV0d2VlbiArPSB0b2tlblsxXVxuICAgICAgICBicmVha1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHRva2VuWzBdID09PSAnd29yZCcgJiYgL1xcdy8udGVzdCh0b2tlblsxXSkpIHtcbiAgICAgICAgICB0aGlzLnVua25vd25Xb3JkKFt0b2tlbl0pXG4gICAgICAgIH1cbiAgICAgICAgbm9kZS5yYXdzLmJldHdlZW4gKz0gdG9rZW5bMV1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAobm9kZS5wcm9wWzBdID09PSAnXycgfHwgbm9kZS5wcm9wWzBdID09PSAnKicpIHtcbiAgICAgIG5vZGUucmF3cy5iZWZvcmUgKz0gbm9kZS5wcm9wWzBdXG4gICAgICBub2RlLnByb3AgPSBub2RlLnByb3Auc2xpY2UoMSlcbiAgICB9XG4gICAgbGV0IGZpcnN0U3BhY2VzID0gdGhpcy5zcGFjZXNBbmRDb21tZW50c0Zyb21TdGFydCh0b2tlbnMpXG4gICAgdGhpcy5wcmVjaGVja01pc3NlZFNlbWljb2xvbih0b2tlbnMpXG5cbiAgICBmb3IgKGxldCBpID0gdG9rZW5zLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICB0b2tlbiA9IHRva2Vuc1tpXVxuICAgICAgaWYgKHRva2VuWzFdLnRvTG93ZXJDYXNlKCkgPT09ICchaW1wb3J0YW50Jykge1xuICAgICAgICBub2RlLmltcG9ydGFudCA9IHRydWVcbiAgICAgICAgbGV0IHN0cmluZyA9IHRoaXMuc3RyaW5nRnJvbSh0b2tlbnMsIGkpXG4gICAgICAgIHN0cmluZyA9IHRoaXMuc3BhY2VzRnJvbUVuZCh0b2tlbnMpICsgc3RyaW5nXG4gICAgICAgIGlmIChzdHJpbmcgIT09ICcgIWltcG9ydGFudCcpIG5vZGUucmF3cy5pbXBvcnRhbnQgPSBzdHJpbmdcbiAgICAgICAgYnJlYWtcbiAgICAgIH0gZWxzZSBpZiAodG9rZW5bMV0udG9Mb3dlckNhc2UoKSA9PT0gJ2ltcG9ydGFudCcpIHtcbiAgICAgICAgbGV0IGNhY2hlID0gdG9rZW5zLnNsaWNlKDApXG4gICAgICAgIGxldCBzdHIgPSAnJ1xuICAgICAgICBmb3IgKGxldCBqID0gaTsgaiA+IDA7IGotLSkge1xuICAgICAgICAgIGxldCB0eXBlID0gY2FjaGVbal1bMF1cbiAgICAgICAgICBpZiAoc3RyLnRyaW0oKS5pbmRleE9mKCchJykgPT09IDAgJiYgdHlwZSAhPT0gJ3NwYWNlJykge1xuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICB9XG4gICAgICAgICAgc3RyID0gY2FjaGUucG9wKClbMV0gKyBzdHJcbiAgICAgICAgfVxuICAgICAgICBpZiAoc3RyLnRyaW0oKS5pbmRleE9mKCchJykgPT09IDApIHtcbiAgICAgICAgICBub2RlLmltcG9ydGFudCA9IHRydWVcbiAgICAgICAgICBub2RlLnJhd3MuaW1wb3J0YW50ID0gc3RyXG4gICAgICAgICAgdG9rZW5zID0gY2FjaGVcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAodG9rZW5bMF0gIT09ICdzcGFjZScgJiYgdG9rZW5bMF0gIT09ICdjb21tZW50Jykge1xuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cblxuICAgIGxldCBoYXNXb3JkID0gdG9rZW5zLnNvbWUoaSA9PiBpWzBdICE9PSAnc3BhY2UnICYmIGlbMF0gIT09ICdjb21tZW50JylcbiAgICB0aGlzLnJhdyhub2RlLCAndmFsdWUnLCB0b2tlbnMpXG4gICAgaWYgKGhhc1dvcmQpIHtcbiAgICAgIG5vZGUucmF3cy5iZXR3ZWVuICs9IGZpcnN0U3BhY2VzXG4gICAgfSBlbHNlIHtcbiAgICAgIG5vZGUudmFsdWUgPSBmaXJzdFNwYWNlcyArIG5vZGUudmFsdWVcbiAgICB9XG5cbiAgICBpZiAobm9kZS52YWx1ZS5pbmNsdWRlcygnOicpICYmICFjdXN0b21Qcm9wZXJ0eSkge1xuICAgICAgdGhpcy5jaGVja01pc3NlZFNlbWljb2xvbih0b2tlbnMpXG4gICAgfVxuICB9XG5cbiAgYXRydWxlKHRva2VuKSB7XG4gICAgbGV0IG5vZGUgPSBuZXcgQXRSdWxlKClcbiAgICBub2RlLm5hbWUgPSB0b2tlblsxXS5zbGljZSgxKVxuICAgIGlmIChub2RlLm5hbWUgPT09ICcnKSB7XG4gICAgICB0aGlzLnVubmFtZWRBdHJ1bGUobm9kZSwgdG9rZW4pXG4gICAgfVxuICAgIHRoaXMuaW5pdChub2RlLCB0b2tlblsyXSlcblxuICAgIGxldCB0eXBlXG4gICAgbGV0IHByZXZcbiAgICBsZXQgc2hpZnRcbiAgICBsZXQgbGFzdCA9IGZhbHNlXG4gICAgbGV0IG9wZW4gPSBmYWxzZVxuICAgIGxldCBwYXJhbXMgPSBbXVxuICAgIGxldCBicmFja2V0cyA9IFtdXG5cbiAgICB3aGlsZSAoIXRoaXMudG9rZW5pemVyLmVuZE9mRmlsZSgpKSB7XG4gICAgICB0b2tlbiA9IHRoaXMudG9rZW5pemVyLm5leHRUb2tlbigpXG4gICAgICB0eXBlID0gdG9rZW5bMF1cblxuICAgICAgaWYgKHR5cGUgPT09ICcoJyB8fCB0eXBlID09PSAnWycpIHtcbiAgICAgICAgYnJhY2tldHMucHVzaCh0eXBlID09PSAnKCcgPyAnKScgOiAnXScpXG4gICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICd7JyAmJiBicmFja2V0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGJyYWNrZXRzLnB1c2goJ30nKVxuICAgICAgfSBlbHNlIGlmICh0eXBlID09PSBicmFja2V0c1ticmFja2V0cy5sZW5ndGggLSAxXSkge1xuICAgICAgICBicmFja2V0cy5wb3AoKVxuICAgICAgfVxuXG4gICAgICBpZiAoYnJhY2tldHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIGlmICh0eXBlID09PSAnOycpIHtcbiAgICAgICAgICBub2RlLnNvdXJjZS5lbmQgPSB0aGlzLmdldFBvc2l0aW9uKHRva2VuWzJdKVxuICAgICAgICAgIHRoaXMuc2VtaWNvbG9uID0gdHJ1ZVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ3snKSB7XG4gICAgICAgICAgb3BlbiA9IHRydWVcbiAgICAgICAgICBicmVha1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICd9Jykge1xuICAgICAgICAgIGlmIChwYXJhbXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgc2hpZnQgPSBwYXJhbXMubGVuZ3RoIC0gMVxuICAgICAgICAgICAgcHJldiA9IHBhcmFtc1tzaGlmdF1cbiAgICAgICAgICAgIHdoaWxlIChwcmV2ICYmIHByZXZbMF0gPT09ICdzcGFjZScpIHtcbiAgICAgICAgICAgICAgcHJldiA9IHBhcmFtc1stLXNoaWZ0XVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHByZXYpIHtcbiAgICAgICAgICAgICAgbm9kZS5zb3VyY2UuZW5kID0gdGhpcy5nZXRQb3NpdGlvbihwcmV2WzNdIHx8IHByZXZbMl0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuZW5kKHRva2VuKVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcGFyYW1zLnB1c2godG9rZW4pXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhcmFtcy5wdXNoKHRva2VuKVxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy50b2tlbml6ZXIuZW5kT2ZGaWxlKCkpIHtcbiAgICAgICAgbGFzdCA9IHRydWVcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBub2RlLnJhd3MuYmV0d2VlbiA9IHRoaXMuc3BhY2VzQW5kQ29tbWVudHNGcm9tRW5kKHBhcmFtcylcbiAgICBpZiAocGFyYW1zLmxlbmd0aCkge1xuICAgICAgbm9kZS5yYXdzLmFmdGVyTmFtZSA9IHRoaXMuc3BhY2VzQW5kQ29tbWVudHNGcm9tU3RhcnQocGFyYW1zKVxuICAgICAgdGhpcy5yYXcobm9kZSwgJ3BhcmFtcycsIHBhcmFtcylcbiAgICAgIGlmIChsYXN0KSB7XG4gICAgICAgIHRva2VuID0gcGFyYW1zW3BhcmFtcy5sZW5ndGggLSAxXVxuICAgICAgICBub2RlLnNvdXJjZS5lbmQgPSB0aGlzLmdldFBvc2l0aW9uKHRva2VuWzNdIHx8IHRva2VuWzJdKVxuICAgICAgICB0aGlzLnNwYWNlcyA9IG5vZGUucmF3cy5iZXR3ZWVuXG4gICAgICAgIG5vZGUucmF3cy5iZXR3ZWVuID0gJydcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgbm9kZS5yYXdzLmFmdGVyTmFtZSA9ICcnXG4gICAgICBub2RlLnBhcmFtcyA9ICcnXG4gICAgfVxuXG4gICAgaWYgKG9wZW4pIHtcbiAgICAgIG5vZGUubm9kZXMgPSBbXVxuICAgICAgdGhpcy5jdXJyZW50ID0gbm9kZVxuICAgIH1cbiAgfVxuXG4gIGVuZCh0b2tlbikge1xuICAgIGlmICh0aGlzLmN1cnJlbnQubm9kZXMgJiYgdGhpcy5jdXJyZW50Lm5vZGVzLmxlbmd0aCkge1xuICAgICAgdGhpcy5jdXJyZW50LnJhd3Muc2VtaWNvbG9uID0gdGhpcy5zZW1pY29sb25cbiAgICB9XG4gICAgdGhpcy5zZW1pY29sb24gPSBmYWxzZVxuXG4gICAgdGhpcy5jdXJyZW50LnJhd3MuYWZ0ZXIgPSAodGhpcy5jdXJyZW50LnJhd3MuYWZ0ZXIgfHwgJycpICsgdGhpcy5zcGFjZXNcbiAgICB0aGlzLnNwYWNlcyA9ICcnXG5cbiAgICBpZiAodGhpcy5jdXJyZW50LnBhcmVudCkge1xuICAgICAgdGhpcy5jdXJyZW50LnNvdXJjZS5lbmQgPSB0aGlzLmdldFBvc2l0aW9uKHRva2VuWzJdKVxuICAgICAgdGhpcy5jdXJyZW50ID0gdGhpcy5jdXJyZW50LnBhcmVudFxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnVuZXhwZWN0ZWRDbG9zZSh0b2tlbilcbiAgICB9XG4gIH1cblxuICBlbmRGaWxlKCkge1xuICAgIGlmICh0aGlzLmN1cnJlbnQucGFyZW50KSB0aGlzLnVuY2xvc2VkQmxvY2soKVxuICAgIGlmICh0aGlzLmN1cnJlbnQubm9kZXMgJiYgdGhpcy5jdXJyZW50Lm5vZGVzLmxlbmd0aCkge1xuICAgICAgdGhpcy5jdXJyZW50LnJhd3Muc2VtaWNvbG9uID0gdGhpcy5zZW1pY29sb25cbiAgICB9XG4gICAgdGhpcy5jdXJyZW50LnJhd3MuYWZ0ZXIgPSAodGhpcy5jdXJyZW50LnJhd3MuYWZ0ZXIgfHwgJycpICsgdGhpcy5zcGFjZXNcbiAgfVxuXG4gIGZyZWVTZW1pY29sb24odG9rZW4pIHtcbiAgICB0aGlzLnNwYWNlcyArPSB0b2tlblsxXVxuICAgIGlmICh0aGlzLmN1cnJlbnQubm9kZXMpIHtcbiAgICAgIGxldCBwcmV2ID0gdGhpcy5jdXJyZW50Lm5vZGVzW3RoaXMuY3VycmVudC5ub2Rlcy5sZW5ndGggLSAxXVxuICAgICAgaWYgKHByZXYgJiYgcHJldi50eXBlID09PSAncnVsZScgJiYgIXByZXYucmF3cy5vd25TZW1pY29sb24pIHtcbiAgICAgICAgcHJldi5yYXdzLm93blNlbWljb2xvbiA9IHRoaXMuc3BhY2VzXG4gICAgICAgIHRoaXMuc3BhY2VzID0gJydcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBIZWxwZXJzXG5cbiAgZ2V0UG9zaXRpb24ob2Zmc2V0KSB7XG4gICAgbGV0IHBvcyA9IHRoaXMuaW5wdXQuZnJvbU9mZnNldChvZmZzZXQpXG4gICAgcmV0dXJuIHtcbiAgICAgIG9mZnNldCxcbiAgICAgIGxpbmU6IHBvcy5saW5lLFxuICAgICAgY29sdW1uOiBwb3MuY29sXG4gICAgfVxuICB9XG5cbiAgaW5pdChub2RlLCBvZmZzZXQpIHtcbiAgICB0aGlzLmN1cnJlbnQucHVzaChub2RlKVxuICAgIG5vZGUuc291cmNlID0ge1xuICAgICAgc3RhcnQ6IHRoaXMuZ2V0UG9zaXRpb24ob2Zmc2V0KSxcbiAgICAgIGlucHV0OiB0aGlzLmlucHV0XG4gICAgfVxuICAgIG5vZGUucmF3cy5iZWZvcmUgPSB0aGlzLnNwYWNlc1xuICAgIHRoaXMuc3BhY2VzID0gJydcbiAgICBpZiAobm9kZS50eXBlICE9PSAnY29tbWVudCcpIHRoaXMuc2VtaWNvbG9uID0gZmFsc2VcbiAgfVxuXG4gIHJhdyhub2RlLCBwcm9wLCB0b2tlbnMpIHtcbiAgICBsZXQgdG9rZW4sIHR5cGVcbiAgICBsZXQgbGVuZ3RoID0gdG9rZW5zLmxlbmd0aFxuICAgIGxldCB2YWx1ZSA9ICcnXG4gICAgbGV0IGNsZWFuID0gdHJ1ZVxuICAgIGxldCBuZXh0LCBwcmV2XG4gICAgbGV0IHBhdHRlcm4gPSAvXihbIy58XSk/KFxcdykrL2lcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIHRva2VuID0gdG9rZW5zW2ldXG4gICAgICB0eXBlID0gdG9rZW5bMF1cblxuICAgICAgaWYgKHR5cGUgPT09ICdjb21tZW50JyAmJiBub2RlLnR5cGUgPT09ICdydWxlJykge1xuICAgICAgICBwcmV2ID0gdG9rZW5zW2kgLSAxXVxuICAgICAgICBuZXh0ID0gdG9rZW5zW2kgKyAxXVxuXG4gICAgICAgIGlmIChcbiAgICAgICAgICBwcmV2WzBdICE9PSAnc3BhY2UnICYmXG4gICAgICAgICAgbmV4dFswXSAhPT0gJ3NwYWNlJyAmJlxuICAgICAgICAgIHBhdHRlcm4udGVzdChwcmV2WzFdKSAmJlxuICAgICAgICAgIHBhdHRlcm4udGVzdChuZXh0WzFdKVxuICAgICAgICApIHtcbiAgICAgICAgICB2YWx1ZSArPSB0b2tlblsxXVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNsZWFuID0gZmFsc2VcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlID09PSAnY29tbWVudCcgfHwgKHR5cGUgPT09ICdzcGFjZScgJiYgaSA9PT0gbGVuZ3RoIC0gMSkpIHtcbiAgICAgICAgY2xlYW4gPSBmYWxzZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsdWUgKz0gdG9rZW5bMV1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCFjbGVhbikge1xuICAgICAgbGV0IHJhdyA9IHRva2Vucy5yZWR1Y2UoKGFsbCwgaSkgPT4gYWxsICsgaVsxXSwgJycpXG4gICAgICBub2RlLnJhd3NbcHJvcF0gPSB7IHZhbHVlLCByYXcgfVxuICAgIH1cbiAgICBub2RlW3Byb3BdID0gdmFsdWVcbiAgfVxuXG4gIHNwYWNlc0FuZENvbW1lbnRzRnJvbUVuZCh0b2tlbnMpIHtcbiAgICBsZXQgbGFzdFRva2VuVHlwZVxuICAgIGxldCBzcGFjZXMgPSAnJ1xuICAgIHdoaWxlICh0b2tlbnMubGVuZ3RoKSB7XG4gICAgICBsYXN0VG9rZW5UeXBlID0gdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXVswXVxuICAgICAgaWYgKGxhc3RUb2tlblR5cGUgIT09ICdzcGFjZScgJiYgbGFzdFRva2VuVHlwZSAhPT0gJ2NvbW1lbnQnKSBicmVha1xuICAgICAgc3BhY2VzID0gdG9rZW5zLnBvcCgpWzFdICsgc3BhY2VzXG4gICAgfVxuICAgIHJldHVybiBzcGFjZXNcbiAgfVxuXG4gIHNwYWNlc0FuZENvbW1lbnRzRnJvbVN0YXJ0KHRva2Vucykge1xuICAgIGxldCBuZXh0XG4gICAgbGV0IHNwYWNlcyA9ICcnXG4gICAgd2hpbGUgKHRva2Vucy5sZW5ndGgpIHtcbiAgICAgIG5leHQgPSB0b2tlbnNbMF1bMF1cbiAgICAgIGlmIChuZXh0ICE9PSAnc3BhY2UnICYmIG5leHQgIT09ICdjb21tZW50JykgYnJlYWtcbiAgICAgIHNwYWNlcyArPSB0b2tlbnMuc2hpZnQoKVsxXVxuICAgIH1cbiAgICByZXR1cm4gc3BhY2VzXG4gIH1cblxuICBzcGFjZXNGcm9tRW5kKHRva2Vucykge1xuICAgIGxldCBsYXN0VG9rZW5UeXBlXG4gICAgbGV0IHNwYWNlcyA9ICcnXG4gICAgd2hpbGUgKHRva2Vucy5sZW5ndGgpIHtcbiAgICAgIGxhc3RUb2tlblR5cGUgPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdWzBdXG4gICAgICBpZiAobGFzdFRva2VuVHlwZSAhPT0gJ3NwYWNlJykgYnJlYWtcbiAgICAgIHNwYWNlcyA9IHRva2Vucy5wb3AoKVsxXSArIHNwYWNlc1xuICAgIH1cbiAgICByZXR1cm4gc3BhY2VzXG4gIH1cblxuICBzdHJpbmdGcm9tKHRva2VucywgZnJvbSkge1xuICAgIGxldCByZXN1bHQgPSAnJ1xuICAgIGZvciAobGV0IGkgPSBmcm9tOyBpIDwgdG9rZW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICByZXN1bHQgKz0gdG9rZW5zW2ldWzFdXG4gICAgfVxuICAgIHRva2Vucy5zcGxpY2UoZnJvbSwgdG9rZW5zLmxlbmd0aCAtIGZyb20pXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgY29sb24odG9rZW5zKSB7XG4gICAgbGV0IGJyYWNrZXRzID0gMFxuICAgIGxldCB0b2tlbiwgdHlwZSwgcHJldlxuICAgIGZvciAobGV0IFtpLCBlbGVtZW50XSBvZiB0b2tlbnMuZW50cmllcygpKSB7XG4gICAgICB0b2tlbiA9IGVsZW1lbnRcbiAgICAgIHR5cGUgPSB0b2tlblswXVxuXG4gICAgICBpZiAodHlwZSA9PT0gJygnKSB7XG4gICAgICAgIGJyYWNrZXRzICs9IDFcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlID09PSAnKScpIHtcbiAgICAgICAgYnJhY2tldHMgLT0gMVxuICAgICAgfVxuICAgICAgaWYgKGJyYWNrZXRzID09PSAwICYmIHR5cGUgPT09ICc6Jykge1xuICAgICAgICBpZiAoIXByZXYpIHtcbiAgICAgICAgICB0aGlzLmRvdWJsZUNvbG9uKHRva2VuKVxuICAgICAgICB9IGVsc2UgaWYgKHByZXZbMF0gPT09ICd3b3JkJyAmJiBwcmV2WzFdID09PSAncHJvZ2lkJykge1xuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBwcmV2ID0gdG9rZW5cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICAvLyBFcnJvcnNcblxuICB1bmNsb3NlZEJyYWNrZXQoYnJhY2tldCkge1xuICAgIHRocm93IHRoaXMuaW5wdXQuZXJyb3IoXG4gICAgICAnVW5jbG9zZWQgYnJhY2tldCcsXG4gICAgICB7IG9mZnNldDogYnJhY2tldFsyXSB9LFxuICAgICAgeyBvZmZzZXQ6IGJyYWNrZXRbMl0gKyAxIH1cbiAgICApXG4gIH1cblxuICB1bmtub3duV29yZCh0b2tlbnMpIHtcbiAgICB0aHJvdyB0aGlzLmlucHV0LmVycm9yKFxuICAgICAgJ1Vua25vd24gd29yZCcsXG4gICAgICB7IG9mZnNldDogdG9rZW5zWzBdWzJdIH0sXG4gICAgICB7IG9mZnNldDogdG9rZW5zWzBdWzJdICsgdG9rZW5zWzBdWzFdLmxlbmd0aCB9XG4gICAgKVxuICB9XG5cbiAgdW5leHBlY3RlZENsb3NlKHRva2VuKSB7XG4gICAgdGhyb3cgdGhpcy5pbnB1dC5lcnJvcihcbiAgICAgICdVbmV4cGVjdGVkIH0nLFxuICAgICAgeyBvZmZzZXQ6IHRva2VuWzJdIH0sXG4gICAgICB7IG9mZnNldDogdG9rZW5bMl0gKyAxIH1cbiAgICApXG4gIH1cblxuICB1bmNsb3NlZEJsb2NrKCkge1xuICAgIGxldCBwb3MgPSB0aGlzLmN1cnJlbnQuc291cmNlLnN0YXJ0XG4gICAgdGhyb3cgdGhpcy5pbnB1dC5lcnJvcignVW5jbG9zZWQgYmxvY2snLCBwb3MubGluZSwgcG9zLmNvbHVtbilcbiAgfVxuXG4gIGRvdWJsZUNvbG9uKHRva2VuKSB7XG4gICAgdGhyb3cgdGhpcy5pbnB1dC5lcnJvcihcbiAgICAgICdEb3VibGUgY29sb24nLFxuICAgICAgeyBvZmZzZXQ6IHRva2VuWzJdIH0sXG4gICAgICB7IG9mZnNldDogdG9rZW5bMl0gKyB0b2tlblsxXS5sZW5ndGggfVxuICAgIClcbiAgfVxuXG4gIHVubmFtZWRBdHJ1bGUobm9kZSwgdG9rZW4pIHtcbiAgICB0aHJvdyB0aGlzLmlucHV0LmVycm9yKFxuICAgICAgJ0F0LXJ1bGUgd2l0aG91dCBuYW1lJyxcbiAgICAgIHsgb2Zmc2V0OiB0b2tlblsyXSB9LFxuICAgICAgeyBvZmZzZXQ6IHRva2VuWzJdICsgdG9rZW5bMV0ubGVuZ3RoIH1cbiAgICApXG4gIH1cblxuICBwcmVjaGVja01pc3NlZFNlbWljb2xvbigvKiB0b2tlbnMgKi8pIHtcbiAgICAvLyBIb29rIGZvciBTYWZlIFBhcnNlclxuICB9XG5cbiAgY2hlY2tNaXNzZWRTZW1pY29sb24odG9rZW5zKSB7XG4gICAgbGV0IGNvbG9uID0gdGhpcy5jb2xvbih0b2tlbnMpXG4gICAgaWYgKGNvbG9uID09PSBmYWxzZSkgcmV0dXJuXG5cbiAgICBsZXQgZm91bmRlZCA9IDBcbiAgICBsZXQgdG9rZW5cbiAgICBmb3IgKGxldCBqID0gY29sb24gLSAxOyBqID49IDA7IGotLSkge1xuICAgICAgdG9rZW4gPSB0b2tlbnNbal1cbiAgICAgIGlmICh0b2tlblswXSAhPT0gJ3NwYWNlJykge1xuICAgICAgICBmb3VuZGVkICs9IDFcbiAgICAgICAgaWYgKGZvdW5kZWQgPT09IDIpIGJyZWFrXG4gICAgICB9XG4gICAgfVxuICAgIC8vIElmIHRoZSB0b2tlbiBpcyBhIHdvcmQsIGUuZy4gYCFpbXBvcnRhbnRgLCBgcmVkYCBvciBhbnkgb3RoZXIgdmFsaWQgcHJvcGVydHkncyB2YWx1ZS5cbiAgICAvLyBUaGVuIHdlIG5lZWQgdG8gcmV0dXJuIHRoZSBjb2xvbiBhZnRlciB0aGF0IHdvcmQgdG9rZW4uIFszXSBpcyB0aGUgXCJlbmRcIiBjb2xvbiBvZiB0aGF0IHdvcmQuXG4gICAgLy8gQW5kIGJlY2F1c2Ugd2UgbmVlZCBpdCBhZnRlciB0aGF0IG9uZSB3ZSBkbyArMSB0byBnZXQgdGhlIG5leHQgb25lLlxuICAgIHRocm93IHRoaXMuaW5wdXQuZXJyb3IoXG4gICAgICAnTWlzc2VkIHNlbWljb2xvbicsXG4gICAgICB0b2tlblswXSA9PT0gJ3dvcmQnID8gdG9rZW5bM10gKyAxIDogdG9rZW5bMl1cbiAgICApXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQYXJzZXJcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgQ3NzU3ludGF4RXJyb3IgPSByZXF1aXJlKCcuL2Nzcy1zeW50YXgtZXJyb3InKVxubGV0IERlY2xhcmF0aW9uID0gcmVxdWlyZSgnLi9kZWNsYXJhdGlvbicpXG5sZXQgTGF6eVJlc3VsdCA9IHJlcXVpcmUoJy4vbGF6eS1yZXN1bHQnKVxubGV0IENvbnRhaW5lciA9IHJlcXVpcmUoJy4vY29udGFpbmVyJylcbmxldCBQcm9jZXNzb3IgPSByZXF1aXJlKCcuL3Byb2Nlc3NvcicpXG5sZXQgc3RyaW5naWZ5ID0gcmVxdWlyZSgnLi9zdHJpbmdpZnknKVxubGV0IGZyb21KU09OID0gcmVxdWlyZSgnLi9mcm9tSlNPTicpXG5sZXQgRG9jdW1lbnQgPSByZXF1aXJlKCcuL2RvY3VtZW50JylcbmxldCBXYXJuaW5nID0gcmVxdWlyZSgnLi93YXJuaW5nJylcbmxldCBDb21tZW50ID0gcmVxdWlyZSgnLi9jb21tZW50JylcbmxldCBBdFJ1bGUgPSByZXF1aXJlKCcuL2F0LXJ1bGUnKVxubGV0IFJlc3VsdCA9IHJlcXVpcmUoJy4vcmVzdWx0LmpzJylcbmxldCBJbnB1dCA9IHJlcXVpcmUoJy4vaW5wdXQnKVxubGV0IHBhcnNlID0gcmVxdWlyZSgnLi9wYXJzZScpXG5sZXQgbGlzdCA9IHJlcXVpcmUoJy4vbGlzdCcpXG5sZXQgUnVsZSA9IHJlcXVpcmUoJy4vcnVsZScpXG5sZXQgUm9vdCA9IHJlcXVpcmUoJy4vcm9vdCcpXG5sZXQgTm9kZSA9IHJlcXVpcmUoJy4vbm9kZScpXG5cbmZ1bmN0aW9uIHBvc3Rjc3MoLi4ucGx1Z2lucykge1xuICBpZiAocGx1Z2lucy5sZW5ndGggPT09IDEgJiYgQXJyYXkuaXNBcnJheShwbHVnaW5zWzBdKSkge1xuICAgIHBsdWdpbnMgPSBwbHVnaW5zWzBdXG4gIH1cbiAgcmV0dXJuIG5ldyBQcm9jZXNzb3IocGx1Z2lucylcbn1cblxucG9zdGNzcy5wbHVnaW4gPSBmdW5jdGlvbiBwbHVnaW4obmFtZSwgaW5pdGlhbGl6ZXIpIHtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgaWYgKGNvbnNvbGUgJiYgY29uc29sZS53YXJuKSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICBjb25zb2xlLndhcm4oXG4gICAgICBuYW1lICtcbiAgICAgICAgJzogcG9zdGNzcy5wbHVnaW4gd2FzIGRlcHJlY2F0ZWQuIE1pZ3JhdGlvbiBndWlkZTpcXG4nICtcbiAgICAgICAgJ2h0dHBzOi8vZXZpbG1hcnRpYW5zLmNvbS9jaHJvbmljbGVzL3Bvc3Rjc3MtOC1wbHVnaW4tbWlncmF0aW9uJ1xuICAgIClcbiAgICBpZiAocHJvY2Vzcy5lbnYuTEFORyAmJiBwcm9jZXNzLmVudi5MQU5HLnN0YXJ0c1dpdGgoJ2NuJykpIHtcbiAgICAgIC8qIGM4IGlnbm9yZSBuZXh0IDcgKi9cbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgIG5hbWUgK1xuICAgICAgICAgICc6IOmHjOmdoiBwb3N0Y3NzLnBsdWdpbiDooqvlvIPnlKguIOi/geenu+aMh+WNlzpcXG4nICtcbiAgICAgICAgICAnaHR0cHM6Ly93d3cudzNjdGVjaC5jb20vdG9waWMvMjIyNidcbiAgICAgIClcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gY3JlYXRvciguLi5hcmdzKSB7XG4gICAgbGV0IHRyYW5zZm9ybWVyID0gaW5pdGlhbGl6ZXIoLi4uYXJncylcbiAgICB0cmFuc2Zvcm1lci5wb3N0Y3NzUGx1Z2luID0gbmFtZVxuICAgIHRyYW5zZm9ybWVyLnBvc3Rjc3NWZXJzaW9uID0gbmV3IFByb2Nlc3NvcigpLnZlcnNpb25cbiAgICByZXR1cm4gdHJhbnNmb3JtZXJcbiAgfVxuXG4gIGxldCBjYWNoZVxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoY3JlYXRvciwgJ3Bvc3Rjc3MnLCB7XG4gICAgZ2V0KCkge1xuICAgICAgaWYgKCFjYWNoZSkgY2FjaGUgPSBjcmVhdG9yKClcbiAgICAgIHJldHVybiBjYWNoZVxuICAgIH1cbiAgfSlcblxuICBjcmVhdG9yLnByb2Nlc3MgPSBmdW5jdGlvbiAoY3NzLCBwcm9jZXNzT3B0cywgcGx1Z2luT3B0cykge1xuICAgIHJldHVybiBwb3N0Y3NzKFtjcmVhdG9yKHBsdWdpbk9wdHMpXSkucHJvY2Vzcyhjc3MsIHByb2Nlc3NPcHRzKVxuICB9XG5cbiAgcmV0dXJuIGNyZWF0b3Jcbn1cblxucG9zdGNzcy5zdHJpbmdpZnkgPSBzdHJpbmdpZnlcbnBvc3Rjc3MucGFyc2UgPSBwYXJzZVxucG9zdGNzcy5mcm9tSlNPTiA9IGZyb21KU09OXG5wb3N0Y3NzLmxpc3QgPSBsaXN0XG5cbnBvc3Rjc3MuY29tbWVudCA9IGRlZmF1bHRzID0+IG5ldyBDb21tZW50KGRlZmF1bHRzKVxucG9zdGNzcy5hdFJ1bGUgPSBkZWZhdWx0cyA9PiBuZXcgQXRSdWxlKGRlZmF1bHRzKVxucG9zdGNzcy5kZWNsID0gZGVmYXVsdHMgPT4gbmV3IERlY2xhcmF0aW9uKGRlZmF1bHRzKVxucG9zdGNzcy5ydWxlID0gZGVmYXVsdHMgPT4gbmV3IFJ1bGUoZGVmYXVsdHMpXG5wb3N0Y3NzLnJvb3QgPSBkZWZhdWx0cyA9PiBuZXcgUm9vdChkZWZhdWx0cylcbnBvc3Rjc3MuZG9jdW1lbnQgPSBkZWZhdWx0cyA9PiBuZXcgRG9jdW1lbnQoZGVmYXVsdHMpXG5cbnBvc3Rjc3MuQ3NzU3ludGF4RXJyb3IgPSBDc3NTeW50YXhFcnJvclxucG9zdGNzcy5EZWNsYXJhdGlvbiA9IERlY2xhcmF0aW9uXG5wb3N0Y3NzLkNvbnRhaW5lciA9IENvbnRhaW5lclxucG9zdGNzcy5Qcm9jZXNzb3IgPSBQcm9jZXNzb3JcbnBvc3Rjc3MuRG9jdW1lbnQgPSBEb2N1bWVudFxucG9zdGNzcy5Db21tZW50ID0gQ29tbWVudFxucG9zdGNzcy5XYXJuaW5nID0gV2FybmluZ1xucG9zdGNzcy5BdFJ1bGUgPSBBdFJ1bGVcbnBvc3Rjc3MuUmVzdWx0ID0gUmVzdWx0XG5wb3N0Y3NzLklucHV0ID0gSW5wdXRcbnBvc3Rjc3MuUnVsZSA9IFJ1bGVcbnBvc3Rjc3MuUm9vdCA9IFJvb3RcbnBvc3Rjc3MuTm9kZSA9IE5vZGVcblxuTGF6eVJlc3VsdC5yZWdpc3RlclBvc3Rjc3MocG9zdGNzcylcblxubW9kdWxlLmV4cG9ydHMgPSBwb3N0Y3NzXG5wb3N0Y3NzLmRlZmF1bHQgPSBwb3N0Y3NzXG4iLCIndXNlIHN0cmljdCdcblxubGV0IHsgU291cmNlTWFwQ29uc3VtZXIsIFNvdXJjZU1hcEdlbmVyYXRvciB9ID0gcmVxdWlyZSgnc291cmNlLW1hcC1qcycpXG5sZXQgeyBleGlzdHNTeW5jLCByZWFkRmlsZVN5bmMgfSA9IHJlcXVpcmUoJ2ZzJylcbmxldCB7IGRpcm5hbWUsIGpvaW4gfSA9IHJlcXVpcmUoJ3BhdGgnKVxuXG5mdW5jdGlvbiBmcm9tQmFzZTY0KHN0cikge1xuICBpZiAoQnVmZmVyKSB7XG4gICAgcmV0dXJuIEJ1ZmZlci5mcm9tKHN0ciwgJ2Jhc2U2NCcpLnRvU3RyaW5nKClcbiAgfSBlbHNlIHtcbiAgICAvKiBjOCBpZ25vcmUgbmV4dCAyICovXG4gICAgcmV0dXJuIHdpbmRvdy5hdG9iKHN0cilcbiAgfVxufVxuXG5jbGFzcyBQcmV2aW91c01hcCB7XG4gIGNvbnN0cnVjdG9yKGNzcywgb3B0cykge1xuICAgIGlmIChvcHRzLm1hcCA9PT0gZmFsc2UpIHJldHVyblxuICAgIHRoaXMubG9hZEFubm90YXRpb24oY3NzKVxuICAgIHRoaXMuaW5saW5lID0gdGhpcy5zdGFydFdpdGgodGhpcy5hbm5vdGF0aW9uLCAnZGF0YTonKVxuXG4gICAgbGV0IHByZXYgPSBvcHRzLm1hcCA/IG9wdHMubWFwLnByZXYgOiB1bmRlZmluZWRcbiAgICBsZXQgdGV4dCA9IHRoaXMubG9hZE1hcChvcHRzLmZyb20sIHByZXYpXG4gICAgaWYgKCF0aGlzLm1hcEZpbGUgJiYgb3B0cy5mcm9tKSB7XG4gICAgICB0aGlzLm1hcEZpbGUgPSBvcHRzLmZyb21cbiAgICB9XG4gICAgaWYgKHRoaXMubWFwRmlsZSkgdGhpcy5yb290ID0gZGlybmFtZSh0aGlzLm1hcEZpbGUpXG4gICAgaWYgKHRleHQpIHRoaXMudGV4dCA9IHRleHRcbiAgfVxuXG4gIGNvbnN1bWVyKCkge1xuICAgIGlmICghdGhpcy5jb25zdW1lckNhY2hlKSB7XG4gICAgICB0aGlzLmNvbnN1bWVyQ2FjaGUgPSBuZXcgU291cmNlTWFwQ29uc3VtZXIodGhpcy50ZXh0KVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5jb25zdW1lckNhY2hlXG4gIH1cblxuICB3aXRoQ29udGVudCgpIHtcbiAgICByZXR1cm4gISEoXG4gICAgICB0aGlzLmNvbnN1bWVyKCkuc291cmNlc0NvbnRlbnQgJiZcbiAgICAgIHRoaXMuY29uc3VtZXIoKS5zb3VyY2VzQ29udGVudC5sZW5ndGggPiAwXG4gICAgKVxuICB9XG5cbiAgc3RhcnRXaXRoKHN0cmluZywgc3RhcnQpIHtcbiAgICBpZiAoIXN0cmluZykgcmV0dXJuIGZhbHNlXG4gICAgcmV0dXJuIHN0cmluZy5zdWJzdHIoMCwgc3RhcnQubGVuZ3RoKSA9PT0gc3RhcnRcbiAgfVxuXG4gIGdldEFubm90YXRpb25VUkwoc291cmNlTWFwU3RyaW5nKSB7XG4gICAgcmV0dXJuIHNvdXJjZU1hcFN0cmluZy5yZXBsYWNlKC9eXFwvXFwqXFxzKiMgc291cmNlTWFwcGluZ1VSTD0vLCAnJykudHJpbSgpXG4gIH1cblxuICBsb2FkQW5ub3RhdGlvbihjc3MpIHtcbiAgICBsZXQgY29tbWVudHMgPSBjc3MubWF0Y2goL1xcL1xcKlxccyojIHNvdXJjZU1hcHBpbmdVUkw9L2dtKVxuICAgIGlmICghY29tbWVudHMpIHJldHVyblxuXG4gICAgLy8gc291cmNlTWFwcGluZ1VSTHMgZnJvbSBjb21tZW50cywgc3RyaW5ncywgZXRjLlxuICAgIGxldCBzdGFydCA9IGNzcy5sYXN0SW5kZXhPZihjb21tZW50cy5wb3AoKSlcbiAgICBsZXQgZW5kID0gY3NzLmluZGV4T2YoJyovJywgc3RhcnQpXG5cbiAgICBpZiAoc3RhcnQgPiAtMSAmJiBlbmQgPiAtMSkge1xuICAgICAgLy8gTG9jYXRlIHRoZSBsYXN0IHNvdXJjZU1hcHBpbmdVUkwgdG8gYXZvaWQgcGlja2luXG4gICAgICB0aGlzLmFubm90YXRpb24gPSB0aGlzLmdldEFubm90YXRpb25VUkwoY3NzLnN1YnN0cmluZyhzdGFydCwgZW5kKSlcbiAgICB9XG4gIH1cblxuICBkZWNvZGVJbmxpbmUodGV4dCkge1xuICAgIGxldCBiYXNlQ2hhcnNldFVyaSA9IC9eZGF0YTphcHBsaWNhdGlvblxcL2pzb247Y2hhcnNldD11dGYtPzg7YmFzZTY0LC9cbiAgICBsZXQgYmFzZVVyaSA9IC9eZGF0YTphcHBsaWNhdGlvblxcL2pzb247YmFzZTY0LC9cbiAgICBsZXQgY2hhcnNldFVyaSA9IC9eZGF0YTphcHBsaWNhdGlvblxcL2pzb247Y2hhcnNldD11dGYtPzgsL1xuICAgIGxldCB1cmkgPSAvXmRhdGE6YXBwbGljYXRpb25cXC9qc29uLC9cblxuICAgIGlmIChjaGFyc2V0VXJpLnRlc3QodGV4dCkgfHwgdXJpLnRlc3QodGV4dCkpIHtcbiAgICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQodGV4dC5zdWJzdHIoUmVnRXhwLmxhc3RNYXRjaC5sZW5ndGgpKVxuICAgIH1cblxuICAgIGlmIChiYXNlQ2hhcnNldFVyaS50ZXN0KHRleHQpIHx8IGJhc2VVcmkudGVzdCh0ZXh0KSkge1xuICAgICAgcmV0dXJuIGZyb21CYXNlNjQodGV4dC5zdWJzdHIoUmVnRXhwLmxhc3RNYXRjaC5sZW5ndGgpKVxuICAgIH1cblxuICAgIGxldCBlbmNvZGluZyA9IHRleHQubWF0Y2goL2RhdGE6YXBwbGljYXRpb25cXC9qc29uOyhbXixdKyksLylbMV1cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vuc3VwcG9ydGVkIHNvdXJjZSBtYXAgZW5jb2RpbmcgJyArIGVuY29kaW5nKVxuICB9XG5cbiAgbG9hZEZpbGUocGF0aCkge1xuICAgIHRoaXMucm9vdCA9IGRpcm5hbWUocGF0aClcbiAgICBpZiAoZXhpc3RzU3luYyhwYXRoKSkge1xuICAgICAgdGhpcy5tYXBGaWxlID0gcGF0aFxuICAgICAgcmV0dXJuIHJlYWRGaWxlU3luYyhwYXRoLCAndXRmLTgnKS50b1N0cmluZygpLnRyaW0oKVxuICAgIH1cbiAgfVxuXG4gIGxvYWRNYXAoZmlsZSwgcHJldikge1xuICAgIGlmIChwcmV2ID09PSBmYWxzZSkgcmV0dXJuIGZhbHNlXG5cbiAgICBpZiAocHJldikge1xuICAgICAgaWYgKHR5cGVvZiBwcmV2ID09PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4gcHJldlxuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgcHJldiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBsZXQgcHJldlBhdGggPSBwcmV2KGZpbGUpXG4gICAgICAgIGlmIChwcmV2UGF0aCkge1xuICAgICAgICAgIGxldCBtYXAgPSB0aGlzLmxvYWRGaWxlKHByZXZQYXRoKVxuICAgICAgICAgIGlmICghbWFwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICdVbmFibGUgdG8gbG9hZCBwcmV2aW91cyBzb3VyY2UgbWFwOiAnICsgcHJldlBhdGgudG9TdHJpbmcoKVxuICAgICAgICAgICAgKVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gbWFwXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAocHJldiBpbnN0YW5jZW9mIFNvdXJjZU1hcENvbnN1bWVyKSB7XG4gICAgICAgIHJldHVybiBTb3VyY2VNYXBHZW5lcmF0b3IuZnJvbVNvdXJjZU1hcChwcmV2KS50b1N0cmluZygpXG4gICAgICB9IGVsc2UgaWYgKHByZXYgaW5zdGFuY2VvZiBTb3VyY2VNYXBHZW5lcmF0b3IpIHtcbiAgICAgICAgcmV0dXJuIHByZXYudG9TdHJpbmcoKVxuICAgICAgfSBlbHNlIGlmICh0aGlzLmlzTWFwKHByZXYpKSB7XG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShwcmV2KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICdVbnN1cHBvcnRlZCBwcmV2aW91cyBzb3VyY2UgbWFwIGZvcm1hdDogJyArIHByZXYudG9TdHJpbmcoKVxuICAgICAgICApXG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0aGlzLmlubGluZSkge1xuICAgICAgcmV0dXJuIHRoaXMuZGVjb2RlSW5saW5lKHRoaXMuYW5ub3RhdGlvbilcbiAgICB9IGVsc2UgaWYgKHRoaXMuYW5ub3RhdGlvbikge1xuICAgICAgbGV0IG1hcCA9IHRoaXMuYW5ub3RhdGlvblxuICAgICAgaWYgKGZpbGUpIG1hcCA9IGpvaW4oZGlybmFtZShmaWxlKSwgbWFwKVxuICAgICAgcmV0dXJuIHRoaXMubG9hZEZpbGUobWFwKVxuICAgIH1cbiAgfVxuXG4gIGlzTWFwKG1hcCkge1xuICAgIGlmICh0eXBlb2YgbWFwICE9PSAnb2JqZWN0JykgcmV0dXJuIGZhbHNlXG4gICAgcmV0dXJuIChcbiAgICAgIHR5cGVvZiBtYXAubWFwcGluZ3MgPT09ICdzdHJpbmcnIHx8XG4gICAgICB0eXBlb2YgbWFwLl9tYXBwaW5ncyA9PT0gJ3N0cmluZycgfHxcbiAgICAgIEFycmF5LmlzQXJyYXkobWFwLnNlY3Rpb25zKVxuICAgIClcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFByZXZpb3VzTWFwXG5QcmV2aW91c01hcC5kZWZhdWx0ID0gUHJldmlvdXNNYXBcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgTm9Xb3JrUmVzdWx0ID0gcmVxdWlyZSgnLi9uby13b3JrLXJlc3VsdCcpXG5sZXQgTGF6eVJlc3VsdCA9IHJlcXVpcmUoJy4vbGF6eS1yZXN1bHQnKVxubGV0IERvY3VtZW50ID0gcmVxdWlyZSgnLi9kb2N1bWVudCcpXG5sZXQgUm9vdCA9IHJlcXVpcmUoJy4vcm9vdCcpXG5cbmNsYXNzIFByb2Nlc3NvciB7XG4gIGNvbnN0cnVjdG9yKHBsdWdpbnMgPSBbXSkge1xuICAgIHRoaXMudmVyc2lvbiA9ICc4LjQuNSdcbiAgICB0aGlzLnBsdWdpbnMgPSB0aGlzLm5vcm1hbGl6ZShwbHVnaW5zKVxuICB9XG5cbiAgdXNlKHBsdWdpbikge1xuICAgIHRoaXMucGx1Z2lucyA9IHRoaXMucGx1Z2lucy5jb25jYXQodGhpcy5ub3JtYWxpemUoW3BsdWdpbl0pKVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBwcm9jZXNzKGNzcywgb3B0cyA9IHt9KSB7XG4gICAgaWYgKFxuICAgICAgdGhpcy5wbHVnaW5zLmxlbmd0aCA9PT0gMCAmJlxuICAgICAgdHlwZW9mIG9wdHMucGFyc2VyID09PSAndW5kZWZpbmVkJyAmJlxuICAgICAgdHlwZW9mIG9wdHMuc3RyaW5naWZpZXIgPT09ICd1bmRlZmluZWQnICYmXG4gICAgICB0eXBlb2Ygb3B0cy5zeW50YXggPT09ICd1bmRlZmluZWQnXG4gICAgKSB7XG4gICAgICByZXR1cm4gbmV3IE5vV29ya1Jlc3VsdCh0aGlzLCBjc3MsIG9wdHMpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBuZXcgTGF6eVJlc3VsdCh0aGlzLCBjc3MsIG9wdHMpXG4gICAgfVxuICB9XG5cbiAgbm9ybWFsaXplKHBsdWdpbnMpIHtcbiAgICBsZXQgbm9ybWFsaXplZCA9IFtdXG4gICAgZm9yIChsZXQgaSBvZiBwbHVnaW5zKSB7XG4gICAgICBpZiAoaS5wb3N0Y3NzID09PSB0cnVlKSB7XG4gICAgICAgIGkgPSBpKClcbiAgICAgIH0gZWxzZSBpZiAoaS5wb3N0Y3NzKSB7XG4gICAgICAgIGkgPSBpLnBvc3Rjc3NcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBpID09PSAnb2JqZWN0JyAmJiBBcnJheS5pc0FycmF5KGkucGx1Z2lucykpIHtcbiAgICAgICAgbm9ybWFsaXplZCA9IG5vcm1hbGl6ZWQuY29uY2F0KGkucGx1Z2lucylcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGkgPT09ICdvYmplY3QnICYmIGkucG9zdGNzc1BsdWdpbikge1xuICAgICAgICBub3JtYWxpemVkLnB1c2goaSlcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGkgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgbm9ybWFsaXplZC5wdXNoKGkpXG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBpID09PSAnb2JqZWN0JyAmJiAoaS5wYXJzZSB8fCBpLnN0cmluZ2lmeSkpIHtcbiAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAnUG9zdENTUyBzeW50YXhlcyBjYW5ub3QgYmUgdXNlZCBhcyBwbHVnaW5zLiBJbnN0ZWFkLCBwbGVhc2UgdXNlICcgK1xuICAgICAgICAgICAgICAnb25lIG9mIHRoZSBzeW50YXgvcGFyc2VyL3N0cmluZ2lmaWVyIG9wdGlvbnMgYXMgb3V0bGluZWQgJyArXG4gICAgICAgICAgICAgICdpbiB5b3VyIFBvc3RDU1MgcnVubmVyIGRvY3VtZW50YXRpb24uJ1xuICAgICAgICAgIClcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGkgKyAnIGlzIG5vdCBhIFBvc3RDU1MgcGx1Z2luJylcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5vcm1hbGl6ZWRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFByb2Nlc3NvclxuUHJvY2Vzc29yLmRlZmF1bHQgPSBQcm9jZXNzb3JcblxuUm9vdC5yZWdpc3RlclByb2Nlc3NvcihQcm9jZXNzb3IpXG5Eb2N1bWVudC5yZWdpc3RlclByb2Nlc3NvcihQcm9jZXNzb3IpXG4iLCIndXNlIHN0cmljdCdcblxubGV0IFdhcm5pbmcgPSByZXF1aXJlKCcuL3dhcm5pbmcnKVxuXG5jbGFzcyBSZXN1bHQge1xuICBjb25zdHJ1Y3Rvcihwcm9jZXNzb3IsIHJvb3QsIG9wdHMpIHtcbiAgICB0aGlzLnByb2Nlc3NvciA9IHByb2Nlc3NvclxuICAgIHRoaXMubWVzc2FnZXMgPSBbXVxuICAgIHRoaXMucm9vdCA9IHJvb3RcbiAgICB0aGlzLm9wdHMgPSBvcHRzXG4gICAgdGhpcy5jc3MgPSB1bmRlZmluZWRcbiAgICB0aGlzLm1hcCA9IHVuZGVmaW5lZFxuICB9XG5cbiAgdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMuY3NzXG4gIH1cblxuICB3YXJuKHRleHQsIG9wdHMgPSB7fSkge1xuICAgIGlmICghb3B0cy5wbHVnaW4pIHtcbiAgICAgIGlmICh0aGlzLmxhc3RQbHVnaW4gJiYgdGhpcy5sYXN0UGx1Z2luLnBvc3Rjc3NQbHVnaW4pIHtcbiAgICAgICAgb3B0cy5wbHVnaW4gPSB0aGlzLmxhc3RQbHVnaW4ucG9zdGNzc1BsdWdpblxuICAgICAgfVxuICAgIH1cblxuICAgIGxldCB3YXJuaW5nID0gbmV3IFdhcm5pbmcodGV4dCwgb3B0cylcbiAgICB0aGlzLm1lc3NhZ2VzLnB1c2god2FybmluZylcblxuICAgIHJldHVybiB3YXJuaW5nXG4gIH1cblxuICB3YXJuaW5ncygpIHtcbiAgICByZXR1cm4gdGhpcy5tZXNzYWdlcy5maWx0ZXIoaSA9PiBpLnR5cGUgPT09ICd3YXJuaW5nJylcbiAgfVxuXG4gIGdldCBjb250ZW50KCkge1xuICAgIHJldHVybiB0aGlzLmNzc1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUmVzdWx0XG5SZXN1bHQuZGVmYXVsdCA9IFJlc3VsdFxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBDb250YWluZXIgPSByZXF1aXJlKCcuL2NvbnRhaW5lcicpXG5cbmxldCBMYXp5UmVzdWx0LCBQcm9jZXNzb3JcblxuY2xhc3MgUm9vdCBleHRlbmRzIENvbnRhaW5lciB7XG4gIGNvbnN0cnVjdG9yKGRlZmF1bHRzKSB7XG4gICAgc3VwZXIoZGVmYXVsdHMpXG4gICAgdGhpcy50eXBlID0gJ3Jvb3QnXG4gICAgaWYgKCF0aGlzLm5vZGVzKSB0aGlzLm5vZGVzID0gW11cbiAgfVxuXG4gIHJlbW92ZUNoaWxkKGNoaWxkLCBpZ25vcmUpIHtcbiAgICBsZXQgaW5kZXggPSB0aGlzLmluZGV4KGNoaWxkKVxuXG4gICAgaWYgKCFpZ25vcmUgJiYgaW5kZXggPT09IDAgJiYgdGhpcy5ub2Rlcy5sZW5ndGggPiAxKSB7XG4gICAgICB0aGlzLm5vZGVzWzFdLnJhd3MuYmVmb3JlID0gdGhpcy5ub2Rlc1tpbmRleF0ucmF3cy5iZWZvcmVcbiAgICB9XG5cbiAgICByZXR1cm4gc3VwZXIucmVtb3ZlQ2hpbGQoY2hpbGQpXG4gIH1cblxuICBub3JtYWxpemUoY2hpbGQsIHNhbXBsZSwgdHlwZSkge1xuICAgIGxldCBub2RlcyA9IHN1cGVyLm5vcm1hbGl6ZShjaGlsZClcblxuICAgIGlmIChzYW1wbGUpIHtcbiAgICAgIGlmICh0eXBlID09PSAncHJlcGVuZCcpIHtcbiAgICAgICAgaWYgKHRoaXMubm9kZXMubGVuZ3RoID4gMSkge1xuICAgICAgICAgIHNhbXBsZS5yYXdzLmJlZm9yZSA9IHRoaXMubm9kZXNbMV0ucmF3cy5iZWZvcmVcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkZWxldGUgc2FtcGxlLnJhd3MuYmVmb3JlXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodGhpcy5maXJzdCAhPT0gc2FtcGxlKSB7XG4gICAgICAgIGZvciAobGV0IG5vZGUgb2Ygbm9kZXMpIHtcbiAgICAgICAgICBub2RlLnJhd3MuYmVmb3JlID0gc2FtcGxlLnJhd3MuYmVmb3JlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbm9kZXNcbiAgfVxuXG4gIHRvUmVzdWx0KG9wdHMgPSB7fSkge1xuICAgIGxldCBsYXp5ID0gbmV3IExhenlSZXN1bHQobmV3IFByb2Nlc3NvcigpLCB0aGlzLCBvcHRzKVxuICAgIHJldHVybiBsYXp5LnN0cmluZ2lmeSgpXG4gIH1cbn1cblxuUm9vdC5yZWdpc3RlckxhenlSZXN1bHQgPSBkZXBlbmRhbnQgPT4ge1xuICBMYXp5UmVzdWx0ID0gZGVwZW5kYW50XG59XG5cblJvb3QucmVnaXN0ZXJQcm9jZXNzb3IgPSBkZXBlbmRhbnQgPT4ge1xuICBQcm9jZXNzb3IgPSBkZXBlbmRhbnRcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBSb290XG5Sb290LmRlZmF1bHQgPSBSb290XG4iLCIndXNlIHN0cmljdCdcblxubGV0IENvbnRhaW5lciA9IHJlcXVpcmUoJy4vY29udGFpbmVyJylcbmxldCBsaXN0ID0gcmVxdWlyZSgnLi9saXN0JylcblxuY2xhc3MgUnVsZSBleHRlbmRzIENvbnRhaW5lciB7XG4gIGNvbnN0cnVjdG9yKGRlZmF1bHRzKSB7XG4gICAgc3VwZXIoZGVmYXVsdHMpXG4gICAgdGhpcy50eXBlID0gJ3J1bGUnXG4gICAgaWYgKCF0aGlzLm5vZGVzKSB0aGlzLm5vZGVzID0gW11cbiAgfVxuXG4gIGdldCBzZWxlY3RvcnMoKSB7XG4gICAgcmV0dXJuIGxpc3QuY29tbWEodGhpcy5zZWxlY3RvcilcbiAgfVxuXG4gIHNldCBzZWxlY3RvcnModmFsdWVzKSB7XG4gICAgbGV0IG1hdGNoID0gdGhpcy5zZWxlY3RvciA/IHRoaXMuc2VsZWN0b3IubWF0Y2goLyxcXHMqLykgOiBudWxsXG4gICAgbGV0IHNlcCA9IG1hdGNoID8gbWF0Y2hbMF0gOiAnLCcgKyB0aGlzLnJhdygnYmV0d2VlbicsICdiZWZvcmVPcGVuJylcbiAgICB0aGlzLnNlbGVjdG9yID0gdmFsdWVzLmpvaW4oc2VwKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUnVsZVxuUnVsZS5kZWZhdWx0ID0gUnVsZVxuXG5Db250YWluZXIucmVnaXN0ZXJSdWxlKFJ1bGUpXG4iLCIndXNlIHN0cmljdCdcblxuY29uc3QgREVGQVVMVF9SQVcgPSB7XG4gIGNvbG9uOiAnOiAnLFxuICBpbmRlbnQ6ICcgICAgJyxcbiAgYmVmb3JlRGVjbDogJ1xcbicsXG4gIGJlZm9yZVJ1bGU6ICdcXG4nLFxuICBiZWZvcmVPcGVuOiAnICcsXG4gIGJlZm9yZUNsb3NlOiAnXFxuJyxcbiAgYmVmb3JlQ29tbWVudDogJ1xcbicsXG4gIGFmdGVyOiAnXFxuJyxcbiAgZW1wdHlCb2R5OiAnJyxcbiAgY29tbWVudExlZnQ6ICcgJyxcbiAgY29tbWVudFJpZ2h0OiAnICcsXG4gIHNlbWljb2xvbjogZmFsc2Vcbn1cblxuZnVuY3Rpb24gY2FwaXRhbGl6ZShzdHIpIHtcbiAgcmV0dXJuIHN0clswXS50b1VwcGVyQ2FzZSgpICsgc3RyLnNsaWNlKDEpXG59XG5cbmNsYXNzIFN0cmluZ2lmaWVyIHtcbiAgY29uc3RydWN0b3IoYnVpbGRlcikge1xuICAgIHRoaXMuYnVpbGRlciA9IGJ1aWxkZXJcbiAgfVxuXG4gIHN0cmluZ2lmeShub2RlLCBzZW1pY29sb24pIHtcbiAgICAvKiBjOCBpZ25vcmUgc3RhcnQgKi9cbiAgICBpZiAoIXRoaXNbbm9kZS50eXBlXSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAnVW5rbm93biBBU1Qgbm9kZSB0eXBlICcgK1xuICAgICAgICAgIG5vZGUudHlwZSArXG4gICAgICAgICAgJy4gJyArXG4gICAgICAgICAgJ01heWJlIHlvdSBuZWVkIHRvIGNoYW5nZSBQb3N0Q1NTIHN0cmluZ2lmaWVyLidcbiAgICAgIClcbiAgICB9XG4gICAgLyogYzggaWdub3JlIHN0b3AgKi9cbiAgICB0aGlzW25vZGUudHlwZV0obm9kZSwgc2VtaWNvbG9uKVxuICB9XG5cbiAgZG9jdW1lbnQobm9kZSkge1xuICAgIHRoaXMuYm9keShub2RlKVxuICB9XG5cbiAgcm9vdChub2RlKSB7XG4gICAgdGhpcy5ib2R5KG5vZGUpXG4gICAgaWYgKG5vZGUucmF3cy5hZnRlcikgdGhpcy5idWlsZGVyKG5vZGUucmF3cy5hZnRlcilcbiAgfVxuXG4gIGNvbW1lbnQobm9kZSkge1xuICAgIGxldCBsZWZ0ID0gdGhpcy5yYXcobm9kZSwgJ2xlZnQnLCAnY29tbWVudExlZnQnKVxuICAgIGxldCByaWdodCA9IHRoaXMucmF3KG5vZGUsICdyaWdodCcsICdjb21tZW50UmlnaHQnKVxuICAgIHRoaXMuYnVpbGRlcignLyonICsgbGVmdCArIG5vZGUudGV4dCArIHJpZ2h0ICsgJyovJywgbm9kZSlcbiAgfVxuXG4gIGRlY2wobm9kZSwgc2VtaWNvbG9uKSB7XG4gICAgbGV0IGJldHdlZW4gPSB0aGlzLnJhdyhub2RlLCAnYmV0d2VlbicsICdjb2xvbicpXG4gICAgbGV0IHN0cmluZyA9IG5vZGUucHJvcCArIGJldHdlZW4gKyB0aGlzLnJhd1ZhbHVlKG5vZGUsICd2YWx1ZScpXG5cbiAgICBpZiAobm9kZS5pbXBvcnRhbnQpIHtcbiAgICAgIHN0cmluZyArPSBub2RlLnJhd3MuaW1wb3J0YW50IHx8ICcgIWltcG9ydGFudCdcbiAgICB9XG5cbiAgICBpZiAoc2VtaWNvbG9uKSBzdHJpbmcgKz0gJzsnXG4gICAgdGhpcy5idWlsZGVyKHN0cmluZywgbm9kZSlcbiAgfVxuXG4gIHJ1bGUobm9kZSkge1xuICAgIHRoaXMuYmxvY2sobm9kZSwgdGhpcy5yYXdWYWx1ZShub2RlLCAnc2VsZWN0b3InKSlcbiAgICBpZiAobm9kZS5yYXdzLm93blNlbWljb2xvbikge1xuICAgICAgdGhpcy5idWlsZGVyKG5vZGUucmF3cy5vd25TZW1pY29sb24sIG5vZGUsICdlbmQnKVxuICAgIH1cbiAgfVxuXG4gIGF0cnVsZShub2RlLCBzZW1pY29sb24pIHtcbiAgICBsZXQgbmFtZSA9ICdAJyArIG5vZGUubmFtZVxuICAgIGxldCBwYXJhbXMgPSBub2RlLnBhcmFtcyA/IHRoaXMucmF3VmFsdWUobm9kZSwgJ3BhcmFtcycpIDogJydcblxuICAgIGlmICh0eXBlb2Ygbm9kZS5yYXdzLmFmdGVyTmFtZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIG5hbWUgKz0gbm9kZS5yYXdzLmFmdGVyTmFtZVxuICAgIH0gZWxzZSBpZiAocGFyYW1zKSB7XG4gICAgICBuYW1lICs9ICcgJ1xuICAgIH1cblxuICAgIGlmIChub2RlLm5vZGVzKSB7XG4gICAgICB0aGlzLmJsb2NrKG5vZGUsIG5hbWUgKyBwYXJhbXMpXG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBlbmQgPSAobm9kZS5yYXdzLmJldHdlZW4gfHwgJycpICsgKHNlbWljb2xvbiA/ICc7JyA6ICcnKVxuICAgICAgdGhpcy5idWlsZGVyKG5hbWUgKyBwYXJhbXMgKyBlbmQsIG5vZGUpXG4gICAgfVxuICB9XG5cbiAgYm9keShub2RlKSB7XG4gICAgbGV0IGxhc3QgPSBub2RlLm5vZGVzLmxlbmd0aCAtIDFcbiAgICB3aGlsZSAobGFzdCA+IDApIHtcbiAgICAgIGlmIChub2RlLm5vZGVzW2xhc3RdLnR5cGUgIT09ICdjb21tZW50JykgYnJlYWtcbiAgICAgIGxhc3QgLT0gMVxuICAgIH1cblxuICAgIGxldCBzZW1pY29sb24gPSB0aGlzLnJhdyhub2RlLCAnc2VtaWNvbG9uJylcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGUubm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCBjaGlsZCA9IG5vZGUubm9kZXNbaV1cbiAgICAgIGxldCBiZWZvcmUgPSB0aGlzLnJhdyhjaGlsZCwgJ2JlZm9yZScpXG4gICAgICBpZiAoYmVmb3JlKSB0aGlzLmJ1aWxkZXIoYmVmb3JlKVxuICAgICAgdGhpcy5zdHJpbmdpZnkoY2hpbGQsIGxhc3QgIT09IGkgfHwgc2VtaWNvbG9uKVxuICAgIH1cbiAgfVxuXG4gIGJsb2NrKG5vZGUsIHN0YXJ0KSB7XG4gICAgbGV0IGJldHdlZW4gPSB0aGlzLnJhdyhub2RlLCAnYmV0d2VlbicsICdiZWZvcmVPcGVuJylcbiAgICB0aGlzLmJ1aWxkZXIoc3RhcnQgKyBiZXR3ZWVuICsgJ3snLCBub2RlLCAnc3RhcnQnKVxuXG4gICAgbGV0IGFmdGVyXG4gICAgaWYgKG5vZGUubm9kZXMgJiYgbm9kZS5ub2Rlcy5sZW5ndGgpIHtcbiAgICAgIHRoaXMuYm9keShub2RlKVxuICAgICAgYWZ0ZXIgPSB0aGlzLnJhdyhub2RlLCAnYWZ0ZXInKVxuICAgIH0gZWxzZSB7XG4gICAgICBhZnRlciA9IHRoaXMucmF3KG5vZGUsICdhZnRlcicsICdlbXB0eUJvZHknKVxuICAgIH1cblxuICAgIGlmIChhZnRlcikgdGhpcy5idWlsZGVyKGFmdGVyKVxuICAgIHRoaXMuYnVpbGRlcignfScsIG5vZGUsICdlbmQnKVxuICB9XG5cbiAgcmF3KG5vZGUsIG93biwgZGV0ZWN0KSB7XG4gICAgbGV0IHZhbHVlXG4gICAgaWYgKCFkZXRlY3QpIGRldGVjdCA9IG93blxuXG4gICAgLy8gQWxyZWFkeSBoYWRcbiAgICBpZiAob3duKSB7XG4gICAgICB2YWx1ZSA9IG5vZGUucmF3c1tvd25dXG4gICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAndW5kZWZpbmVkJykgcmV0dXJuIHZhbHVlXG4gICAgfVxuXG4gICAgbGV0IHBhcmVudCA9IG5vZGUucGFyZW50XG5cbiAgICBpZiAoZGV0ZWN0ID09PSAnYmVmb3JlJykge1xuICAgICAgLy8gSGFjayBmb3IgZmlyc3QgcnVsZSBpbiBDU1NcbiAgICAgIGlmICghcGFyZW50IHx8IChwYXJlbnQudHlwZSA9PT0gJ3Jvb3QnICYmIHBhcmVudC5maXJzdCA9PT0gbm9kZSkpIHtcbiAgICAgICAgcmV0dXJuICcnXG4gICAgICB9XG5cbiAgICAgIC8vIGByb290YCBub2RlcyBpbiBgZG9jdW1lbnRgIHNob3VsZCB1c2Ugb25seSB0aGVpciBvd24gcmF3c1xuICAgICAgaWYgKHBhcmVudCAmJiBwYXJlbnQudHlwZSA9PT0gJ2RvY3VtZW50Jykge1xuICAgICAgICByZXR1cm4gJydcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBGbG9hdGluZyBjaGlsZCB3aXRob3V0IHBhcmVudFxuICAgIGlmICghcGFyZW50KSByZXR1cm4gREVGQVVMVF9SQVdbZGV0ZWN0XVxuXG4gICAgLy8gRGV0ZWN0IHN0eWxlIGJ5IG90aGVyIG5vZGVzXG4gICAgbGV0IHJvb3QgPSBub2RlLnJvb3QoKVxuICAgIGlmICghcm9vdC5yYXdDYWNoZSkgcm9vdC5yYXdDYWNoZSA9IHt9XG4gICAgaWYgKHR5cGVvZiByb290LnJhd0NhY2hlW2RldGVjdF0gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm4gcm9vdC5yYXdDYWNoZVtkZXRlY3RdXG4gICAgfVxuXG4gICAgaWYgKGRldGVjdCA9PT0gJ2JlZm9yZScgfHwgZGV0ZWN0ID09PSAnYWZ0ZXInKSB7XG4gICAgICByZXR1cm4gdGhpcy5iZWZvcmVBZnRlcihub2RlLCBkZXRlY3QpXG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBtZXRob2QgPSAncmF3JyArIGNhcGl0YWxpemUoZGV0ZWN0KVxuICAgICAgaWYgKHRoaXNbbWV0aG9kXSkge1xuICAgICAgICB2YWx1ZSA9IHRoaXNbbWV0aG9kXShyb290LCBub2RlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC53YWxrKGkgPT4ge1xuICAgICAgICAgIHZhbHVlID0gaS5yYXdzW293bl1cbiAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAndW5kZWZpbmVkJykgcmV0dXJuIGZhbHNlXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3VuZGVmaW5lZCcpIHZhbHVlID0gREVGQVVMVF9SQVdbZGV0ZWN0XVxuXG4gICAgcm9vdC5yYXdDYWNoZVtkZXRlY3RdID0gdmFsdWVcbiAgICByZXR1cm4gdmFsdWVcbiAgfVxuXG4gIHJhd1NlbWljb2xvbihyb290KSB7XG4gICAgbGV0IHZhbHVlXG4gICAgcm9vdC53YWxrKGkgPT4ge1xuICAgICAgaWYgKGkubm9kZXMgJiYgaS5ub2Rlcy5sZW5ndGggJiYgaS5sYXN0LnR5cGUgPT09ICdkZWNsJykge1xuICAgICAgICB2YWx1ZSA9IGkucmF3cy5zZW1pY29sb25cbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3VuZGVmaW5lZCcpIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIHZhbHVlXG4gIH1cblxuICByYXdFbXB0eUJvZHkocm9vdCkge1xuICAgIGxldCB2YWx1ZVxuICAgIHJvb3Qud2FsayhpID0+IHtcbiAgICAgIGlmIChpLm5vZGVzICYmIGkubm9kZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHZhbHVlID0gaS5yYXdzLmFmdGVyXG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICd1bmRlZmluZWQnKSByZXR1cm4gZmFsc2VcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiB2YWx1ZVxuICB9XG5cbiAgcmF3SW5kZW50KHJvb3QpIHtcbiAgICBpZiAocm9vdC5yYXdzLmluZGVudCkgcmV0dXJuIHJvb3QucmF3cy5pbmRlbnRcbiAgICBsZXQgdmFsdWVcbiAgICByb290LndhbGsoaSA9PiB7XG4gICAgICBsZXQgcCA9IGkucGFyZW50XG4gICAgICBpZiAocCAmJiBwICE9PSByb290ICYmIHAucGFyZW50ICYmIHAucGFyZW50ID09PSByb290KSB7XG4gICAgICAgIGlmICh0eXBlb2YgaS5yYXdzLmJlZm9yZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBsZXQgcGFydHMgPSBpLnJhd3MuYmVmb3JlLnNwbGl0KCdcXG4nKVxuICAgICAgICAgIHZhbHVlID0gcGFydHNbcGFydHMubGVuZ3RoIC0gMV1cbiAgICAgICAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UoL1xcUy9nLCAnJylcbiAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIHZhbHVlXG4gIH1cblxuICByYXdCZWZvcmVDb21tZW50KHJvb3QsIG5vZGUpIHtcbiAgICBsZXQgdmFsdWVcbiAgICByb290LndhbGtDb21tZW50cyhpID0+IHtcbiAgICAgIGlmICh0eXBlb2YgaS5yYXdzLmJlZm9yZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgdmFsdWUgPSBpLnJhd3MuYmVmb3JlXG4gICAgICAgIGlmICh2YWx1ZS5pbmNsdWRlcygnXFxuJykpIHtcbiAgICAgICAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UoL1teXFxuXSskLywgJycpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgfSlcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgdmFsdWUgPSB0aGlzLnJhdyhub2RlLCBudWxsLCAnYmVmb3JlRGVjbCcpXG4gICAgfSBlbHNlIGlmICh2YWx1ZSkge1xuICAgICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC9cXFMvZywgJycpXG4gICAgfVxuICAgIHJldHVybiB2YWx1ZVxuICB9XG5cbiAgcmF3QmVmb3JlRGVjbChyb290LCBub2RlKSB7XG4gICAgbGV0IHZhbHVlXG4gICAgcm9vdC53YWxrRGVjbHMoaSA9PiB7XG4gICAgICBpZiAodHlwZW9mIGkucmF3cy5iZWZvcmUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHZhbHVlID0gaS5yYXdzLmJlZm9yZVxuICAgICAgICBpZiAodmFsdWUuaW5jbHVkZXMoJ1xcbicpKSB7XG4gICAgICAgICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC9bXlxcbl0rJC8sICcnKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgIH0pXG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHZhbHVlID0gdGhpcy5yYXcobm9kZSwgbnVsbCwgJ2JlZm9yZVJ1bGUnKVxuICAgIH0gZWxzZSBpZiAodmFsdWUpIHtcbiAgICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZSgvXFxTL2csICcnKVxuICAgIH1cbiAgICByZXR1cm4gdmFsdWVcbiAgfVxuXG4gIHJhd0JlZm9yZVJ1bGUocm9vdCkge1xuICAgIGxldCB2YWx1ZVxuICAgIHJvb3Qud2FsayhpID0+IHtcbiAgICAgIGlmIChpLm5vZGVzICYmIChpLnBhcmVudCAhPT0gcm9vdCB8fCByb290LmZpcnN0ICE9PSBpKSkge1xuICAgICAgICBpZiAodHlwZW9mIGkucmF3cy5iZWZvcmUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgdmFsdWUgPSBpLnJhd3MuYmVmb3JlXG4gICAgICAgICAgaWYgKHZhbHVlLmluY2x1ZGVzKCdcXG4nKSkge1xuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC9bXlxcbl0rJC8sICcnKVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgaWYgKHZhbHVlKSB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UoL1xcUy9nLCAnJylcbiAgICByZXR1cm4gdmFsdWVcbiAgfVxuXG4gIHJhd0JlZm9yZUNsb3NlKHJvb3QpIHtcbiAgICBsZXQgdmFsdWVcbiAgICByb290LndhbGsoaSA9PiB7XG4gICAgICBpZiAoaS5ub2RlcyAmJiBpLm5vZGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgaWYgKHR5cGVvZiBpLnJhd3MuYWZ0ZXIgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgdmFsdWUgPSBpLnJhd3MuYWZ0ZXJcbiAgICAgICAgICBpZiAodmFsdWUuaW5jbHVkZXMoJ1xcbicpKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UoL1teXFxuXSskLywgJycpXG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICBpZiAodmFsdWUpIHZhbHVlID0gdmFsdWUucmVwbGFjZSgvXFxTL2csICcnKVxuICAgIHJldHVybiB2YWx1ZVxuICB9XG5cbiAgcmF3QmVmb3JlT3Blbihyb290KSB7XG4gICAgbGV0IHZhbHVlXG4gICAgcm9vdC53YWxrKGkgPT4ge1xuICAgICAgaWYgKGkudHlwZSAhPT0gJ2RlY2wnKSB7XG4gICAgICAgIHZhbHVlID0gaS5yYXdzLmJldHdlZW5cbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3VuZGVmaW5lZCcpIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIHZhbHVlXG4gIH1cblxuICByYXdDb2xvbihyb290KSB7XG4gICAgbGV0IHZhbHVlXG4gICAgcm9vdC53YWxrRGVjbHMoaSA9PiB7XG4gICAgICBpZiAodHlwZW9mIGkucmF3cy5iZXR3ZWVuICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICB2YWx1ZSA9IGkucmF3cy5iZXR3ZWVuLnJlcGxhY2UoL1teXFxzOl0vZywgJycpXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIHZhbHVlXG4gIH1cblxuICBiZWZvcmVBZnRlcihub2RlLCBkZXRlY3QpIHtcbiAgICBsZXQgdmFsdWVcbiAgICBpZiAobm9kZS50eXBlID09PSAnZGVjbCcpIHtcbiAgICAgIHZhbHVlID0gdGhpcy5yYXcobm9kZSwgbnVsbCwgJ2JlZm9yZURlY2wnKVxuICAgIH0gZWxzZSBpZiAobm9kZS50eXBlID09PSAnY29tbWVudCcpIHtcbiAgICAgIHZhbHVlID0gdGhpcy5yYXcobm9kZSwgbnVsbCwgJ2JlZm9yZUNvbW1lbnQnKVxuICAgIH0gZWxzZSBpZiAoZGV0ZWN0ID09PSAnYmVmb3JlJykge1xuICAgICAgdmFsdWUgPSB0aGlzLnJhdyhub2RlLCBudWxsLCAnYmVmb3JlUnVsZScpXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbHVlID0gdGhpcy5yYXcobm9kZSwgbnVsbCwgJ2JlZm9yZUNsb3NlJylcbiAgICB9XG5cbiAgICBsZXQgYnVmID0gbm9kZS5wYXJlbnRcbiAgICBsZXQgZGVwdGggPSAwXG4gICAgd2hpbGUgKGJ1ZiAmJiBidWYudHlwZSAhPT0gJ3Jvb3QnKSB7XG4gICAgICBkZXB0aCArPSAxXG4gICAgICBidWYgPSBidWYucGFyZW50XG4gICAgfVxuXG4gICAgaWYgKHZhbHVlLmluY2x1ZGVzKCdcXG4nKSkge1xuICAgICAgbGV0IGluZGVudCA9IHRoaXMucmF3KG5vZGUsIG51bGwsICdpbmRlbnQnKVxuICAgICAgaWYgKGluZGVudC5sZW5ndGgpIHtcbiAgICAgICAgZm9yIChsZXQgc3RlcCA9IDA7IHN0ZXAgPCBkZXB0aDsgc3RlcCsrKSB2YWx1ZSArPSBpbmRlbnRcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdmFsdWVcbiAgfVxuXG4gIHJhd1ZhbHVlKG5vZGUsIHByb3ApIHtcbiAgICBsZXQgdmFsdWUgPSBub2RlW3Byb3BdXG4gICAgbGV0IHJhdyA9IG5vZGUucmF3c1twcm9wXVxuICAgIGlmIChyYXcgJiYgcmF3LnZhbHVlID09PSB2YWx1ZSkge1xuICAgICAgcmV0dXJuIHJhdy5yYXdcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsdWVcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFN0cmluZ2lmaWVyXG5TdHJpbmdpZmllci5kZWZhdWx0ID0gU3RyaW5naWZpZXJcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgU3RyaW5naWZpZXIgPSByZXF1aXJlKCcuL3N0cmluZ2lmaWVyJylcblxuZnVuY3Rpb24gc3RyaW5naWZ5KG5vZGUsIGJ1aWxkZXIpIHtcbiAgbGV0IHN0ciA9IG5ldyBTdHJpbmdpZmllcihidWlsZGVyKVxuICBzdHIuc3RyaW5naWZ5KG5vZGUpXG59XG5cbm1vZHVsZS5leHBvcnRzID0gc3RyaW5naWZ5XG5zdHJpbmdpZnkuZGVmYXVsdCA9IHN0cmluZ2lmeVxuIiwiJ3VzZSBzdHJpY3QnXG5cbm1vZHVsZS5leHBvcnRzLmlzQ2xlYW4gPSBTeW1ib2woJ2lzQ2xlYW4nKVxuXG5tb2R1bGUuZXhwb3J0cy5teSA9IFN5bWJvbCgnbXknKVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IFNJTkdMRV9RVU9URSA9IFwiJ1wiLmNoYXJDb2RlQXQoMClcbmNvbnN0IERPVUJMRV9RVU9URSA9ICdcIicuY2hhckNvZGVBdCgwKVxuY29uc3QgQkFDS1NMQVNIID0gJ1xcXFwnLmNoYXJDb2RlQXQoMClcbmNvbnN0IFNMQVNIID0gJy8nLmNoYXJDb2RlQXQoMClcbmNvbnN0IE5FV0xJTkUgPSAnXFxuJy5jaGFyQ29kZUF0KDApXG5jb25zdCBTUEFDRSA9ICcgJy5jaGFyQ29kZUF0KDApXG5jb25zdCBGRUVEID0gJ1xcZicuY2hhckNvZGVBdCgwKVxuY29uc3QgVEFCID0gJ1xcdCcuY2hhckNvZGVBdCgwKVxuY29uc3QgQ1IgPSAnXFxyJy5jaGFyQ29kZUF0KDApXG5jb25zdCBPUEVOX1NRVUFSRSA9ICdbJy5jaGFyQ29kZUF0KDApXG5jb25zdCBDTE9TRV9TUVVBUkUgPSAnXScuY2hhckNvZGVBdCgwKVxuY29uc3QgT1BFTl9QQVJFTlRIRVNFUyA9ICcoJy5jaGFyQ29kZUF0KDApXG5jb25zdCBDTE9TRV9QQVJFTlRIRVNFUyA9ICcpJy5jaGFyQ29kZUF0KDApXG5jb25zdCBPUEVOX0NVUkxZID0gJ3snLmNoYXJDb2RlQXQoMClcbmNvbnN0IENMT1NFX0NVUkxZID0gJ30nLmNoYXJDb2RlQXQoMClcbmNvbnN0IFNFTUlDT0xPTiA9ICc7Jy5jaGFyQ29kZUF0KDApXG5jb25zdCBBU1RFUklTSyA9ICcqJy5jaGFyQ29kZUF0KDApXG5jb25zdCBDT0xPTiA9ICc6Jy5jaGFyQ29kZUF0KDApXG5jb25zdCBBVCA9ICdAJy5jaGFyQ29kZUF0KDApXG5cbmNvbnN0IFJFX0FUX0VORCA9IC9bXFx0XFxuXFxmXFxyIFwiIycoKS87W1xcXFxcXF17fV0vZ1xuY29uc3QgUkVfV09SRF9FTkQgPSAvW1xcdFxcblxcZlxcciAhXCIjJygpOjtAW1xcXFxcXF17fV18XFwvKD89XFwqKS9nXG5jb25zdCBSRV9CQURfQlJBQ0tFVCA9IC8uW1xcblwiJygvXFxcXF0vXG5jb25zdCBSRV9IRVhfRVNDQVBFID0gL1tcXGRhLWZdL2lcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0b2tlbml6ZXIoaW5wdXQsIG9wdGlvbnMgPSB7fSkge1xuICBsZXQgY3NzID0gaW5wdXQuY3NzLnZhbHVlT2YoKVxuICBsZXQgaWdub3JlID0gb3B0aW9ucy5pZ25vcmVFcnJvcnNcblxuICBsZXQgY29kZSwgbmV4dCwgcXVvdGUsIGNvbnRlbnQsIGVzY2FwZVxuICBsZXQgZXNjYXBlZCwgZXNjYXBlUG9zLCBwcmV2LCBuLCBjdXJyZW50VG9rZW5cblxuICBsZXQgbGVuZ3RoID0gY3NzLmxlbmd0aFxuICBsZXQgcG9zID0gMFxuICBsZXQgYnVmZmVyID0gW11cbiAgbGV0IHJldHVybmVkID0gW11cblxuICBmdW5jdGlvbiBwb3NpdGlvbigpIHtcbiAgICByZXR1cm4gcG9zXG4gIH1cblxuICBmdW5jdGlvbiB1bmNsb3NlZCh3aGF0KSB7XG4gICAgdGhyb3cgaW5wdXQuZXJyb3IoJ1VuY2xvc2VkICcgKyB3aGF0LCBwb3MpXG4gIH1cblxuICBmdW5jdGlvbiBlbmRPZkZpbGUoKSB7XG4gICAgcmV0dXJuIHJldHVybmVkLmxlbmd0aCA9PT0gMCAmJiBwb3MgPj0gbGVuZ3RoXG4gIH1cblxuICBmdW5jdGlvbiBuZXh0VG9rZW4ob3B0cykge1xuICAgIGlmIChyZXR1cm5lZC5sZW5ndGgpIHJldHVybiByZXR1cm5lZC5wb3AoKVxuICAgIGlmIChwb3MgPj0gbGVuZ3RoKSByZXR1cm5cblxuICAgIGxldCBpZ25vcmVVbmNsb3NlZCA9IG9wdHMgPyBvcHRzLmlnbm9yZVVuY2xvc2VkIDogZmFsc2VcblxuICAgIGNvZGUgPSBjc3MuY2hhckNvZGVBdChwb3MpXG5cbiAgICBzd2l0Y2ggKGNvZGUpIHtcbiAgICAgIGNhc2UgTkVXTElORTpcbiAgICAgIGNhc2UgU1BBQ0U6XG4gICAgICBjYXNlIFRBQjpcbiAgICAgIGNhc2UgQ1I6XG4gICAgICBjYXNlIEZFRUQ6IHtcbiAgICAgICAgbmV4dCA9IHBvc1xuICAgICAgICBkbyB7XG4gICAgICAgICAgbmV4dCArPSAxXG4gICAgICAgICAgY29kZSA9IGNzcy5jaGFyQ29kZUF0KG5leHQpXG4gICAgICAgIH0gd2hpbGUgKFxuICAgICAgICAgIGNvZGUgPT09IFNQQUNFIHx8XG4gICAgICAgICAgY29kZSA9PT0gTkVXTElORSB8fFxuICAgICAgICAgIGNvZGUgPT09IFRBQiB8fFxuICAgICAgICAgIGNvZGUgPT09IENSIHx8XG4gICAgICAgICAgY29kZSA9PT0gRkVFRFxuICAgICAgICApXG5cbiAgICAgICAgY3VycmVudFRva2VuID0gWydzcGFjZScsIGNzcy5zbGljZShwb3MsIG5leHQpXVxuICAgICAgICBwb3MgPSBuZXh0IC0gMVxuICAgICAgICBicmVha1xuICAgICAgfVxuXG4gICAgICBjYXNlIE9QRU5fU1FVQVJFOlxuICAgICAgY2FzZSBDTE9TRV9TUVVBUkU6XG4gICAgICBjYXNlIE9QRU5fQ1VSTFk6XG4gICAgICBjYXNlIENMT1NFX0NVUkxZOlxuICAgICAgY2FzZSBDT0xPTjpcbiAgICAgIGNhc2UgU0VNSUNPTE9OOlxuICAgICAgY2FzZSBDTE9TRV9QQVJFTlRIRVNFUzoge1xuICAgICAgICBsZXQgY29udHJvbENoYXIgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGNvZGUpXG4gICAgICAgIGN1cnJlbnRUb2tlbiA9IFtjb250cm9sQ2hhciwgY29udHJvbENoYXIsIHBvc11cbiAgICAgICAgYnJlYWtcbiAgICAgIH1cblxuICAgICAgY2FzZSBPUEVOX1BBUkVOVEhFU0VTOiB7XG4gICAgICAgIHByZXYgPSBidWZmZXIubGVuZ3RoID8gYnVmZmVyLnBvcCgpWzFdIDogJydcbiAgICAgICAgbiA9IGNzcy5jaGFyQ29kZUF0KHBvcyArIDEpXG4gICAgICAgIGlmIChcbiAgICAgICAgICBwcmV2ID09PSAndXJsJyAmJlxuICAgICAgICAgIG4gIT09IFNJTkdMRV9RVU9URSAmJlxuICAgICAgICAgIG4gIT09IERPVUJMRV9RVU9URSAmJlxuICAgICAgICAgIG4gIT09IFNQQUNFICYmXG4gICAgICAgICAgbiAhPT0gTkVXTElORSAmJlxuICAgICAgICAgIG4gIT09IFRBQiAmJlxuICAgICAgICAgIG4gIT09IEZFRUQgJiZcbiAgICAgICAgICBuICE9PSBDUlxuICAgICAgICApIHtcbiAgICAgICAgICBuZXh0ID0gcG9zXG4gICAgICAgICAgZG8ge1xuICAgICAgICAgICAgZXNjYXBlZCA9IGZhbHNlXG4gICAgICAgICAgICBuZXh0ID0gY3NzLmluZGV4T2YoJyknLCBuZXh0ICsgMSlcbiAgICAgICAgICAgIGlmIChuZXh0ID09PSAtMSkge1xuICAgICAgICAgICAgICBpZiAoaWdub3JlIHx8IGlnbm9yZVVuY2xvc2VkKSB7XG4gICAgICAgICAgICAgICAgbmV4dCA9IHBvc1xuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdW5jbG9zZWQoJ2JyYWNrZXQnKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlc2NhcGVQb3MgPSBuZXh0XG4gICAgICAgICAgICB3aGlsZSAoY3NzLmNoYXJDb2RlQXQoZXNjYXBlUG9zIC0gMSkgPT09IEJBQ0tTTEFTSCkge1xuICAgICAgICAgICAgICBlc2NhcGVQb3MgLT0gMVxuICAgICAgICAgICAgICBlc2NhcGVkID0gIWVzY2FwZWRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IHdoaWxlIChlc2NhcGVkKVxuXG4gICAgICAgICAgY3VycmVudFRva2VuID0gWydicmFja2V0cycsIGNzcy5zbGljZShwb3MsIG5leHQgKyAxKSwgcG9zLCBuZXh0XVxuXG4gICAgICAgICAgcG9zID0gbmV4dFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG5leHQgPSBjc3MuaW5kZXhPZignKScsIHBvcyArIDEpXG4gICAgICAgICAgY29udGVudCA9IGNzcy5zbGljZShwb3MsIG5leHQgKyAxKVxuXG4gICAgICAgICAgaWYgKG5leHQgPT09IC0xIHx8IFJFX0JBRF9CUkFDS0VULnRlc3QoY29udGVudCkpIHtcbiAgICAgICAgICAgIGN1cnJlbnRUb2tlbiA9IFsnKCcsICcoJywgcG9zXVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjdXJyZW50VG9rZW4gPSBbJ2JyYWNrZXRzJywgY29udGVudCwgcG9zLCBuZXh0XVxuICAgICAgICAgICAgcG9zID0gbmV4dFxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGJyZWFrXG4gICAgICB9XG5cbiAgICAgIGNhc2UgU0lOR0xFX1FVT1RFOlxuICAgICAgY2FzZSBET1VCTEVfUVVPVEU6IHtcbiAgICAgICAgcXVvdGUgPSBjb2RlID09PSBTSU5HTEVfUVVPVEUgPyBcIidcIiA6ICdcIidcbiAgICAgICAgbmV4dCA9IHBvc1xuICAgICAgICBkbyB7XG4gICAgICAgICAgZXNjYXBlZCA9IGZhbHNlXG4gICAgICAgICAgbmV4dCA9IGNzcy5pbmRleE9mKHF1b3RlLCBuZXh0ICsgMSlcbiAgICAgICAgICBpZiAobmV4dCA9PT0gLTEpIHtcbiAgICAgICAgICAgIGlmIChpZ25vcmUgfHwgaWdub3JlVW5jbG9zZWQpIHtcbiAgICAgICAgICAgICAgbmV4dCA9IHBvcyArIDFcbiAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHVuY2xvc2VkKCdzdHJpbmcnKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBlc2NhcGVQb3MgPSBuZXh0XG4gICAgICAgICAgd2hpbGUgKGNzcy5jaGFyQ29kZUF0KGVzY2FwZVBvcyAtIDEpID09PSBCQUNLU0xBU0gpIHtcbiAgICAgICAgICAgIGVzY2FwZVBvcyAtPSAxXG4gICAgICAgICAgICBlc2NhcGVkID0gIWVzY2FwZWRcbiAgICAgICAgICB9XG4gICAgICAgIH0gd2hpbGUgKGVzY2FwZWQpXG5cbiAgICAgICAgY3VycmVudFRva2VuID0gWydzdHJpbmcnLCBjc3Muc2xpY2UocG9zLCBuZXh0ICsgMSksIHBvcywgbmV4dF1cbiAgICAgICAgcG9zID0gbmV4dFxuICAgICAgICBicmVha1xuICAgICAgfVxuXG4gICAgICBjYXNlIEFUOiB7XG4gICAgICAgIFJFX0FUX0VORC5sYXN0SW5kZXggPSBwb3MgKyAxXG4gICAgICAgIFJFX0FUX0VORC50ZXN0KGNzcylcbiAgICAgICAgaWYgKFJFX0FUX0VORC5sYXN0SW5kZXggPT09IDApIHtcbiAgICAgICAgICBuZXh0ID0gY3NzLmxlbmd0aCAtIDFcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBuZXh0ID0gUkVfQVRfRU5ELmxhc3RJbmRleCAtIDJcbiAgICAgICAgfVxuXG4gICAgICAgIGN1cnJlbnRUb2tlbiA9IFsnYXQtd29yZCcsIGNzcy5zbGljZShwb3MsIG5leHQgKyAxKSwgcG9zLCBuZXh0XVxuXG4gICAgICAgIHBvcyA9IG5leHRcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cblxuICAgICAgY2FzZSBCQUNLU0xBU0g6IHtcbiAgICAgICAgbmV4dCA9IHBvc1xuICAgICAgICBlc2NhcGUgPSB0cnVlXG4gICAgICAgIHdoaWxlIChjc3MuY2hhckNvZGVBdChuZXh0ICsgMSkgPT09IEJBQ0tTTEFTSCkge1xuICAgICAgICAgIG5leHQgKz0gMVxuICAgICAgICAgIGVzY2FwZSA9ICFlc2NhcGVcbiAgICAgICAgfVxuICAgICAgICBjb2RlID0gY3NzLmNoYXJDb2RlQXQobmV4dCArIDEpXG4gICAgICAgIGlmIChcbiAgICAgICAgICBlc2NhcGUgJiZcbiAgICAgICAgICBjb2RlICE9PSBTTEFTSCAmJlxuICAgICAgICAgIGNvZGUgIT09IFNQQUNFICYmXG4gICAgICAgICAgY29kZSAhPT0gTkVXTElORSAmJlxuICAgICAgICAgIGNvZGUgIT09IFRBQiAmJlxuICAgICAgICAgIGNvZGUgIT09IENSICYmXG4gICAgICAgICAgY29kZSAhPT0gRkVFRFxuICAgICAgICApIHtcbiAgICAgICAgICBuZXh0ICs9IDFcbiAgICAgICAgICBpZiAoUkVfSEVYX0VTQ0FQRS50ZXN0KGNzcy5jaGFyQXQobmV4dCkpKSB7XG4gICAgICAgICAgICB3aGlsZSAoUkVfSEVYX0VTQ0FQRS50ZXN0KGNzcy5jaGFyQXQobmV4dCArIDEpKSkge1xuICAgICAgICAgICAgICBuZXh0ICs9IDFcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjc3MuY2hhckNvZGVBdChuZXh0ICsgMSkgPT09IFNQQUNFKSB7XG4gICAgICAgICAgICAgIG5leHQgKz0gMVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGN1cnJlbnRUb2tlbiA9IFsnd29yZCcsIGNzcy5zbGljZShwb3MsIG5leHQgKyAxKSwgcG9zLCBuZXh0XVxuXG4gICAgICAgIHBvcyA9IG5leHRcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cblxuICAgICAgZGVmYXVsdDoge1xuICAgICAgICBpZiAoY29kZSA9PT0gU0xBU0ggJiYgY3NzLmNoYXJDb2RlQXQocG9zICsgMSkgPT09IEFTVEVSSVNLKSB7XG4gICAgICAgICAgbmV4dCA9IGNzcy5pbmRleE9mKCcqLycsIHBvcyArIDIpICsgMVxuICAgICAgICAgIGlmIChuZXh0ID09PSAwKSB7XG4gICAgICAgICAgICBpZiAoaWdub3JlIHx8IGlnbm9yZVVuY2xvc2VkKSB7XG4gICAgICAgICAgICAgIG5leHQgPSBjc3MubGVuZ3RoXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB1bmNsb3NlZCgnY29tbWVudCcpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY3VycmVudFRva2VuID0gWydjb21tZW50JywgY3NzLnNsaWNlKHBvcywgbmV4dCArIDEpLCBwb3MsIG5leHRdXG4gICAgICAgICAgcG9zID0gbmV4dFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIFJFX1dPUkRfRU5ELmxhc3RJbmRleCA9IHBvcyArIDFcbiAgICAgICAgICBSRV9XT1JEX0VORC50ZXN0KGNzcylcbiAgICAgICAgICBpZiAoUkVfV09SRF9FTkQubGFzdEluZGV4ID09PSAwKSB7XG4gICAgICAgICAgICBuZXh0ID0gY3NzLmxlbmd0aCAtIDFcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbmV4dCA9IFJFX1dPUkRfRU5ELmxhc3RJbmRleCAtIDJcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjdXJyZW50VG9rZW4gPSBbJ3dvcmQnLCBjc3Muc2xpY2UocG9zLCBuZXh0ICsgMSksIHBvcywgbmV4dF1cbiAgICAgICAgICBidWZmZXIucHVzaChjdXJyZW50VG9rZW4pXG4gICAgICAgICAgcG9zID0gbmV4dFxuICAgICAgICB9XG5cbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBwb3MrK1xuICAgIHJldHVybiBjdXJyZW50VG9rZW5cbiAgfVxuXG4gIGZ1bmN0aW9uIGJhY2sodG9rZW4pIHtcbiAgICByZXR1cm5lZC5wdXNoKHRva2VuKVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBiYWNrLFxuICAgIG5leHRUb2tlbixcbiAgICBlbmRPZkZpbGUsXG4gICAgcG9zaXRpb25cbiAgfVxufVxuIiwiLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xuJ3VzZSBzdHJpY3QnXG5cbmxldCBwcmludGVkID0ge31cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB3YXJuT25jZShtZXNzYWdlKSB7XG4gIGlmIChwcmludGVkW21lc3NhZ2VdKSByZXR1cm5cbiAgcHJpbnRlZFttZXNzYWdlXSA9IHRydWVcblxuICBpZiAodHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnICYmIGNvbnNvbGUud2Fybikge1xuICAgIGNvbnNvbGUud2FybihtZXNzYWdlKVxuICB9XG59XG4iLCIndXNlIHN0cmljdCdcblxuY2xhc3MgV2FybmluZyB7XG4gIGNvbnN0cnVjdG9yKHRleHQsIG9wdHMgPSB7fSkge1xuICAgIHRoaXMudHlwZSA9ICd3YXJuaW5nJ1xuICAgIHRoaXMudGV4dCA9IHRleHRcblxuICAgIGlmIChvcHRzLm5vZGUgJiYgb3B0cy5ub2RlLnNvdXJjZSkge1xuICAgICAgbGV0IHJhbmdlID0gb3B0cy5ub2RlLnJhbmdlQnkob3B0cylcbiAgICAgIHRoaXMubGluZSA9IHJhbmdlLnN0YXJ0LmxpbmVcbiAgICAgIHRoaXMuY29sdW1uID0gcmFuZ2Uuc3RhcnQuY29sdW1uXG4gICAgICB0aGlzLmVuZExpbmUgPSByYW5nZS5lbmQubGluZVxuICAgICAgdGhpcy5lbmRDb2x1bW4gPSByYW5nZS5lbmQuY29sdW1uXG4gICAgfVxuXG4gICAgZm9yIChsZXQgb3B0IGluIG9wdHMpIHRoaXNbb3B0XSA9IG9wdHNbb3B0XVxuICB9XG5cbiAgdG9TdHJpbmcoKSB7XG4gICAgaWYgKHRoaXMubm9kZSkge1xuICAgICAgcmV0dXJuIHRoaXMubm9kZS5lcnJvcih0aGlzLnRleHQsIHtcbiAgICAgICAgcGx1Z2luOiB0aGlzLnBsdWdpbixcbiAgICAgICAgaW5kZXg6IHRoaXMuaW5kZXgsXG4gICAgICAgIHdvcmQ6IHRoaXMud29yZFxuICAgICAgfSkubWVzc2FnZVxuICAgIH1cblxuICAgIGlmICh0aGlzLnBsdWdpbikge1xuICAgICAgcmV0dXJuIHRoaXMucGx1Z2luICsgJzogJyArIHRoaXMudGV4dFxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnRleHRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFdhcm5pbmdcbldhcm5pbmcuZGVmYXVsdCA9IFdhcm5pbmdcbiIsImltcG9ydCBwcm9qZWN0QXJyYXkgZnJvbSBcIi4vbGlzdEl0ZW1PYmplY3RcIjtcclxuaW1wb3J0IERPTW1hbmFnZW1lbnQgZnJvbSBcIi4vbWFuYWdlRE9NXCI7XHJcbmltcG9ydCBzdG9yYWdlTWFuYW5nZW1lbnQgZnJvbSBcIi4vbG9jYWxTdG9yYWdlXCI7XHJcbmltcG9ydCB7IElucHV0IH0gZnJvbSBcInBvc3Rjc3NcIjtcclxuXHJcblxyXG5cclxuY29uc3QgZ2V0VG9kbyA9ICgoKT0+e1xyXG4gICAgbGV0IHByb2plY3RMaXN0PVtdO1xyXG4gXHJcbiAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3Byb2plY3RGb3JtU2VuZCcpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywoZSk9PntcclxuICAgICAgICBpZihkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcHJvamVjdE5hbWUnKS52YWx1ZSA9PT0gJycgfHwgdmFsaWRhdGVQcm9qZWN0TmFtZSgpPT09IGZhbHNlKXtcclxuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3Byb2plY3ROYW1lJykuc3R5bGUuYm9yZGVyID0gYDFweCBzb2xpZCByZWRgO1xyXG4gICAgICAgIH1lbHNleyBcclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcHJvamVjdE5hbWUnKS5zdHlsZS5ib3JkZXIgPSBgMXB4IHNvbGlkIHdoaXRlYDtcclxuICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgIGxldCBuZXdQcm9qZWN0ID0gcHJvamVjdEFycmF5LnByb2plY3QoKVxyXG4gICAgICAgICBuZXdQcm9qZWN0LnByb2plY3ROYW1lID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3Byb2plY3ROYW1lJykudmFsdWU7XHJcbiAgICAgICAgIG5ld1Byb2plY3QucHJvamVjdENvbnRlbnQgPSBbXVxyXG4gICAgICAgICBwcm9qZWN0TGlzdC5wdXNoKG5ld1Byb2plY3QpXHJcbiAgICAgICAgIERPTW1hbmFnZW1lbnQuYXBwZW5kUHJvamVjdChwcm9qZWN0TGlzdCwnbmV3UHJvamVjdCcpXHJcbiAgICAgICAgIHN0b3JhZ2VNYW5hbmdlbWVudC5zZXRTdG9yYWdlKCk7XHJcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnByb2plY3RGb3JtQmFja2dyb3VuZCcpLmNsYXNzTGlzdC5yZW1vdmUoJ3Nob3cnKVxyXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNwcm9qZWN0Zm9ybScpLnJlc2V0KClcclxuICAgICAgICB9XHJcbiAgICB9KVxyXG5cclxuXHJcblxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2Zvcm1TZW5kJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLChlKT0+e1xyXG4gICAgICAgIGxldCBwcm9qZWN0SW5kZXggPSBjdXJyZW50UHJvamVjdCgpO1xyXG4gICAgICAgIGlmKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNuYW1lJykudmFsdWUgPT09ICcnIHx8IHZhbGlkYXRlTmFtZSgpID09PSBmYWxzZSl7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNuYW1lJykuc3R5bGUuYm9yZGVyID0gYDFweCBzb2xpZCByZWRgO1xyXG4gICAgICAgIH1lbHNleyBcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgbGV0IG5ld0l0ZW0gPSBwcm9qZWN0QXJyYXkubGlzdEl0ZW0oKTtcclxuICAgICAgICBuZXdJdGVtLml0ZW1OYW1lID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI25hbWUnKS52YWx1ZTtcclxuICAgICAgICBuZXdJdGVtLml0ZW1Ob3RlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI25vdGUnKS52YWx1ZTtcclxuICAgICAgICBpZihkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZm9ybURhdGUnKS52YWx1ZSAhPT0gJycpe1xyXG4gICAgICAgICAgICBuZXdJdGVtLml0ZW1EYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmZvcm1EYXRlJykudmFsdWU7XHJcbiAgICAgICAgfWVsc2UgaWYoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmZvcm1EYXRlJykudmFsdWUgPT09ICcnKSB7XHJcbiAgICAgICAgICAgIG5ld0l0ZW0uaXRlbURhdGUgPSAnTm8gZGF0ZSd9XHJcbiAgICAgICAgaWYobmV3SXRlbS5pdGVtTm90ZSA9PT0gJycpe25ld0l0ZW0uaXRlbU5vdGUgPSAnTm8gZGV0YWlscyd9XHJcbiAgICAgICAgcHJvamVjdExpc3RbcHJvamVjdEluZGV4XS5wcm9qZWN0Q29udGVudC5wdXNoKG5ld0l0ZW0pO1xyXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNmb3JtJykucmVzZXQoKVxyXG4gICAgICAgIERPTW1hbmFnZW1lbnQuYXBwZW5kTGlzdChwcm9qZWN0TGlzdFtwcm9qZWN0SW5kZXhdLnByb2plY3RDb250ZW50W2dldFRvZG8ucHJvamVjdExpc3RbcHJvamVjdEluZGV4XS5wcm9qZWN0Q29udGVudC5sZW5ndGgtMV0pXHJcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmZvcm1CYWNrZ3JvdW5kJykuY2xhc3NMaXN0LnJlbW92ZSgnc2hvdycpXHJcbiAgICAgICAgc3RvcmFnZU1hbmFuZ2VtZW50LnNldFN0b3JhZ2UoKTtcclxuICAgICAgICB9XHJcbiAgICB9KVxyXG5cclxuICAgIGNvbnN0IHZhbGlkYXRlTmFtZSA9ICgpPT57XHJcbiAgICAgICAgY29uc3QgcHJvamVjdEluZGV4ID0gY3VycmVudFByb2plY3QoKTtcclxuICAgICAgICBmb3IobGV0IGkgPSAwO2k8cHJvamVjdExpc3RbcHJvamVjdEluZGV4XS5wcm9qZWN0Q29udGVudC5sZW5ndGg7aSsrKXtcclxuICAgICAgICAgICAgaWYocHJvamVjdExpc3RbcHJvamVjdEluZGV4XS5wcm9qZWN0Q29udGVudFtpXS5pdGVtTmFtZSA9PT0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI25hbWUnKS52YWx1ZSl7XHJcbiAgICAgICAgICAgICAgICBhbGVydCgnTmFtZSBhbHJlYWR5IGluIHVzZScpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB2YWxpZGF0ZVByb2plY3ROYW1lID0gKCk9PntcclxuICAgICAgICBmb3IobGV0IGkgPTA7aTxwcm9qZWN0TGlzdC5sZW5ndGg7aSsrKXtcclxuICAgICAgICAgICAgaWYocHJvamVjdExpc3RbaV0ucHJvamVjdE5hbWUgPT09IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNwcm9qZWN0TmFtZScpLnZhbHVlKVxyXG4gICAgICAgICAgICBhbGVydCgnTmFtZSBhbHJlYWR5IGluIHVzZScpXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgXHJcbiAgICBjb25zdCBjdXJyZW50UHJvamVjdCA9ICgpPT57XHJcbiAgICAgICAgbGV0IG5hbWUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucHJvamVjdE5hbWUnKS50ZXh0Q29udGVudDtcclxuICAgICAgICBmb3IobGV0IGkgPTA7cHJvamVjdExpc3QubGVuZ3RoO2krKyl7XHJcbiAgICAgICAgICAgIGlmKHByb2plY3RMaXN0W2ldLnByb2plY3ROYW1lID09PSBuYW1lICl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7cHJvamVjdExpc3R9XHJcbn0pKCk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBnZXRUb2RvOyIsImNvbnN0IHByb2plY3RBcnJheSA9ICgoKT0+e1xyXG5cclxuICAgIGNvbnN0IGxpc3RJdGVtID0gKG5hbWUsbm90ZSxkYXRlKT0+e1xyXG4gICAgICAgIGxldCBpdGVtTmFtZSA9IG5hbWU7XHJcbiAgICAgICAgbGV0IGl0ZW1Ob3RlID0gbm90ZTtcclxuICAgICAgICBsZXQgaXRlbURhdGUgPSBkYXRlXHJcbiAgICAgICAgbGV0IGNvbXBsZXRlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICByZXR1cm57XHJcbiAgICAgICAgICAgIGl0ZW1OYW1lLFxyXG4gICAgICAgICAgICBpdGVtTm90ZSxcclxuICAgICAgICAgICAgaXRlbURhdGUsXHJcbiAgICAgICAgICAgIGNvbXBsZXRlZFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBwcm9qZWN0ID0obmFtZSxsaXN0SXRlbSk9PntcclxuICAgICAgICBsZXQgcHJvamVjdE5hbWUgPSBuYW1lO1xyXG4gICAgICAgIGxldCBwcm9qZWN0Q29udGVudCA9IGxpc3RJdGVtXHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJue1xyXG4gICAgICAgICAgICBwcm9qZWN0TmFtZSxcclxuICAgICAgICAgICAgcHJvamVjdENvbnRlbnRcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBsaXN0SXRlbSxcclxuICAgICAgICBwcm9qZWN0XHJcbiAgICB9XHJcbn0pKCk7XHJcblxyXG5cclxuXHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgcHJvamVjdEFycmF5OyIsImltcG9ydCBnZXRUb2RvIGZyb20gXCIuL2dldFRvZG9cIjtcclxuaW1wb3J0IERPTW1hbmFnZW1lbnQgZnJvbSBcIi4vbWFuYWdlRE9NXCI7XHJcbmltcG9ydCBwcm9qZWN0QXJyYXkgZnJvbSBcIi4vbGlzdEl0ZW1PYmplY3RcIjtcclxuXHJcbmNvbnN0IHN0b3JhZ2VNYW5hbmdlbWVudCA9ICgoKT0+e1xyXG4gICAgY29uc3Qgc2V0U3RvcmFnZSA9ICgpPT57XHJcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJzdG9yZWRJbmZvXCIsIEpTT04uc3RyaW5naWZ5KGdldFRvZG8ucHJvamVjdExpc3QpKVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywoKT0+e1xyXG4gICAgICAgIGxldCBwYXJzZWRJbmZvICA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJzdG9yZWRJbmZvXCIpKSB8fCBbXVxyXG4gICAgICAgIHBhcnNlZEluZm8uZm9yRWFjaChlbGVtZW50ID0+IHtcclxuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnByb2plY3ROYW1lJykudGV4dENvbnRlbnQgPSBlbGVtZW50LnByb2plY3ROYW1lXHJcbiAgICAgICAgICAgIGdldFRvZG8ucHJvamVjdExpc3QucHVzaChlbGVtZW50KTtcclxuICAgXHJcbiAgICAgICAgfSlcclxuICAgICAgICBsb2FkKClcclxuICAgIH0pXHJcblxyXG4gICAgZnVuY3Rpb24gbG9hZCgpe1xyXG4gICAgICAgIGlmKGdldFRvZG8ucHJvamVjdExpc3QubGVuZ3RoID09PSAwKXtcclxuICAgICAgICBnZXRUb2RvLnByb2plY3RMaXN0WzBdID0gcHJvamVjdEFycmF5LnByb2plY3QoKVxyXG4gICAgICAgIGdldFRvZG8ucHJvamVjdExpc3RbMF0ucHJvamVjdE5hbWUgPSAnTXkgcHJvamVjdCdcclxuICAgICAgICBnZXRUb2RvLnByb2plY3RMaXN0WzBdLnByb2plY3RDb250ZW50ID0gW11cclxuICAgICAgICBET01tYW5hZ2VtZW50LmFwcGVuZFByb2plY3QoZ2V0VG9kby5wcm9qZWN0TGlzdCwnbmV3UHJvamVjdCcpXHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIGdldFRvZG8ucHJvamVjdExpc3QuZm9yRWFjaChlbGVtZW50PT57RE9NbWFuYWdlbWVudC5hcHBlbmRQcm9qZWN0KGVsZW1lbnQpfSlcclxuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnByb2plY3ROYW1lJykudGV4dENvbnRlbnQgPSBnZXRUb2RvLnByb2plY3RMaXN0WzBdLnByb2plY3ROYW1lO1xyXG4gICAgICAgICAgICBnZXRUb2RvLnByb2plY3RMaXN0WzBdLnByb2plY3RDb250ZW50LmZvckVhY2goZWxlbWVudCA9PiB7XHJcbiAgICAgICAgICAgICAgICBET01tYW5hZ2VtZW50LmFwcGVuZExpc3QoZWxlbWVudClcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBzZXRTdG9yYWdlXHJcbiAgICB9XHJcbn0pKCk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBzdG9yYWdlTWFuYW5nZW1lbnRcclxuIiwiaW1wb3J0IGdldFRvZG8gZnJvbSBcIi4vZ2V0VG9kb1wiO1xyXG5pbXBvcnQgc3RvcmFnZU1hbmFuZ2VtZW50IGZyb20gXCIuL2xvY2FsU3RvcmFnZVwiO1xyXG5cclxuY29uc3QgRE9NbWFuYWdlbWVudCA9ICgoKT0+e1xyXG5cclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5uZXdUb2RvJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCgpPT57XHJcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmZvcm1CYWNrZ3JvdW5kJykuY2xhc3NMaXN0LnRvZ2dsZSgnc2hvdycpO1xyXG4gICAgICAgIGNsb3NlRm9ybSgnLmZvcm1CYWNrZ3JvdW5kJylcclxuICAgIH0pXHJcblxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2FkZFByb2plY3QnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsKCk9PntcclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucHJvamVjdEZvcm1CYWNrZ3JvdW5kJykuY2xhc3NMaXN0LnRvZ2dsZSgnc2hvdycpXHJcbiAgICAgICAgY2xvc2VGb3JtKCcucHJvamVjdEZvcm1CYWNrZ3JvdW5kJylcclxuICAgIH0pXHJcblxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNsb3NlRm9ybScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywoKT0+e1xyXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNmb3JtJykucmVzZXQoKVxyXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5mb3JtQmFja2dyb3VuZCcpLmNsYXNzTGlzdC5yZW1vdmUoJ3Nob3cnKVxyXG4gICAgfSlcclxuXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY2xvc2VQcm9qZWN0Rm9ybScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywoKT0+e1xyXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNwcm9qZWN0Zm9ybScpLnJlc2V0KClcclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucHJvamVjdEZvcm1CYWNrZ3JvdW5kJykuY2xhc3NMaXN0LnJlbW92ZSgnc2hvdycpXHJcbiAgICB9KVxyXG4gICAgXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubWVudV9idXR0b24nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsKCk9PntcclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubWVudV9idXR0b24nKS5jbGFzc0xpc3QudG9nZ2xlKCdvcGVuJylcclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2lkZUJhcicpLmNsYXNzTGlzdC50b2dnbGUoJ29wZW4nKVxyXG4gICAgfSlcclxuXHJcbiAgICBjb25zdCBhcHBlbmRMaXN0ID0gKGl0ZW1MaXN0KT0+e1xyXG4gICAgICAgIGNvbnN0IGNvbnRhaW5lciA9ICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuaXRlbUNvbnRhaW5lcicpO1xyXG4gICAgICAgIGxldCBpdGVtRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgaXRlbURpdi5jbGFzc0xpc3QuYWRkKCdpdGVtJylcclxuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoaXRlbURpdik7XHJcblxyXG4gICAgICAgIGFkZENoZWNrYm94KGl0ZW1EaXYpO1xyXG5cclxuICAgICAgICBsZXQgbmFtZURpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXHJcbiAgICAgICAgbmFtZURpdi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsZWRpdENvbnRlbnQuYmluZChudWxsLCdpbnB1dCcsbmFtZURpdikpO1xyXG4gICAgICAgIG5hbWVEaXYuY2xhc3NMaXN0LmFkZCgnbmFtZScpXHJcbiAgICAgICAgaXRlbURpdi5hcHBlbmRDaGlsZChuYW1lRGl2KVxyXG4gICAgICAgIG5hbWVEaXYudGV4dENvbnRlbnQgPSBpdGVtTGlzdC5pdGVtTmFtZVxyXG5cclxuICAgICAgICBhZGREYXRlUGlja2VyKGl0ZW1MaXN0LGl0ZW1EaXYpO1xyXG5cclxuICAgICAgICBjaGFuZ2VTdGF0dXNET00oaXRlbUxpc3QsaXRlbURpdilcclxuXHJcbiAgICAgICAgbGV0IG5vdGVEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxyXG4gICAgICAgIG5vdGVEaXYuY2xhc3NMaXN0LmFkZCgnbm90ZScpXHJcbiAgICAgICAgbm90ZURpdi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsZWRpdENvbnRlbnQuYmluZChudWxsLCd0ZXh0YXJlYScsbm90ZURpdikpO1xyXG4gICAgICAgIGl0ZW1EaXYuYXBwZW5kQ2hpbGQobm90ZURpdilcclxuICAgICAgICBub3RlRGl2LnRleHRDb250ZW50ID0gaXRlbUxpc3QuaXRlbU5vdGVcclxuXHJcbiAgICAgICAgbGV0IGFycm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYXJyb3cnKVxyXG4gICAgICAgIGFycm93LmNsYXNzTGlzdC5hZGQoJ2Fycm93JylcclxuICAgICAgICBhcnJvdy5pbm5lckhUTUwgPSBgPGkgY2xhc3M9XCJmYXMgZmEtYW5nbGUtcmlnaHRcIj48L2k+YFxyXG4gICAgICAgIGFycm93LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJyxzaG93Tm90ZSk7XHJcbiAgICAgICAgaXRlbURpdi5hcHBlbmRDaGlsZChhcnJvdylcclxuICAgICAgICBhZGRCdXR0b24oaXRlbURpdik7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gYWRkQ2hlY2tib3goaXRlbURpdil7XHJcbiAgICAgICAgbGV0IG5ld0NoZWNrYm94ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKVxyXG4gICAgICAgIG5ld0NoZWNrYm94LnR5cGUgPSAnY2hlY2tib3gnO1xyXG4gICAgICAgIG5ld0NoZWNrYm94LmNsYXNzTGlzdC5hZGQoJ2NoZWNrYm94JylcclxuICAgICAgICBuZXdDaGVja2JveC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsY2hhbmdlU3RhdHVzKVxyXG4gICAgICAgIGl0ZW1EaXYuaW5zZXJ0QmVmb3JlKG5ld0NoZWNrYm94LGl0ZW1EaXYuZmlyc3RDaGlsZCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gYWRkQnV0dG9uKGl0ZW1EaXYpe1xyXG4gICAgICAgIGxldCBpdGVtRGVsZXRlQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgaXRlbURlbGV0ZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGRlbGV0ZUJ1dHRvbik7XHJcbiAgICAgICAgaXRlbURlbGV0ZUJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdpdGVtRGVsZXRlJyk7XHJcbiAgICAgICAgaXRlbURlbGV0ZUJ1dHRvbi5pbm5lckhUTUw9ICc8aSBjbGFzcz1cImZhcyBmYS10cmFzaFwiPjwvaT4nXHJcbiAgICAgICAgaXRlbURpdi5hcHBlbmRDaGlsZChpdGVtRGVsZXRlQnV0dG9uKTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgZnVuY3Rpb24gYWRkRGF0ZVBpY2tlcihpdGVtTGlzdCxpdGVtRGl2KXtcclxuICAgICAgICBsZXQgZGF0ZUlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcclxuICAgICAgICBkYXRlSW5wdXQuY2xhc3NMaXN0LmFkZCgnZGF0ZVRleHQnKVxyXG4gICAgICAgIGRhdGVJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsZWRpdERhdGUuYmluZChudWxsLGl0ZW1MaXN0LGl0ZW1EaXYpKVxyXG4gICAgICAgIGRhdGVJbnB1dC50ZXh0Q29udGVudCA9IGl0ZW1MaXN0Lml0ZW1EYXRlXHJcbiAgICAgICAgaXRlbURpdi5hcHBlbmRDaGlsZChkYXRlSW5wdXQpXHJcbiAgICB9XHJcblxyXG4gICAgXHJcbiAgICBmdW5jdGlvbiBkZWxldGVCdXR0b24oZXZlbnQpe1xyXG4gICAgICAgIGxldCBjdXJyZW50UHJvamVjdCA9IHNldEN1cnJlbnRQcm9qZWN0KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wcm9qZWN0TmFtZScpLnRleHRDb250ZW50KVxyXG4gICAgICAgbGV0IHRvZG8gPSBldmVudC50YXJnZXQucGFyZW50Tm9kZS5wYXJlbnROb2RlXHJcbiAgICAgICBsZXQgdG9kb05hbWUgPSB0b2RvLnF1ZXJ5U2VsZWN0b3IoJy5uYW1lJykudGV4dENvbnRlbnQ7XHJcbiAgICAgICBmb3IobGV0IGkgPSAwO2k8Z2V0VG9kby5wcm9qZWN0TGlzdFtjdXJyZW50UHJvamVjdF0ucHJvamVjdENvbnRlbnQubGVuZ3RoO2krKylcclxuICAgICAgICBpZihnZXRUb2RvLnByb2plY3RMaXN0W2N1cnJlbnRQcm9qZWN0XS5wcm9qZWN0Q29udGVudFtpXS5pdGVtTmFtZSA9PSB0b2RvTmFtZSl7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBnZXRUb2RvLnByb2plY3RMaXN0W2N1cnJlbnRQcm9qZWN0XS5wcm9qZWN0Q29udGVudC5zcGxpY2UoaSwxKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdG9kby5yZW1vdmUoKVxyXG4gICAgICAgIHN0b3JhZ2VNYW5hbmdlbWVudC5zZXRTdG9yYWdlKCk7XHJcbiAgICB9IFxyXG4gICAgICAgXHJcbiAgICAgICAgXHJcblxyXG5cclxuICAgIGNvbnN0IGNsb3NlRm9ybT0oYmFja2dyb3VuZCk9PntcclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGJhY2tncm91bmQpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJyxmdW5jdGlvbihlKXtcclxuICAgICAgICAgICAgaWYoZS50YXJnZXQgIT09IGUuY3VycmVudFRhcmdldCkgcmV0dXJuXHJcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNmb3JtJykucmVzZXQoKVxyXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGJhY2tncm91bmQpLmNsYXNzTGlzdC5yZW1vdmUoJ3Nob3cnKVxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZWRpdENvbnRlbnQ9KHR5cGUsbmFtZSk9PntcclxuICAgICAgICBjb25zdCBuYW1lRGl2ID0gbmFtZTtcclxuICAgICAgICBjb25zdCBpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodHlwZSlcclxuICAgICAgICBpbnB1dC52YWx1ZSA9IG5hbWVEaXYudGV4dENvbnRlbnQ7XHJcbiAgICAgICAgbGV0IHRlbXAgPSBuYW1lRGl2LnRleHRDb250ZW50O1xyXG4gICAgICAgIG5hbWVEaXYudGV4dENvbnRlbnQgPSAnJztcclxuICAgICAgICBpbnB1dC5jbGFzc0xpc3QuYWRkKCdpbnB1dCcpXHJcbiAgICAgICAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXNvdXQnLGNvbmZpcm1FZGl0LmJpbmQobnVsbCxpbnB1dCxuYW1lRGl2LHRlbXAsdHlwZSkpXHJcbiAgICAgICAgbmFtZURpdi5hcHBlbmRDaGlsZChpbnB1dClcclxuICAgICAgICBpbnB1dC5mb2N1cygpXHJcbiAgICAgICAgbmFtZURpdi5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsKGV2ZW50KT0+e1xyXG4gICAgICAgICAgICBpZihldmVudC5rZXlDb2RlPT0xMyl7aW5wdXQuYmx1cigpfX0pXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgY29uZmlybUVkaXQ9KGlucHV0LG5hbWVEaXYsdGVtcCx0eXBlKT0+e1xyXG4gICAgICAgIGxldCBpdGVtVHlwZTtcclxuICAgICAgICBjb25zdCBwcm9qZWN0TmFtZSA9ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnByb2plY3ROYW1lJykudGV4dENvbnRlbnRcclxuICAgICAgICBmb3IobGV0IGk9MDtpPGdldFRvZG8ucHJvamVjdExpc3QubGVuZ3RoO2krKyl7XHJcbiAgICAgICAgICAgIGlmKHByb2plY3ROYW1lID09PSBnZXRUb2RvLnByb2plY3RMaXN0W2ldLnByb2plY3ROYW1lKXtcclxuICAgICAgICAgICAgICAgIGZvcihsZXQgaiA9IDA7aTxnZXRUb2RvLnByb2plY3RMaXN0W2ldLnByb2plY3RDb250ZW50Lmxlbmd0aDtqKyspe1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKHR5cGUgPT09ICdpbnB1dCcpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtVHlwZSA9IGdldFRvZG8ucHJvamVjdExpc3RbaV0ucHJvamVjdENvbnRlbnRbal0uaXRlbU5hbWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ2V0VG9kby5wcm9qZWN0TGlzdFtpXS5wcm9qZWN0Q29udGVudFtqXS5pdGVtTmFtZSA9IGlucHV0LnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1lbHNlIGlmICh0eXBlID09PSAndGV4dGFyZWEnKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbVR5cGUgPSBnZXRUb2RvLnByb2plY3RMaXN0W2ldLnByb2plY3RDb250ZW50W2pdLml0ZW1Ob3RlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldFRvZG8ucHJvamVjdExpc3RbaV0ucHJvamVjdENvbnRlbnRbal0uaXRlbU5vdGUgPSBpbnB1dC52YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYoaXRlbVR5cGUgPT09IHRlbXApe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtVHlwZSA9IGlucHV0LnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lRGl2LnRleHRDb250ZW50ID0gaW5wdXQudmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0b3JhZ2VNYW5hbmdlbWVudC5zZXRTdG9yYWdlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0LnJlbW92ZSgpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBlZGl0RGF0ZSA9IChpdGVtTGlzdCxpdGVtRGl2KT0+e1xyXG4gICAgICAgY29uc3QgZGF0ZURpdiA9ICBpdGVtRGl2LnF1ZXJ5U2VsZWN0b3IoJy5kYXRlVGV4dCcpXHJcbiAgICAgICBjb25zdCBkYXRlSW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpXHJcbiAgICAgICBkYXRlSW5wdXQudHlwZSA9ICdkYXRlJ1xyXG4gICAgICAgZGF0ZUlucHV0LmNsYXNzTGlzdC5hZGQoJ2RhdGUnKVxyXG4gICAgICAgZGF0ZUlucHV0LnZhbHVlID0gZGF0ZURpdi50ZXh0Q29udGVudFxyXG4gICAgICAgZGF0ZURpdi5yZW1vdmUoKVxyXG4gICAgICAgZGF0ZUlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3Vzb3V0JywgY29uZmlybURhdGVFZGl0LmJpbmQobnVsbCxpdGVtTGlzdCxpdGVtRGl2LGRhdGVJbnB1dCkpXHJcbiAgICAgICBpdGVtRGl2LmFwcGVuZENoaWxkKGRhdGVJbnB1dClcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBjb25maXJtRGF0ZUVkaXQgPShpdGVtTGlzdCxpdGVtRGl2LGRhdGVJbnB1dCk9PntcclxuICAgICAgICBpdGVtTGlzdC5pdGVtRGF0ZSA9IGRhdGVJbnB1dC52YWx1ZVxyXG4gICAgICAgIHN0b3JhZ2VNYW5hbmdlbWVudC5zZXRTdG9yYWdlKCk7XHJcbiAgICAgICAgYWRkRGF0ZVBpY2tlcihpdGVtTGlzdCxpdGVtRGl2KVxyXG4gICAgICAgIGRhdGVJbnB1dC5yZW1vdmUoKVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHNob3dOb3RlID0gKGV2ZW50KT0+e1xyXG4gICAgICAgIGxldCBpdGVtID0gZXZlbnQudGFyZ2V0LnBhcmVudE5vZGUucGFyZW50Tm9kZTtcclxuICAgICAgICBpdGVtLnF1ZXJ5U2VsZWN0b3IoJy5ub3RlJykuY2xhc3NMaXN0LnRvZ2dsZSgnc2hvdycpXHJcbiAgICAgICAgaWYoaXRlbS5xdWVyeVNlbGVjdG9yKCcubm90ZScpLmNsYXNzTGlzdC5jb250YWlucygnc2hvdycpKXtcclxuICAgICAgICAgICAgaXRlbS5xdWVyeVNlbGVjdG9yKCcuYXJyb3cnKS5pbm5lckhUTUwgPSBgPGkgY2xhc3M9XCJmYXMgZmEtYW5nbGUtZG93blwiPjwvaT5gXHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIGl0ZW0ucXVlcnlTZWxlY3RvcignYXJyb3cnKS5pbm5lckhUTUwgPSBgPGkgY2xhc3M9XCJmYXMgZmEtYW5nbGUtcmlnaHRcIj48L2k+YFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBhcHBlbmRQcm9qZWN0ID0gKHByb2plY3RMaXN0LHNvdXJjZSk9PntcclxuICAgICAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucHJvamVjdENvbnRhaW5lcicpO1xyXG4gICAgICAgIGNvbnN0IHByb2plY3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICBwcm9qZWN0LmNsYXNzTGlzdC5hZGQoJ3NpZGVCYXJQcm9qZWN0JylcclxuICAgICAgICBjb25zdCBuYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpXHJcbiAgICAgICAgaWYoc291cmNlID09PSAnbmV3UHJvamVjdCcpe1xyXG4gICAgICAgICAgICBuYW1lLnRleHRDb250ZW50ID0gcHJvamVjdExpc3RbcHJvamVjdExpc3QubGVuZ3RoLTFdLnByb2plY3ROYW1lIFxyXG4gICAgICAgIH1lbHNlKFxyXG4gICAgICAgICAgICBuYW1lLnRleHRDb250ZW50ID0gcHJvamVjdExpc3QucHJvamVjdE5hbWVcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICBuYW1lLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJyxjaGFuZ2VQcm9qZWN0KVxyXG4gICAgICAgIGNvbnN0IGRlbGV0ZUljb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICBkZWxldGVJY29uLmlubmVySFRNTCA9IGA8aSBjbGFzcz1cImZhcyBmYS10aW1lc1wiPjwvaT5gXHJcbiAgICAgICAgZGVsZXRlSWNvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsZGVsZXRlUHJvamVjdClcclxuICAgICAgICBkZWxldGVJY29uLmNsYXNzTGlzdC5hZGQoJ2RlbGV0ZVByb2plY3QnKVxyXG4gICAgICAgIHByb2plY3QuYXBwZW5kQ2hpbGQobmFtZSlcclxuICAgICAgICBwcm9qZWN0LmFwcGVuZENoaWxkKGRlbGV0ZUljb24pXHJcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHByb2plY3QpXHJcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnByb2plY3ROYW1lJykudGV4dENvbnRlbnQgPSBuYW1lLnRleHRDb250ZW50XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZGVsZXRlUHJvamVjdD0oZXZlbnQpPT57XHJcbiAgICAgICAgY29uc3QgcHJvamVjdENvbnRhaW5lciA9IGV2ZW50LnRhcmdldC5wYXJlbnROb2RlLnBhcmVudE5vZGVcclxuICAgICAgICBjb25zdCBwcm9qZWN0TmFtZSA9IHByb2plY3RDb250YWluZXIucXVlcnlTZWxlY3RvcigncCcpLnRleHRDb250ZW50XHJcbiAgICAgICAgZm9yKGxldCBpPTA7aTxnZXRUb2RvLnByb2plY3RMaXN0Lmxlbmd0aDtpKyspe1xyXG4gICAgICAgICAgICBpZihnZXRUb2RvLnByb2plY3RMaXN0W2ldLnByb2plY3ROYW1lID09PSBwcm9qZWN0TmFtZSl7XHJcbiAgICAgICAgICAgICAgICBnZXRUb2RvLnByb2plY3RMaXN0LnNwbGljZShpLDEpO1xyXG4gICAgICAgICAgICAgICAgd2hpbGUoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLml0ZW1Db250YWluZXInKS5maXJzdENoaWxkKXtkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuaXRlbUNvbnRhaW5lcicpLmZpcnN0Q2hpbGQucmVtb3ZlKCl9XHJcbiAgICAgICAgICAgICAgICBpZihpKzE8Z2V0VG9kby5wcm9qZWN0TGlzdC5sZW5ndGgpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhpKzEsZ2V0VG9kby5wcm9qZWN0TGlzdC5sZW5ndGgpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wcm9qZWN0TmFtZScpLnRleHRDb250ZW50ID0gZ2V0VG9kby5wcm9qZWN0TGlzdFtpKzFdLnByb2plY3ROYW1lXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaj0wO2o8Z2V0VG9kby5wcm9qZWN0TGlzdFtpKzFdLnByb2plY3RDb250ZW50W2pdLmxlbmd0aDtqKyspe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHBlbmRMaXN0KGdldFRvZG8ucHJvamVjdExpc3RbaSsxXS5wcm9qZWN0Q29udGVudFtqXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wcm9qZWN0TmFtZScpLnRleHRDb250ZW50ID0gZ2V0VG9kby5wcm9qZWN0TGlzdFtpLTFdLnByb2plY3ROYW1lXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yKGxldCBqPTA7ajxnZXRUb2RvLnByb2plY3RMaXN0W2ktMV0ucHJvamVjdENvbnRlbnQubGVuZ3RoO2orKyl7XHJcbiAgICAgICAgICAgICAgICAgICAgYXBwZW5kTGlzdChnZXRUb2RvLnByb2plY3RMaXN0W2ktMV0ucHJvamVjdENvbnRlbnRbal0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcHJvamVjdENvbnRhaW5lci5yZW1vdmUoKVxyXG4gICAgICAgIHN0b3JhZ2VNYW5hbmdlbWVudC5zZXRTdG9yYWdlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGNoYW5nZVByb2plY3QgPSAoZXZlbnQpPT57XHJcbiAgICAgICAgbGV0IG5hbWUgPSBldmVudC50YXJnZXQuZmlyc3RDaGlsZC50ZXh0Q29udGVudDtcclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucHJvamVjdE5hbWUnKS50ZXh0Q29udGVudCA9IG5hbWU7XHJcblxyXG4gICAgICAgIGxldCBjdXJyZW50UHJvamVjdD0gc2V0Q3VycmVudFByb2plY3QobmFtZSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgd2hpbGUoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLml0ZW1Db250YWluZXInKS5maXJzdENoaWxkKXtcclxuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLml0ZW1Db250YWluZXInKS5sYXN0Q2hpbGQucmVtb3ZlKClcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgZm9yKGxldCBpID0gMDtpPGdldFRvZG8ucHJvamVjdExpc3RbY3VycmVudFByb2plY3RdLnByb2plY3RDb250ZW50Lmxlbmd0aDtpKyspe1xyXG4gICAgICAgICAgICBhcHBlbmRMaXN0KGdldFRvZG8ucHJvamVjdExpc3RbY3VycmVudFByb2plY3RdLnByb2plY3RDb250ZW50W2ldKVxyXG4gICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNvbnN0IHNldEN1cnJlbnRQcm9qZWN0PShuYW1lKSA9PntcclxuICAgICAgICBmb3IobGV0IGkgPSAwOyBpPGdldFRvZG8ucHJvamVjdExpc3QubGVuZ3RoO2krKyl7XHJcbiAgICAgICAgICAgIGlmKGdldFRvZG8ucHJvamVjdExpc3RbaV0ucHJvamVjdE5hbWUgPT09IG5hbWUpe1xyXG4gICAgICAgICAgICAgICAgIHJldHVybiAgaTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBjaGFuZ2VTdGF0dXM9KGV2ZW50KT0+e1xyXG4gICAgICAgIGlmKGV2ZW50LnRhcmdldCAhPT0gZXZlbnQuY3VycmVudFRhcmdldCkgcmV0dXJuXHJcbiAgICAgICAgbGV0IGl0ZW0gPSBldmVudC50YXJnZXQucGFyZW50Tm9kZVxyXG4gICAgICAgIGxldCBpdGVtTmFtZSA9IGl0ZW0ucXVlcnlTZWxlY3RvcignLm5hbWUnKS50ZXh0Q29udGVudFxyXG4gICAgICAgIGNvbnN0IHByb2plY3ROYW1lID1kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucHJvamVjdE5hbWUnKS50ZXh0Q29udGVudFxyXG4gICAgICAgIGZvcihsZXQgaT0wO2k8Z2V0VG9kby5wcm9qZWN0TGlzdC5sZW5ndGg7aSsrKXtcclxuICAgICAgICAgICAgaWYocHJvamVjdE5hbWUgPT09IGdldFRvZG8ucHJvamVjdExpc3RbaV0ucHJvamVjdE5hbWUpe1xyXG4gICAgICAgICAgICAgICAgZm9yKGxldCBqID0gMDtqPGdldFRvZG8ucHJvamVjdExpc3RbaV0ucHJvamVjdENvbnRlbnQubGVuZ3RoO2orKyl7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYoZ2V0VG9kby5wcm9qZWN0TGlzdFtpXS5wcm9qZWN0Q29udGVudFtqXS5pdGVtTmFtZSA9PT0gaXRlbU5hbWUpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGFuZ2VTdGF0dXNET00oZ2V0VG9kby5wcm9qZWN0TGlzdFtpXS5wcm9qZWN0Q29udGVudFtqXSxpdGVtLCd0cnVlJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGNoYW5nZVN0YXR1c0RPTT0oaXRlbSxpdGVtRGl2LHNvdXJjZSk9PntcclxuICAgICAgICBpZihzb3VyY2UgPT09ICd0cnVlJyl7XHJcbiAgICAgICAgICAgIGl0ZW0uY29tcGxldGVkID0gIWl0ZW0uY29tcGxldGVkXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKGl0ZW0uY29tcGxldGVkKXtcclxuICAgICAgICAgICAgaXRlbURpdi5xdWVyeVNlbGVjdG9yKCcubmFtZScpLmNsYXNzTGlzdC5hZGQoJ3N0cmlrZScpXHJcbiAgICAgICAgICAgIGl0ZW1EaXYuc3R5bGUuYmFja2dyb3VuZCA9ICcjNGJiNDRiJ1xyXG4gICAgICAgICAgICBjb25zdCBjaGVja2VkSWNvbiA9ICBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxyXG4gICAgICAgICAgICBjaGVja2VkSWNvbi5pbm5lckhUTUwgPSBgPGkgY2xhc3M9XCJmYXMgZmEtY2hlY2tcIj48L2k+YFxyXG4gICAgICAgICAgICBjaGVja2VkSWNvbi5jbGFzc0xpc3QuYWRkKCdjaGVja2VkSWNvbicpXHJcbiAgICAgICAgICAgIGNoZWNrZWRJY29uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJyx1bmNoZWNrLmJpbmQobnVsbCxpdGVtLGl0ZW1EaXYpKVxyXG4gICAgICAgICAgICBpdGVtRGl2Lmluc2VydEJlZm9yZShjaGVja2VkSWNvbixpdGVtRGl2LnF1ZXJ5U2VsZWN0b3IoJy5uYW1lJykpXHJcbiAgICAgICAgICAgIGl0ZW1EaXYucXVlcnlTZWxlY3RvcignLmNoZWNrYm94Jykuc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nXHJcbiAgICAgICAgfWVsc2UgaWYoIWl0ZW0uY29tcGxldGVkKXsgXHJcbiAgICAgICAgICAgIGl0ZW1EaXYucXVlcnlTZWxlY3RvcignLm5hbWUnKS5jbGFzc0xpc3QucmVtb3ZlKCdzdHJpa2UnKVxyXG4gICAgICAgICAgICBpdGVtRGl2LnN0eWxlLmJhY2tncm91bmQgPSBgIzAwMDAwMGBcclxuICAgICAgICAgICAgaXRlbURpdi5xdWVyeVNlbGVjdG9yKCcuY2hlY2tib3gnKS5zdHlsZS52aXNpYmlsaXR5ID0gJ3Zpc2libGUnXHJcbiAgICAgICAgICAgIGl0ZW1EaXYucXVlcnlTZWxlY3RvcignLmNoZWNrYm94JykuY2hlY2tlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBpZihpdGVtRGl2LnF1ZXJ5U2VsZWN0b3IoJy5jaGVja2VkSWNvbicpICE9PSBudWxsKSBpdGVtRGl2LnF1ZXJ5U2VsZWN0b3IoJy5jaGVja2VkSWNvbicpLnJlbW92ZSgpXHJcbiAgICAgICAgfSAgICBcclxuICAgICAgICAgICAgc3RvcmFnZU1hbmFuZ2VtZW50LnNldFN0b3JhZ2UoKTtcclxuICAgIH1cclxuXHJcbiAgICBcclxuICAgIGNvbnN0IHVuY2hlY2s9KGl0ZW0saXRlbURpdik9PntcclxuICAgICAgICBpdGVtRGl2LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0Jykuc3R5bGUudmlzaWJpbGl0eSA9ICd2aXNpYmxlJ1xyXG4gICAgICAgIGNoYW5nZVN0YXR1c0RPTShpdGVtLGl0ZW1EaXYsJ3RydWUnKVxyXG4gICAgfVxyXG4gICAgICAgIFxyXG5cclxuXHJcbiAgICAgcmV0dXJuIHthcHBlbmRMaXN0LFxyXG4gICAgICAgICAgICBhcHBlbmRQcm9qZWN0XHJcbiAgICAgICAgICAgIH1cclxufSkoKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IERPTW1hbmFnZW1lbnQ7IiwiLyogKGlnbm9yZWQpICovIiwiLyogKGlnbm9yZWQpICovIiwiLyogKGlnbm9yZWQpICovIiwiLyogKGlnbm9yZWQpICovIiwiLyogKGlnbm9yZWQpICovIiwibGV0IHVybEFscGhhYmV0ID1cbiAgJ3VzZWFuZG9tLTI2VDE5ODM0MFBYNzVweEpBQ0tWRVJZTUlOREJVU0hXT0xGX0dRWmJmZ2hqa2xxdnd5enJpY3QnXG5sZXQgY3VzdG9tQWxwaGFiZXQgPSAoYWxwaGFiZXQsIHNpemUpID0+IHtcbiAgcmV0dXJuICgpID0+IHtcbiAgICBsZXQgaWQgPSAnJ1xuICAgIGxldCBpID0gc2l6ZVxuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgIGlkICs9IGFscGhhYmV0WyhNYXRoLnJhbmRvbSgpICogYWxwaGFiZXQubGVuZ3RoKSB8IDBdXG4gICAgfVxuICAgIHJldHVybiBpZFxuICB9XG59XG5sZXQgbmFub2lkID0gKHNpemUgPSAyMSkgPT4ge1xuICBsZXQgaWQgPSAnJ1xuICBsZXQgaSA9IHNpemVcbiAgd2hpbGUgKGktLSkge1xuICAgIGlkICs9IHVybEFscGhhYmV0WyhNYXRoLnJhbmRvbSgpICogNjQpIHwgMF1cbiAgfVxuICByZXR1cm4gaWRcbn1cbm1vZHVsZS5leHBvcnRzID0geyBuYW5vaWQsIGN1c3RvbUFscGhhYmV0IH1cbiIsImltcG9ydCBwb3N0Y3NzIGZyb20gJy4vcG9zdGNzcy5qcydcblxuZXhwb3J0IGRlZmF1bHQgcG9zdGNzc1xuXG5leHBvcnQgY29uc3Qgc3RyaW5naWZ5ID0gcG9zdGNzcy5zdHJpbmdpZnlcbmV4cG9ydCBjb25zdCBmcm9tSlNPTiA9IHBvc3Rjc3MuZnJvbUpTT05cbmV4cG9ydCBjb25zdCBwbHVnaW4gPSBwb3N0Y3NzLnBsdWdpblxuZXhwb3J0IGNvbnN0IHBhcnNlID0gcG9zdGNzcy5wYXJzZVxuZXhwb3J0IGNvbnN0IGxpc3QgPSBwb3N0Y3NzLmxpc3RcblxuZXhwb3J0IGNvbnN0IGRvY3VtZW50ID0gcG9zdGNzcy5kb2N1bWVudFxuZXhwb3J0IGNvbnN0IGNvbW1lbnQgPSBwb3N0Y3NzLmNvbW1lbnRcbmV4cG9ydCBjb25zdCBhdFJ1bGUgPSBwb3N0Y3NzLmF0UnVsZVxuZXhwb3J0IGNvbnN0IHJ1bGUgPSBwb3N0Y3NzLnJ1bGVcbmV4cG9ydCBjb25zdCBkZWNsID0gcG9zdGNzcy5kZWNsXG5leHBvcnQgY29uc3Qgcm9vdCA9IHBvc3Rjc3Mucm9vdFxuXG5leHBvcnQgY29uc3QgQ3NzU3ludGF4RXJyb3IgPSBwb3N0Y3NzLkNzc1N5bnRheEVycm9yXG5leHBvcnQgY29uc3QgRGVjbGFyYXRpb24gPSBwb3N0Y3NzLkRlY2xhcmF0aW9uXG5leHBvcnQgY29uc3QgQ29udGFpbmVyID0gcG9zdGNzcy5Db250YWluZXJcbmV4cG9ydCBjb25zdCBQcm9jZXNzb3IgPSBwb3N0Y3NzLlByb2Nlc3NvclxuZXhwb3J0IGNvbnN0IERvY3VtZW50ID0gcG9zdGNzcy5Eb2N1bWVudFxuZXhwb3J0IGNvbnN0IENvbW1lbnQgPSBwb3N0Y3NzLkNvbW1lbnRcbmV4cG9ydCBjb25zdCBXYXJuaW5nID0gcG9zdGNzcy5XYXJuaW5nXG5leHBvcnQgY29uc3QgQXRSdWxlID0gcG9zdGNzcy5BdFJ1bGVcbmV4cG9ydCBjb25zdCBSZXN1bHQgPSBwb3N0Y3NzLlJlc3VsdFxuZXhwb3J0IGNvbnN0IElucHV0ID0gcG9zdGNzcy5JbnB1dFxuZXhwb3J0IGNvbnN0IFJ1bGUgPSBwb3N0Y3NzLlJ1bGVcbmV4cG9ydCBjb25zdCBSb290ID0gcG9zdGNzcy5Sb290XG5leHBvcnQgY29uc3QgTm9kZSA9IHBvc3Rjc3MuTm9kZVxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgZ2V0VG9kbyBmcm9tICcuL2NvbXBvbmVudHMvZ2V0VG9kbydcclxuaW1wb3J0IERPTW1hbmFnZW1lbnQgZnJvbSAnLi9jb21wb25lbnRzL21hbmFnZURPTSdcclxuaW1wb3J0IHByb2plY3RBcnJheSBmcm9tICcuL2NvbXBvbmVudHMvbGlzdEl0ZW1PYmplY3QnXHJcblxyXG5cclxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9