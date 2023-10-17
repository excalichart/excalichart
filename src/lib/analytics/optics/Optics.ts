import PriorityQueue from './PriorityQueue'; // assuming you have a PriorityQueue implemented

type point = Array<number | string>;
type DistanceFunction = (a: number[], b: number[]) => number;

export class OPTICS {
	private epsilon: number = 1;
	private minPts: number = 1;
	private distance: DistanceFunction => number = this.gowerDistance;
	private reachability: number[];
	private processed: number[];
	private coreDistance: number;
	private orderedList: number[];
	private clusters: number[][];
	private dataset: Point[];

	constructor(
		dataset: Point[],
		epsilon: number,
		minPts: number,
		distance: DistanceFunction = this.gowerDistance
	) {
		this.init(dataset, epsilon, minPts, distance);
	}

	public run(): number[][] {

		for (let pointId = 0; pointId < this.dataset.length; pointId++) {
			if (this.processed[pointId] !== 1) {
				this.processed[pointId] = 1;
				this.clusters.push([pointId]);
				const clusterId = this.clusters.length - 1;

				this.orderedList.push(pointId);
				let priorityQueue = new PriorityQueue<number>([], [], 'asc');
				let neighbors = this.regionQuery(pointId);

				if (this.distanceToCore(pointId) !== undefined) {
					this.updateQueue(pointId, neighbors, priorityQueue);
					this.expandCluster(clusterId, priorityQueue);
				}
			}
		}

		return this.clusters;
	}

	public getReachabilityPlot(): Array<[number, number]> {
		const reachabilityPlot: Array<[number, number]> = [];

		for (let i = 0; i < this.orderedList.length; i++) {
			const pointId = this.orderedList[i];
			const distance = this.reachability[pointId];

			reachabilityPlot.push([pointId, distance]);
		}

		return reachabilityPlot;
	}

	private init(
		dataset: Point[],
		epsilon: number,
		minPts: number,
		distance: (a: Point, b: Point) => number
	) {
		if (dataset) {
			this.dataset = dataset;
			this.clusters = [];
			this.reachability = new Array<number>(this.dataset.length);
			this.processed = new Array<number>(this.dataset.length);
			this.coreDistance = 0;
			this.orderedList = [];
		}

		if (epsilon) {
			this.epsilon = epsilon;
		}

		if (minPts) {
			this.minPts = minPts;
		}

		if (distance) {
			this.distance = distance;
		}
	}

	private updateQueue(pointId: number, neighbors: number[], queue: PriorityQueue<number>) {
		this.coreDistance = this.distanceToCore(pointId)!;
		neighbors.forEach((pointId2) => {
			if (this.processed[pointId2] === undefined) {
				let dist = this.distance(this.dataset[pointId], this.dataset[pointId2]);
				let newReachableDistance = Math.max(this.coreDistance, dist);

				if (this.reachability[pointId2] === undefined) {
					this.reachability[pointId2] = newReachableDistance;
					queue.insert(pointId2, newReachableDistance);
				} else {
					if (newReachableDistance < this.reachability[pointId2]) {
						this.reachability[pointId2] = newReachableDistance;
						queue.remove(pointId2);
						queue.insert(pointId2, newReachableDistance);
					}
				}
			}
		});
	}

	private expandCluster(clusterId: number, queue: PriorityQueue<number>) {
		let queueElements = queue.getElements();

		for (let p = 0; p < queueElements.length; p++) {
			let pointId = queueElements[p];
			if (this.processed[pointId] === undefined) {
				let neighbors = this.regionQuery(pointId);
				this.processed[pointId] = 1;

				this.clusters[clusterId].push(pointId);
				this.orderedList.push(pointId);

				if (this.distanceToCore(pointId) !== undefined) {
					this.updateQueue(pointId, neighbors, queue);
					this.expandCluster(clusterId, queue);
				}
			}
		}
	}

	private distanceToCore(pointId: number): number | undefined {
		let l = this.epsilon;
		for (let coreDistCand = 0; coreDistCand < l; coreDistCand++) {
			let neighbors = this.regionQuery(pointId, coreDistCand);
			if (neighbors.length >= this.minPts) {
				return coreDistCand;
			}
		}
	}

	private regionQuery(pointId: number, epsilon?: number): number[] {
		epsilon = epsilon || this.epsilon;
		let neighbors = [];

		for (let id = 0; id < this.dataset.length; id++) {
			if (this.distance(this.dataset[pointId], this.dataset[id]) < epsilon) {
				neighbors.push(id);
			}
		}

		return neighbors;
	}

	private euclideanDistance(p: Point, q: Point): number {
		let sum = 0;
		let i = Math.min(p.length, q.length);

		while (i--) {
			sum += (p[i] - q[i]) * (p[i] - q[i]);
		}

		return Math.sqrt(sum);
	}
	private gowerDistance(p: (number | string)[], q: (number | string)[]): number {
		let sum = 0;
		let validDimensions = 0;

		for (let i = 0; i < p.length; i++) {
			if (p[i] !== null && q[i] !== null) {
				if (typeof p[i] === 'number' && typeof q[i] === 'number') {
					const max = Math.max(
						//@ts-ignore
						...p.filter((x) => typeof x === 'number'),
						...q.filter((x) => typeof x === 'number')
					);
					const min = Math.min(
						//@ts-ignore
						...p.filter((x) => typeof x === 'number'),
						...q.filter((x) => typeof x === 'number')
					);
					sum += Math.abs((p[i] as number) - (q[i] as number)) / (max - min);
				} else if (typeof p[i] === 'string' && typeof q[i] === 'string') {
					sum += p[i] === q[i] ? 0 : 1;
				}
				validDimensions++;
			}
		}

		return sum / validDimensions;
	}
}
