import buble from 'rollup-plugin-buble'
import uglify from 'rollup-plugin-uglify'

export default [{
  input: 'src/index.js',
  output: {
    file: 'jsts.mjs',
    format: 'es'
  }
},
{
  input: 'src/index.js',
  output: {
    file: 'jsts.js',
    format: 'cjs'
  },
  plugins: [buble()]
},
{
  input: 'src/index.js',
  output: {
    file: 'jsts.min.js',
    format: 'umd',
    name: 'jsts'
  },
  plugins: [buble(), uglify()]
}]
