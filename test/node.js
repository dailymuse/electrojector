const test = require('ava')
const electrojector = require('../index')
const path = require('path')

test('$require', t => {
  const {deps, init} = electrojector()
  init.$require('./dependencies/independent')
  t.is(deps.independent, 'independent')
})

test('$require with name', t => {
  const {deps, init} = electrojector()
  init.$require('otherName', './dependencies/independent')
  t.is(deps.otherName, 'independent')
})

test('$require from node_modules', t => {
  const {deps, init} = electrojector()
  init.$require('path')
  t.is(deps.path, path)
})

test('$require directory', t => {
  const {deps, init} = electrojector()
  init.$require('./dependencies/aDirectory')
  t.is(deps.aDirectory(), 7)
})

test('$require json directory', t => {
  const {deps, init} = electrojector()
  init.$require('./dependencies/jsonDirectory')
  t.is(deps.jsonDirectory.val, 3)
})

test('$inject', t => {
  const {deps, init} = electrojector()
  init.$require('./dependencies/independent')
  init.$inject('./dependencies/dependent.js')
  t.is(deps.dependent, 'I depend on independent')
})

test('$inject with name', t => {
  const {deps, init} = electrojector()
  init.$require('./dependencies/independent')
  init.$inject('otherName', './dependencies/dependent')
  t.is(deps.otherName, 'I depend on independent')
})

test('$inject directory', t => {
  const {deps, init} = electrojector()
  init.$inject('./dependencies/aDirectory')
  t.is(deps.aDirectory, 7)
})

test('$inject not a function', t => {
  const {deps, init} = electrojector()
  init.$inject('./dependencies/independent')
  const err = t.throws(() => deps.independent)
  t.is(err.message, "Module 'independent' doesn't export a function")
})

test('$inject call fails', t => {
  const {deps, init} = electrojector()
  init.$inject('./dependencies/broken')
  const err = t.throws(() => deps.broken)
  t.is(err.message, "Couldn't initialize 'broken' - some error")
})

test('$config', t => {
  const {deps, init} = electrojector()
  init.$config('./config')
  t.is(deps.config.yyy, 6)
})
