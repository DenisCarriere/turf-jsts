import './Array'
import './Number'
import './Math'

import * as geom from './src/org/locationtech/jts/geom'
import * as algorithm from './src/org/locationtech/jts/algorithm'
import * as densify from './src/org/locationtech/jts/densify'
import * as dissolve from './src/org/locationtech/jts/dissolve'
import * as geomgraph from './src/org/locationtech/jts/geomgraph'
import * as index from './src/org/locationtech/jts/index'
import * as io from './src/org/locationtech/jts/io'
import * as noding from './src/org/locationtech/jts/noding'
import * as operation from './src/org/locationtech/jts/operation'
import * as precision from './src/org/locationtech/jts/precision'
import * as simplify from './src/org/locationtech/jts/simplify'
import * as triangulate from './src/org/locationtech/jts/triangulate'
import * as linearref from './src/org/locationtech/jts/linearref'

import './src/org/locationtech/jts/monkey'

const version = 'npm_package_version (git_hash)'
export {
  version,
  algorithm,
  densify,
  dissolve,
  geom,
  geomgraph,
  index,
  io,
  noding,
  operation,
  precision,
  simplify,
  triangulate,
  linearref
}
