import Bbox from './bbox';

export default class Node {
	left: any;
	right: any;
	data: any;
	dist: any;
	opt: any;
	edge: any;
	bbox: any;
	parent: any;
	constructor({
		left,
		right,
		data,
		dist,
		parent,
		opt,
		edge
	}: {
		left: any;
		right: any;
		data: any;
		dist: any;
		parent: any;
		opt: any;
		edge: any;
	}) {
		this.left = left;
		this.right = right;

		this.data = data;
		this.dist = dist;
		this.opt = opt;
		this.edge = edge;
		this.bbox = new Bbox(data);

		this.parent = parent;
	}

	get isLeaf() {
		return this.left === null && this.right === null;
	}

	getAncestor() {
		if (!this.parent) {
			return this;
		}
		return this.parent.getAncestor();
	}

	toString() {
		return `data: ${this.data.join(' ')}, edge:, ${this.edge ? this.edge.join(' ') : ' '}`;
	}

	// filter from top to bottom, if true, terminate and return the node, othervise, test the children
	filter(filterFunc: any, bbox = null) {
		if (bbox !== null && !this.bbox.intersect(bbox)) {
			return [];
		}

		if (filterFunc(this)) {
			return [this];
		}
		const l = this.left ? this.left.filter(filterFunc, bbox) : [];
		const r = this.right ? this.right.filter(filterFunc, bbox) : [];
		return l.concat(r);
	}
}
