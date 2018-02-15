module.exports = wallaby => {
  return {
    files: ['index.js', 'src/**/*.js', 'test/config/*.json', 'test/dependenies/**/*'],
    tests: ['test/*.js'],
    debug: true,
    testFramework: 'ava',
    env: {
      type: 'node',
      runner: 'node',
      params: {
        env: 'NODE_ENV=test; TZ=UTC'
      }
    }
  }
}
