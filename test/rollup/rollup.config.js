const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');

module.exports = {
  input: 'index.js',
  output: [
    { file: 'dist/bundle.esm.js', format: 'es' },
    { file: 'dist/bundle.umd.js', format: 'umd', name: 'MyLib' },
  ],
  plugins: [resolve(), commonjs()],
  external: [],
};