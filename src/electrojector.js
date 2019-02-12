const path = require('path')
const Conflator = require('@themuse/conflator')
const Module = require('module')

class Electrojector {
  constructor () {
    this.deps = {}
    this.isDone = false
  }

  static scope () {
    return new this().scope()
  }

  scope () {
    const lazyTarget = {}
    const eagerTarget = { $: new Proxy(lazyTarget, this) }
    return {
      deps: this.deps,
      init: new Proxy(eagerTarget, this)
    }
  }

  get (target, name, receiver) {
    if (name === '$') return target.$
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
    if ('$' in target) {
      this.deps[name] = value
    } else {
      this.installFault(name, value)
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

  callingFile () {
    const _prepareStackTrace = Error.prepareStackTrace

    try {
      const err = new Error()
      Error.prepareStackTrace = (_, stack) => stack
      const thisFile = err.stack.shift().getFileName()
      for (let frame of err.stack) {
        const callingFile = frame.getFileName()
        if (thisFile !== callingFile) return callingFile
      }
      throw new Error('could not find the calling directory')
    } finally {
      Error.prepareStackTrace = _prepareStackTrace
    }
  }

  callingDirectory () {
    return path.dirname(this.callingFile())
  }

  resolve (_name, request) {
    if (!request) {
      request = _name
      _name = undefined
    }
    const origin = this.callingFile()
    const absPath = Module._resolveFilename(request, {
      id: origin,
      filename: origin,
      paths: Module._nodeModulePaths(path.dirname(origin))
    })
    const name = _name || path.basename(request).split('.')[0]
    return { origin, absPath, name }
  }

  $config (request) {
    const origin = this.callingDirectory()
    const absolute = path.resolve(origin, request)
    this.installFault('config', () => Conflator.env(absolute))
  }

  $done () {
    this.isDone = true
  }

  $inject (_name, request) {
    const { absPath, name } = this.resolve(_name, request)
    this.installFault(name, deps => {
      const fn = require(absPath)
      if (typeof fn !== 'function') throw new Error(`Module '${name}' doesn't export a function`)
      try {
        return fn(deps)
      } catch (e) {
        e.message = `Couldn't initialize '${name}' - ${e.message.replace('Error: ', '')}`
        throw e
      }
    })
  }

  $require (_name, request) {
    const { absPath, name } = this.resolve(_name, request)
    this.installFault(name, () => require(absPath))
  }
}

module.exports = Electrojector
