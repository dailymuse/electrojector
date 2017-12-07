# Electrojector

A simple dependency injection library for Javascript.

## Installation

```
yarn add --dev electrojector
```

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
