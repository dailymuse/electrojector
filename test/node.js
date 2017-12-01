const test = require('ava')
const electrojector = require('../index')

test('$require', t => {
  const {deps, init} = electrojector()
  init.$require(__dirname, 'dependencies/independent')
  t.is(deps.independent, 'independent')
})

test('$inject', t => {
  const {deps, init} = electrojector()
  init.$require(__dirname, 'dependencies/independent')
  init.$inject(__dirname, 'dependencies/dependent.js')
  t.is(deps.dependent, 'I depend on independent')
})
