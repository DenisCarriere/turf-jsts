import PointLocator from '../../algorithm/PointLocator'
import Location from '../../geom/Location'
import EdgeNodingValidator from '../../geomgraph/EdgeNodingValidator'
import GeometryCollectionMapper from '../../geom/util/GeometryCollectionMapper'
import PolygonBuilder from './PolygonBuilder'
import Position from '../../geomgraph/Position'
import LineBuilder from './LineBuilder'
import PointBuilder from './PointBuilder'
import SnapIfNeededOverlayOp from './snap/SnapIfNeededOverlayOp'
import Label from '../../geomgraph/Label'
import OverlayNodeFactory from './OverlayNodeFactory'
import GeometryGraphOperation from '../GeometryGraphOperation'
import EdgeList from '../../geomgraph/EdgeList'
import ArrayList from '../../../../../java/util/ArrayList'
import Assert from '../../util/Assert'
import PlanarGraph from '../../geomgraph/PlanarGraph'

export default class OverlayOp extends GeometryGraphOperation {
  constructor (g0, g1) {
    super(g0, g1)
    this._ptLocator = new PointLocator()
    this._geomFact = null
    this._resultGeom = null
    this._graph = null
    this._edgeList = new EdgeList()
    this._resultPolyList = new ArrayList()
    this._resultLineList = new ArrayList()
    this._resultPointList = new ArrayList()
    this._graph = new PlanarGraph(new OverlayNodeFactory())
    this._geomFact = g0.getFactory()
  }
  insertUniqueEdge (e) {
    var existingEdge = this._edgeList.findEqualEdge(e)
    if (existingEdge !== null) {
      var existingLabel = existingEdge.getLabel()
      var labelToMerge = e.getLabel()
      if (!existingEdge.isPointwiseEqual(e)) {
        labelToMerge = new Label(e.getLabel())
        labelToMerge.flip()
      }
      var depth = existingEdge.getDepth()
      if (depth.isNull()) {
        depth.add(existingLabel)
      }
      depth.add(labelToMerge)
      existingLabel.merge(labelToMerge)
    } else {
      this._edgeList.add(e)
    }
  }
  getGraph () {
    return this._graph
  }
  cancelDuplicateResultEdges () {
    for (var it = this._graph.getEdgeEnds().iterator(); it.hasNext();) {
      var de = it.next()
      var sym = de.getSym()
      if (de.isInResult() && sym.isInResult()) {
        de.setInResult(false)
        sym.setInResult(false)
      }
    }
  }
  isCoveredByLA (coord) {
    if (this.isCovered(coord, this._resultLineList)) return true
    if (this.isCovered(coord, this._resultPolyList)) return true
    return false
  }
  computeGeometry (resultPointList, resultLineList, resultPolyList, opcode) {
    var geomList = new ArrayList()
    geomList.addAll(resultPointList)
    geomList.addAll(resultLineList)
    geomList.addAll(resultPolyList)
    if (geomList.isEmpty()) return OverlayOp.createEmptyResult(opcode, this._arg[0].getGeometry(), this._arg[1].getGeometry(), this._geomFact)
    return this._geomFact.buildGeometry(geomList)
  }
  mergeSymLabels () {
    for (var nodeit = this._graph.getNodes().iterator(); nodeit.hasNext();) {
      var node = nodeit.next()
      node.getEdges().mergeSymLabels()
    }
  }
  isCovered (coord, geomList) {
    for (var it = geomList.iterator(); it.hasNext();) {
      var geom = it.next()
      var loc = this._ptLocator.locate(coord, geom)
      if (loc !== Location.EXTERIOR) return true
    }
    return false
  }
  replaceCollapsedEdges () {
    var newEdges = new ArrayList()
    for (var it = this._edgeList.iterator(); it.hasNext();) {
      var e = it.next()
      if (e.isCollapsed()) {
        it.remove()
        newEdges.add(e.getCollapsedEdge())
      }
    }
    this._edgeList.addAll(newEdges)
  }
  updateNodeLabelling () {
    for (var nodeit = this._graph.getNodes().iterator(); nodeit.hasNext();) {
      var node = nodeit.next()
      var lbl = node.getEdges().getLabel()
      node.getLabel().merge(lbl)
    }
  }
  getResultGeometry (overlayOpCode) {
    this.computeOverlay(overlayOpCode)
    return this._resultGeom
  }
  insertUniqueEdges (edges) {
    for (var i = edges.iterator(); i.hasNext();) {
      var e = i.next()
      this.insertUniqueEdge(e)
    }
  }
  computeOverlay (opCode) {
    this.copyPoints(0)
    this.copyPoints(1)
    this._arg[0].computeSelfNodes(this._li, false)
    this._arg[1].computeSelfNodes(this._li, false)
    this._arg[0].computeEdgeIntersections(this._arg[1], this._li, true)
    var baseSplitEdges = new ArrayList()
    this._arg[0].computeSplitEdges(baseSplitEdges)
    this._arg[1].computeSplitEdges(baseSplitEdges)
    // const splitEdges = baseSplitEdges
    this.insertUniqueEdges(baseSplitEdges)
    this.computeLabelsFromDepths()
    this.replaceCollapsedEdges()
    EdgeNodingValidator.checkValid(this._edgeList.getEdges())
    this._graph.addEdges(this._edgeList.getEdges())
    this.computeLabelling()
    this.labelIncompleteNodes()
    this.findResultAreaEdges(opCode)
    this.cancelDuplicateResultEdges()
    var polyBuilder = new PolygonBuilder(this._geomFact)
    polyBuilder.add(this._graph)
    this._resultPolyList = polyBuilder.getPolygons()
    var lineBuilder = new LineBuilder(this, this._geomFact, this._ptLocator)
    this._resultLineList = lineBuilder.build(opCode)
    var pointBuilder = new PointBuilder(this, this._geomFact, this._ptLocator)
    this._resultPointList = pointBuilder.build(opCode)
    this._resultGeom = this.computeGeometry(this._resultPointList, this._resultLineList, this._resultPolyList, opCode)
  }
  labelIncompleteNode (n, targetIndex) {
    var loc = this._ptLocator.locate(n.getCoordinate(), this._arg[targetIndex].getGeometry())
    n.getLabel().setLocation(targetIndex, loc)
  }
  copyPoints (argIndex) {
    for (var i = this._arg[argIndex].getNodeIterator(); i.hasNext();) {
      var graphNode = i.next()
      var newNode = this._graph.addNode(graphNode.getCoordinate())
      newNode.setLabel(argIndex, graphNode.getLabel().getLocation(argIndex))
    }
  }
  findResultAreaEdges (opCode) {
    for (var it = this._graph.getEdgeEnds().iterator(); it.hasNext();) {
      var de = it.next()
      var label = de.getLabel()
      if (label.isArea() && !de.isInteriorAreaEdge() && OverlayOp.isResultOfOp(label.getLocation(0, Position.RIGHT), label.getLocation(1, Position.RIGHT), opCode)) {
        de.setInResult(true)
      }
    }
  }
  computeLabelsFromDepths () {
    for (var it = this._edgeList.iterator(); it.hasNext();) {
      var e = it.next()
      var lbl = e.getLabel()
      var depth = e.getDepth()
      if (!depth.isNull()) {
        depth.normalize()
        for (var i = 0; i < 2; i++) {
          if (!lbl.isNull(i) && lbl.isArea() && !depth.isNull(i)) {
            if (depth.getDelta(i) === 0) {
              lbl.toLine(i)
            } else {
              Assert.isTrue(!depth.isNull(i, Position.LEFT), 'depth of LEFT side has not been initialized')
              lbl.setLocation(i, Position.LEFT, depth.getLocation(i, Position.LEFT))
              Assert.isTrue(!depth.isNull(i, Position.RIGHT), 'depth of RIGHT side has not been initialized')
              lbl.setLocation(i, Position.RIGHT, depth.getLocation(i, Position.RIGHT))
            }
          }
        }
      }
    }
  }
  computeLabelling () {
    for (var nodeit = this._graph.getNodes().iterator(); nodeit.hasNext();) {
      var node = nodeit.next()
      node.getEdges().computeLabelling(this._arg)
    }
    this.mergeSymLabels()
    this.updateNodeLabelling()
  }
  labelIncompleteNodes () {
    // let nodeCount = 0
    for (var ni = this._graph.getNodes().iterator(); ni.hasNext();) {
      var n = ni.next()
      var label = n.getLabel()
      if (n.isIsolated()) {
        // nodeCount++
        if (label.isNull(0)) this.labelIncompleteNode(n, 0); else this.labelIncompleteNode(n, 1)
      }
      n.getEdges().updateLabelling(label)
    }
  }
  isCoveredByA (coord) {
    if (this.isCovered(coord, this._resultPolyList)) return true
    return false
  }
  interfaces_ () {
    return []
  }
  getClass () {
    return OverlayOp
  }
  static overlayOp (geom0, geom1, opCode) {
    var gov = new OverlayOp(geom0, geom1)
    var geomOv = gov.getResultGeometry(opCode)
    return geomOv
  }
  static intersection (g, other) {
    if (g.isEmpty() || other.isEmpty()) return OverlayOp.createEmptyResult(OverlayOp.INTERSECTION, g, other, g.getFactory())
    if (g.isGeometryCollection()) {
      var g2 = other
      return GeometryCollectionMapper.map(g, {
        interfaces_: function () {
          // return [MapOp]
          return [OverlayOp]
        },
        map: function (g) {
          return g.intersection(g2)
        }
      })
    }
    g.checkNotGeometryCollection(g)
    g.checkNotGeometryCollection(other)
    return SnapIfNeededOverlayOp.overlayOp(g, other, OverlayOp.INTERSECTION)
  }
  static symDifference (g, other) {
    if (g.isEmpty() || other.isEmpty()) {
      if (g.isEmpty() && other.isEmpty()) return OverlayOp.createEmptyResult(OverlayOp.SYMDIFFERENCE, g, other, g.getFactory())
      if (g.isEmpty()) return other.copy()
      if (other.isEmpty()) return g.copy()
    }
    g.checkNotGeometryCollection(g)
    g.checkNotGeometryCollection(other)
    return SnapIfNeededOverlayOp.overlayOp(g, other, OverlayOp.SYMDIFFERENCE)
  }
  static resultDimension (opCode, g0, g1) {
    var dim0 = g0.getDimension()
    var dim1 = g1.getDimension()
    var resultDimension = -1
    switch (opCode) {
      case OverlayOp.INTERSECTION:
        resultDimension = Math.min(dim0, dim1)
        break
      case OverlayOp.UNION:
        resultDimension = Math.max(dim0, dim1)
        break
      case OverlayOp.DIFFERENCE:
        resultDimension = dim0
        break
      case OverlayOp.SYMDIFFERENCE:
        resultDimension = Math.max(dim0, dim1)
        break
    }
    return resultDimension
  }
  static createEmptyResult (overlayOpCode, a, b, geomFact) {
    var result = null
    switch (OverlayOp.resultDimension(overlayOpCode, a, b)) {
      case -1:
        result = geomFact.createGeometryCollection(new Array(0).fill(null))
        break
      case 0:
        result = geomFact.createPoint()
        break
      case 1:
        result = geomFact.createLineString()
        break
      case 2:
        result = geomFact.createPolygon()
        break
    }
    return result
  }
  static difference (g, other) {
    if (g.isEmpty()) return OverlayOp.createEmptyResult(OverlayOp.DIFFERENCE, g, other, g.getFactory())
    if (other.isEmpty()) return g.copy()
    g.checkNotGeometryCollection(g)
    g.checkNotGeometryCollection(other)
    return SnapIfNeededOverlayOp.overlayOp(g, other, OverlayOp.DIFFERENCE)
  }
  static isResultOfOp () {
    if (arguments.length === 2) {
      const label = arguments[0]
      const opCode = arguments[1]
      const loc0 = label.getLocation(0)
      const loc1 = label.getLocation(1)
      return OverlayOp.isResultOfOp(loc0, loc1, opCode)
    } else if (arguments.length === 3) {
      let loc0 = arguments[0]
      let loc1 = arguments[1]
      const overlayOpCode = arguments[2]
      if (loc0 === Location.BOUNDARY) loc0 = Location.INTERIOR
      if (loc1 === Location.BOUNDARY) loc1 = Location.INTERIOR
      switch (overlayOpCode) {
        case OverlayOp.INTERSECTION:
          return loc0 === Location.INTERIOR && loc1 === Location.INTERIOR
        case OverlayOp.UNION:
          return loc0 === Location.INTERIOR || loc1 === Location.INTERIOR
        case OverlayOp.DIFFERENCE:
          return loc0 === Location.INTERIOR && loc1 !== Location.INTERIOR
        case OverlayOp.SYMDIFFERENCE:
          return loc0 === Location.INTERIOR && (loc1 !== Location.INTERIOR || loc0 !== Location.INTERIOR) && loc1 === Location.INTERIOR
      }
      return false
    }
  }
  static get INTERSECTION () { return 1 }
  static get UNION () { return 2 }
  static get DIFFERENCE () { return 3 }
  static get SYMDIFFERENCE () { return 4 }
}
