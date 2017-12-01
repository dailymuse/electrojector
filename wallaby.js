module.exports = wallaby => {
  return {
    files: ['index.js', 'src/**/*.js', 'test/*/*.js'],
    tests: ['test/*.js'],
    debug: true,
    testFramework: 'ava',
    env: {
      type: 'node',
      runner: 'node'
    }
  }
}
