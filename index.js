const Electrojector = require('./src/electrojector')

module.exports = fn => {
  const scope = Electrojector.scope()
  if (fn) {
    fn(scope.init)
    scope.init.$done()
    return scope.deps
  }
  return scope
}
