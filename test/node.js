const test = require('ava')
const electrojector = require('../index')
const path = require('path')

test('$require', t => {
  const {deps, init} = electrojector()
  init.$require('./dependencies/independent')
  t.is(deps.independent, 'independent')
})

test('$require from node_modules', t => {
  const {deps, init} = electrojector()
  init.$require('path')
  t.is(deps.path, path)
})

test('$inject', t => {
  const {deps, init} = electrojector()
  init.$require('./dependencies/independent')
  init.$inject('./dependencies/dependent.js')
  t.is(deps.dependent, 'I depend on independent')
})
