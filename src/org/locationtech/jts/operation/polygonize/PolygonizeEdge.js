import extend from '../../../../../extend';
import Edge from '../../planargraph/Edge';
import inherits from '../../../../../inherits';
export default function PolygonizeEdge() {
	Edge.apply(this);
	this._line = null;
	let line = arguments[0];
	this._line = line;
}
inherits(PolygonizeEdge, Edge);
extend(PolygonizeEdge.prototype, {
	getLine: function () {
		return this._line;
	},
	interfaces_: function () {
		return [];
	},
	getClass: function () {
		return PolygonizeEdge;
	}
});
