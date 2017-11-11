import ItemVisitor from './ItemVisitor';
import extend from '../../../../extend';
import ArrayList from '../../../../java/util/ArrayList';
export default function ArrayListVisitor() {
	this._items = new ArrayList();
}
extend(ArrayListVisitor.prototype, {
	visitItem: function (item) {
		this._items.add(item);
	},
	getItems: function () {
		return this._items;
	},
	interfaces_: function () {
		return [ItemVisitor];
	},
	getClass: function () {
		return ArrayListVisitor;
	}
});
