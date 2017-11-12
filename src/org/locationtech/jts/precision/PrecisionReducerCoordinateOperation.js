import LineString from '../geom/LineString'
import CoordinateList from '../geom/CoordinateList'
import Coordinate from '../geom/Coordinate'
import GeometryEditor from '../geom/util/GeometryEditor'
import LinearRing from '../geom/LinearRing'

export default class PrecisionReducerCoordinateOperation extends GeometryEditor.CoordinateOperation {
  constructor (targetPM, removeCollapsed) {
    super()
    this._targetPM = targetPM || null
    this._removeCollapsed = (removeCollapsed !== undefined) ? removeCollapsed : true
  }
  editCoordinates (coordinates, geom) {
    if (coordinates.length === 0) return null
    var reducedCoords = new Array(coordinates.length).fill(null)
    for (var i = 0; i < coordinates.length; i++) {
      var coord = new Coordinate(coordinates[i])
      this._targetPM.makePrecise(coord)
      reducedCoords[i] = coord
    }
    var noRepeatedCoordList = new CoordinateList(reducedCoords, false)
    var noRepeatedCoords = noRepeatedCoordList.toCoordinateArray()
    var minLength = 0
    if (geom instanceof LineString) minLength = 2
    if (geom instanceof LinearRing) minLength = 4
    var collapsedCoords = reducedCoords
    if (this._removeCollapsed) collapsedCoords = null
    if (noRepeatedCoords.length < minLength) {
      return collapsedCoords
    }
    return noRepeatedCoords
  }
  interfaces_ () {
    return []
  }
  getClass () {
    return PrecisionReducerCoordinateOperation
  }
}
