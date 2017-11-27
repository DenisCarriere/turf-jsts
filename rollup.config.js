import babel from 'rollup-plugin-babel'

export default {
  input: 'index.js',
  output: {
    extend: true,
    file: 'main.js',
    format: 'cjs'
  },
  plugins: [babel()]
}
