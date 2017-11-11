import LineString from '../../geom/LineString';
import Geometry from '../../geom/Geometry';
import hasInterface from '../../../../../hasInterface';
import Collection from '../../../../../java/util/Collection';
import EdgeString from './EdgeString';
import extend from '../../../../../extend';
import LineMergeGraph from './LineMergeGraph';
import GeometryComponentFilter from '../../geom/GeometryComponentFilter';
import ArrayList from '../../../../../java/util/ArrayList';
import Assert from '../../util/Assert';
import GraphComponent from '../../planargraph/GraphComponent';
export default function LineMerger() {
	this._graph = new LineMergeGraph();
	this._mergedLineStrings = null;
	this._factory = null;
	this._edgeStrings = null;
}
extend(LineMerger.prototype, {
	buildEdgeStringsForUnprocessedNodes: function () {
		for (var i = this._graph.getNodes().iterator(); i.hasNext(); ) {
			var node = i.next();
			if (!node.isMarked()) {
				Assert.isTrue(node.getDegree() === 2);
				this.buildEdgeStringsStartingAt(node);
				node.setMarked(true);
			}
		}
	},
	buildEdgeStringsForNonDegree2Nodes: function () {
		for (var i = this._graph.getNodes().iterator(); i.hasNext(); ) {
			var node = i.next();
			if (node.getDegree() !== 2) {
				this.buildEdgeStringsStartingAt(node);
				node.setMarked(true);
			}
		}
	},
	buildEdgeStringsForObviousStartNodes: function () {
		this.buildEdgeStringsForNonDegree2Nodes();
	},
	getMergedLineStrings: function () {
		this.merge();
		return this._mergedLineStrings;
	},
	buildEdgeStringsStartingAt: function (node) {
		for (var i = node.getOutEdges().iterator(); i.hasNext(); ) {
			var directedEdge = i.next();
			if (directedEdge.getEdge().isMarked()) {
				continue;
			}
			this._edgeStrings.add(this.buildEdgeStringStartingWith(directedEdge));
		}
	},
	merge: function () {
		if (this._mergedLineStrings !== null) {
			return null;
		}
		GraphComponent.setMarked(this._graph.nodeIterator(), false);
		GraphComponent.setMarked(this._graph.edgeIterator(), false);
		this._edgeStrings = new ArrayList();
		this.buildEdgeStringsForObviousStartNodes();
		this.buildEdgeStringsForIsolatedLoops();
		this._mergedLineStrings = new ArrayList();
		for (var i = this._edgeStrings.iterator(); i.hasNext(); ) {
			var edgeString = i.next();
			this._mergedLineStrings.add(edgeString.toLineString());
		}
	},
	buildEdgeStringStartingWith: function (start) {
		var edgeString = new EdgeString(this._factory);
		var current = start;
		do {
			edgeString.add(current);
			current.getEdge().setMarked(true);
			current = current.getNext();
		} while (current !== null && current !== start);
		return edgeString;
	},
	add: function () {
		if (arguments[0] instanceof Geometry) {
			let geometry = arguments[0];
			geometry.apply({
				interfaces_: function () {
					return [GeometryComponentFilter];
				},
				filter: function (component) {
					if (component instanceof LineString) {
						this.add(component);
					}
				}
			});
		} else if (hasInterface(arguments[0], Collection)) {
			let geometries = arguments[0];
			this._mergedLineStrings = null;
			for (var i = geometries.iterator(); i.hasNext(); ) {
				var geometry = i.next();
				this.add(geometry);
			}
		} else if (arguments[0] instanceof LineString) {
			let lineString = arguments[0];
			if (this._factory === null) {
				this._factory = lineString.getFactory();
			}
			this._graph.addEdge(lineString);
		}
	},
	buildEdgeStringsForIsolatedLoops: function () {
		this.buildEdgeStringsForUnprocessedNodes();
	},
	interfaces_: function () {
		return [];
	},
	getClass: function () {
		return LineMerger;
	}
});
