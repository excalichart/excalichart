import Mst from '$lib/analytics/hdbscan/mst';
import Node from '$lib/analytics/hdbscan/node';

export default class Hdbscan {
	data: any[];
	opt: any[];
	distFunc: any;

	constructor(dataset: any[], distFunc: any = Hdbscan.distFunc.gowerDist) {
		this.data = dataset.map((val) => val.data);
		this.opt = dataset.map((val) => val.opt);
		this.distFunc = distFunc;
	}
	static distFunc: any;

	getTree() {
		const data = this.data;
		const opt = this.opt;
		if (!data || !data.length) {
			throw new Error('invalid data!');
		}

		if (data.length === 1) {
			return new Node({
				left: null,
				right: null,
				data,
				opt,
				dist: null,
				parent: null,
				edge: null
			});
		}

		const mst = new Mst(this.data, this.distFunc);
		const edges = mst.getMst();
		const nodes = data.map(
			(val, i) =>
				new Node({
					left: null,
					right: null,
					data: [val],
					opt: [opt[i]],
					dist: null,
					parent: null,
					edge: null
				})
		);

		let root = null;
		edges //@ts-ignore
			.sort((val1, val2) => val1.dist - val2.dist) //@ts-ignore
			.forEach((val) => {
				const { edge, dist } = val; //@ts-ignore
				const left = nodes[edge[0]].getAncestor(); //@ts-ignore
				const right = nodes[edge[1]].getAncestor();
				const node = new Node({
					left,
					right,
					data: left.data.concat(right.data),
					opt: left.opt.concat(right.opt),
					dist,
					parent: null, //@ts-ignore
					edge: [data[edge[0]], data[edge[1]]]
				});

				left.parent = right.parent = root = node;
			});
		return root;
	}
}

Hdbscan.distFunc = {
	euclidean: (p1: number[], p2: number[]) => {
		let sum = 0;
		if (p1.length !== p2.length) {
			throw new Error('unequal dimension in input data');
		}
		for (let i = 0; i < p1.length; i += 1) {
			sum += Math.pow(p1[i] - p2[i], 2);
		}
		return Math.sqrt(sum);
	},

	gowerDist: (p1: number[], p2: number[]) => {
		let sum = 0;
		if (p1.length !== p2.length) {
			throw new Error('unequal dimension in input data');
		}
		for (let i = 0; i < p1.length; i += 1) {
			sum += Math.abs(p1[i] - p2[i]);
		}
	}
};
