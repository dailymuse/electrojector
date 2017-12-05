const path = require('path')

class Electrojector {
  constructor () {
    this.deps = {}
    this.isDone = false
  }

  static scope () {
    return new this().scope()
  }

  scope () {
    return {
      deps: this.deps,
      init: new Proxy({}, this)
    }
  }

  get (target, name, receiver) {
    if (name[0] === '$') {
      if (!(name in this)) throw new Error(`${name} is not an init method`)
      return (...args) => this[name].apply(this, args)
    }
    return target[name]
  }

  set (target, name, value, receiver) {
    if (name[0] === '$') throw new TypeError('names begining with $ are reserved')
    if (this.isDone) throw new Error('dependency configuration is already complete')

    target[name] = value
    if (typeof value === 'function') {
      this.installFault(name, value)
    } else {
      this.deps[name] = value
    }

    return true
  }

  installFault (name, fn) {
    Object.defineProperty(this.deps, name, {
      enumerable: true,
      configurable: true,
      get: () => this.installDependency(name, fn(this.deps))
    })
  }

  installDependency (name, dep) {
    Object.defineProperty(this.deps, name, {
      enumerable: true,
      configurable: false,
      writable: false,
      value: dep
    })
    return dep
  }

  callingDirectory () {
    const _prepareStackTrace = Error.prepareStackTrace

    try {
      const err = new Error()
      Error.prepareStackTrace = (err, stack) => stack
      const thisFile = err.stack.shift().getFileName()
      for (let frame of err.stack) {
        const callingFile = frame.getFileName()
        if (thisFile !== callingFile) return path.dirname(callingFile)
      }
      throw new Error('could not find the calling directory')
    } finally {
      Error.prepareStackTrace = _prepareStackTrace
    }
  }

  $done () {
    this.isDone = true
  }

  $inject (request) {
    const origin = this.callingDirectory()
    const absolute = require.resolve(request, {paths: [origin]})
    const name = path.basename(absolute).split('.')[0]
    this.installFault(name, deps => require(absolute)(deps))
  }

  $require (request) {
    const origin = this.callingDirectory()
    const absolute = require.resolve(request, {paths: [origin]})
    const name = path.basename(absolute).split('.')[0]
    this.installFault(name, () => require(absolute))
  }
}

module.exports = Electrojector
