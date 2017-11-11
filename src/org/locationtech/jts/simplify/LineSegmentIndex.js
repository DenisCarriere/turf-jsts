import Quadtree from '../index/quadtree/Quadtree';
import ItemVisitor from '../index/ItemVisitor';
import extend from '../../../../extend';
import LineSegment from '../geom/LineSegment';
import ArrayList from '../../../../java/util/ArrayList';
import Envelope from '../geom/Envelope';
import TaggedLineString from './TaggedLineString';
export default function LineSegmentIndex() {
	this._index = new Quadtree();
}
extend(LineSegmentIndex.prototype, {
	remove: function (seg) {
		this._index.remove(new Envelope(seg.p0, seg.p1), seg);
	},
	add: function () {
		if (arguments[0] instanceof TaggedLineString) {
			let line = arguments[0];
			var segs = line.getSegments();
			for (var i = 0; i < segs.length; i++) {
				var seg = segs[i];
				this.add(seg);
			}
		} else if (arguments[0] instanceof LineSegment) {
			let seg = arguments[0];
			this._index.insert(new Envelope(seg.p0, seg.p1), seg);
		}
	},
	query: function (querySeg) {
		var env = new Envelope(querySeg.p0, querySeg.p1);
		var visitor = new LineSegmentVisitor(querySeg);
		this._index.query(env, visitor);
		var itemsFound = visitor.getItems();
		return itemsFound;
	},
	interfaces_: function () {
		return [];
	},
	getClass: function () {
		return LineSegmentIndex;
	}
});
function LineSegmentVisitor() {
	this._querySeg = null;
	this._items = new ArrayList();
	let querySeg = arguments[0];
	this._querySeg = querySeg;
}
extend(LineSegmentVisitor.prototype, {
	visitItem: function (item) {
		var seg = item;
		if (Envelope.intersects(seg.p0, seg.p1, this._querySeg.p0, this._querySeg.p1)) this._items.add(item);
	},
	getItems: function () {
		return this._items;
	},
	interfaces_: function () {
		return [ItemVisitor];
	},
	getClass: function () {
		return LineSegmentVisitor;
	}
});
