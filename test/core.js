const test = require('ava')
const sinon = require('sinon')
const electrojector = require('../index')

test('create with scope', t => {
  const {deps, init} = electrojector()
  init.obj = {}
  t.is(deps.obj, init.obj)
})

test('create with init function', t => {
  const val = {}
  const deps = electrojector(init => {
    init.obj = val
  })
  t.is(deps.obj, val)
})

test('lazy init', t => {
  const {deps, init} = electrojector()
  const val = {}
  init.obj = () => val
  t.is(deps.obj, val)
})

test('idempotent init', t => {
  const val = {}
  const lazy = sinon.spy(() => val)
  const {deps, init} = electrojector()
  init.obj = lazy
  t.is(deps.obj, val)
  t.is(deps.obj, val)
  t.is(deps.obj, val)
  t.true(lazy.calledOnce)
})

test('$done prevents further initialization', t => {
  const {deps, init} = electrojector()
  init.obj = {}
  init.$done()
  t.throws(() => (init.other = {}), 'dependency configuration is already complete')
})

test('names beginning with $ are reserved', t => {
  const {deps, init} = electrojector()
  t.throws(() => (init.$reservedName = 'aaa'), 'names begining with $ are reserved')
})

test('init fn calls done', t => {
  let init
  const deps = electrojector(_init => (init = _init))
  t.throws(() => (init.other = {}), 'dependency configuration is already complete')
})
