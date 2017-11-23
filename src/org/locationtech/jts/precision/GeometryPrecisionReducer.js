import hasInterface from '../../../../hasInterface'
import GeometryFactory from '../geom/GeometryFactory'
import GeometryEditor from '../geom/util/GeometryEditor'
import Polygonal from '../geom/Polygonal'
import PrecisionReducerCoordinateOperation from './PrecisionReducerCoordinateOperation'

export default class GeometryPrecisionReducer {
  constructor (pm) {
    this._removeCollapsed = true
    this._changePrecisionModel = false
    this._isPointwise = false
    this._targetPM = pm || null
  }
  fixPolygonalTopology (geom) {
    var geomToBuffer = geom
    if (!this._changePrecisionModel) {
      geomToBuffer = this.changePM(geom, this._targetPM)
    }
    var bufGeom = geomToBuffer.buffer(0)
    var finalGeom = bufGeom
    if (!this._changePrecisionModel) {
      finalGeom = this.changePM(bufGeom, geom.getPrecisionModel())
    }
    return finalGeom
  }
  reducePointwise (geom) {
    var geomEdit = null
    if (this._changePrecisionModel) {
      var newFactory = this.createFactory(geom.getFactory(), this._targetPM)
      geomEdit = new GeometryEditor(newFactory)
    } else geomEdit = new GeometryEditor()
    var finalRemoveCollapsed = this._removeCollapsed
    if (geom.getDimension() >= 2) finalRemoveCollapsed = true
    var reduceGeom = geomEdit.edit(geom, new PrecisionReducerCoordinateOperation(this._targetPM, finalRemoveCollapsed))
    return reduceGeom
  }
  changePM (geom, newPM) {
    var geomEditor = this.createEditor(geom.getFactory(), newPM)
    return geomEditor.edit(geom, new GeometryEditor.NoOpGeometryOperation())
  }
  setRemoveCollapsedComponents (removeCollapsed) {
    this._removeCollapsed = removeCollapsed
  }
  createFactory (inputFactory, pm) {
    var newFactory = new GeometryFactory(pm, inputFactory.getSRID(), inputFactory.getCoordinateSequenceFactory())
    return newFactory
  }
  setChangePrecisionModel (changePrecisionModel) {
    this._changePrecisionModel = changePrecisionModel
  }
  reduce (geom) {
    var reducePW = this.reducePointwise(geom)
    if (this._isPointwise) return reducePW
    if (!hasInterface(reducePW, Polygonal)) return reducePW
    if (reducePW.isValid()) return reducePW
    return this.fixPolygonalTopology(reducePW)
  }
  setPointwise (isPointwise) {
    this._isPointwise = isPointwise
  }
  createEditor (geomFactory, newPM) {
    if (geomFactory.getPrecisionModel() === newPM) return new GeometryEditor()
    var newFactory = this.createFactory(geomFactory, newPM)
    var geomEdit = new GeometryEditor(newFactory)
    return geomEdit
  }
  interfaces_ () {
    return []
  }
  getClass () {
    return GeometryPrecisionReducer
  }
  static reduce (g, precModel) {
    var reducer = new GeometryPrecisionReducer(precModel)
    return reducer.reduce(g)
  }
  static reducePointwise (g, precModel) {
    var reducer = new GeometryPrecisionReducer(precModel)
    reducer.setPointwise(true)
    return reducer.reduce(g)
  }
}
