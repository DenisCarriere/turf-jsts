import babel from 'rollup-plugin-babel'
import uglify from 'rollup-plugin-uglify'

export default [{
  input: 'src/index.js',
  extend: true,
  output: {
    file: 'jsts.mjs',
    format: 'es'
  },
  plugins: []
},
{
  input: 'src/index.js',
  extend: true,
  output: {
    file: 'jsts.js',
    format: 'cjs'
  },
  plugins: [babel()]
},
{
  input: 'src/index.js',
  extend: true,
  output: {
    file: 'jsts.min.js',
    format: 'umd',
    name: 'jsts'
  },
  plugins: [babel(), uglify()]
}]
