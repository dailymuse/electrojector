const test = require("ava");
const sinon = require("sinon");
const electrojector = require("../index");

test("create with scope", t => {
  const { deps, init } = electrojector();
  init.obj = {};
  t.is(deps.obj, init.obj);
});

test("create with init function", t => {
  const val = {};
  const deps = electrojector(init => {
    init.obj = val;
  });
  t.is(deps.obj, val);
});

test("eager init with function", t => {
  const { deps, init } = electrojector();
  init.fn = () => 1;
  t.is(deps.fn(), 1);
});

test("lazy init", t => {
  const { deps, init } = electrojector();
  const val = {};
  init.$.obj = () => val;
  t.is(deps.obj, val);
});

test("init with dependencies", t => {
  const { deps, init } = electrojector();
  init.one = 1;
  init.$.two = deps => deps.one + 1;
  t.is(deps.two, 2);
});

test("idempotent init", t => {
  const val = {};
  const lazy = sinon.spy(() => val);
  const { deps, init } = electrojector();
  init.$.obj = lazy;
  t.is(deps.obj, val);
  t.is(deps.obj, val);
  t.is(deps.obj, val);
  t.true(lazy.calledOnce);
});

test("$done prevents further initialization", t => {
  const { init } = electrojector();
  init.obj = {};
  init.$done();
  t.throws(
    () => (init.other = {}),
    "dependency configuration is already complete"
  );
});

test("names beginning with $ are reserved", t => {
  const { init } = electrojector();
  t.throws(
    () => (init.$reservedName = "aaa"),
    "names begining with $ are reserved"
  );
});

test("errors on get of unrecognized reserved name", t => {
  const { init } = electrojector();
  t.throws(() => init.$reservedName, "$reservedName is not an init method");
});

test("init fn calls done", t => {
  let init;
  electrojector(_init => (init = _init));
  t.throws(
    () => (init.other = {}),
    "dependency configuration is already complete"
  );
});
