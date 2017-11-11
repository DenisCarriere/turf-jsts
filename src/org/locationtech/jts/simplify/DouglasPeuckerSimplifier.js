import DouglasPeuckerLineSimplifier from './DouglasPeuckerLineSimplifier';
import GeometryTransformer from '../geom/util/GeometryTransformer';
import IllegalArgumentException from '../../../../java/lang/IllegalArgumentException';
import Polygon from '../geom/Polygon';
import LinearRing from '../geom/LinearRing';
import extend from '../../../../extend';
import MultiPolygon from '../geom/MultiPolygon';
import inherits from '../../../../inherits';
export default function DouglasPeuckerSimplifier() {
	this._inputGeom = null;
	this._distanceTolerance = null;
	this._isEnsureValidTopology = true;
	let inputGeom = arguments[0];
	this._inputGeom = inputGeom;
}
extend(DouglasPeuckerSimplifier.prototype, {
	setEnsureValid: function (isEnsureValidTopology) {
		this._isEnsureValidTopology = isEnsureValidTopology;
	},
	getResultGeometry: function () {
		if (this._inputGeom.isEmpty()) return this._inputGeom.copy();
		return new DPTransformer(this._isEnsureValidTopology, this._distanceTolerance).transform(this._inputGeom);
	},
	setDistanceTolerance: function (distanceTolerance) {
		if (distanceTolerance < 0.0) throw new IllegalArgumentException("Tolerance must be non-negative");
		this._distanceTolerance = distanceTolerance;
	},
	interfaces_: function () {
		return [];
	},
	getClass: function () {
		return DouglasPeuckerSimplifier;
	}
});
DouglasPeuckerSimplifier.simplify = function (geom, distanceTolerance) {
	var tss = new DouglasPeuckerSimplifier(geom);
	tss.setDistanceTolerance(distanceTolerance);
	return tss.getResultGeometry();
};
function DPTransformer() {
	GeometryTransformer.apply(this);
	this._isEnsureValidTopology = true;
	this._distanceTolerance = null;
	let isEnsureValidTopology = arguments[0], distanceTolerance = arguments[1];
	this._isEnsureValidTopology = isEnsureValidTopology;
	this._distanceTolerance = distanceTolerance;
}
inherits(DPTransformer, GeometryTransformer);
extend(DPTransformer.prototype, {
	transformPolygon: function (geom, parent) {
		if (geom.isEmpty()) return null;
		var rawGeom = GeometryTransformer.prototype.transformPolygon.call(this, geom, parent);
		if (parent instanceof MultiPolygon) {
			return rawGeom;
		}
		return this.createValidArea(rawGeom);
	},
	createValidArea: function (rawAreaGeom) {
		if (this._isEnsureValidTopology) return rawAreaGeom.buffer(0.0);
		return rawAreaGeom;
	},
	transformCoordinates: function (coords, parent) {
		var inputPts = coords.toCoordinateArray();
		var newPts = null;
		if (inputPts.length === 0) {
			newPts = new Array(0).fill(null);
		} else {
			newPts = DouglasPeuckerLineSimplifier.simplify(inputPts, this._distanceTolerance);
		}
		return this._factory.getCoordinateSequenceFactory().create(newPts);
	},
	transformMultiPolygon: function (geom, parent) {
		var rawGeom = GeometryTransformer.prototype.transformMultiPolygon.call(this, geom, parent);
		return this.createValidArea(rawGeom);
	},
	transformLinearRing: function (geom, parent) {
		var removeDegenerateRings = parent instanceof Polygon;
		var simpResult = GeometryTransformer.prototype.transformLinearRing.call(this, geom, parent);
		if (removeDegenerateRings && !(simpResult instanceof LinearRing)) return null;
		;
		return simpResult;
	},
	interfaces_: function () {
		return [];
	},
	getClass: function () {
		return DPTransformer;
	}
});
DouglasPeuckerSimplifier.DPTransformer = DPTransformer;
