# Electrojector

A simple dependency injection library for Javascript.

## Installation

```
yarn add --dev electrojector
```

> Electrojector pulls in a few packages from Gemfury, our private npm registry, in order to install these packages locally you need to have an environment variable on your system called `GEMFURY_TOKEN`, a token can be generated from your Gemfury account.

Usage


```javascript
// index.js
const electrojector = require('electrojector')

const {deps, init} = electrojector()
init.eager = 3
init.$.lazy = deps => deps.eager + 1
init.$require('./src/add')
init.$inject('./src/sum')

const sum, eager, lazy = {deps}
console.log(sum(eager, lazy, 5)) // 12

// src/add.js
module.exports = (a, b) => a + b

// src/sum.js
module.exports = deps => {
  const {add} = deps
  return (...args) => args.reduce((sum, ea) => add(sum, ea))
}
```
