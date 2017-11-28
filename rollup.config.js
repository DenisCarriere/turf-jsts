import babel from 'rollup-plugin-babel'
import uglify from 'rollup-plugin-uglify'

export default [{
  input: 'index.js',
  extend: true,
  output: {
    file: 'jsts.js',
    format: 'umd',
    name: 'jsts'
  },
  plugins: [babel()]
},
{
  input: 'index.js',
  extend: true,
  output: {
    file: 'jsts.min.js',
    format: 'umd',
    name: 'jsts'
  },
  plugins: [babel(), uglify()]
}]
