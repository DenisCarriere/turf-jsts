import buble from 'rollup-plugin-buble'
import uglify from 'rollup-plugin-uglify'

const input = 'src/index.js'

export default [{
  input,
  output: {
    file: 'jsts.mjs',
    format: 'es'
  },
  plugins: [buble()]
},
{
  input,
  output: {
    file: 'jsts.js',
    format: 'cjs'
  },
  plugins: [buble()]
},
{
  input,
  output: {
    file: 'jsts.min.js',
    format: 'umd',
    name: 'jsts'
  },
  plugins: [buble(), uglify()]
}]
