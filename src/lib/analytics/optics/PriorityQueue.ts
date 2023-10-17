class PriorityQueue<T> {
	private _queue: T[];
	private _priorities: number[];
	private _sorting: 'asc' | 'desc';

	constructor(elements?: T[], priorities?: number[], sorting: 'asc' | 'desc' = 'desc') {
		this._queue = [];
		this._priorities = [];
		this._sorting = sorting;

		if (elements && priorities) {
			if (elements.length !== priorities.length) {
				throw new Error('Arrays must have the same length');
			}

			for (let i = 0; i < elements.length; i++) {
				this.insert(elements[i], priorities[i]);
			}
		}
	}

	insert(ele: T, priority: number) {
		let indexToInsert = this._queue.length;
		let index = indexToInsert;

		while (index--) {
			let priority2 = this._priorities[index];
			if (this._sorting === 'desc') {
				if (priority > priority2) {
					indexToInsert = index;
				}
			} else {
				if (priority < priority2) {
					indexToInsert = index;
				}
			}
		}

		this._insertAt(ele, priority, indexToInsert);
	}

	remove(ele: T) {
		let index = this._queue.length;

		while (index--) {
			let ele2 = this._queue[index];
			if (ele === ele2) {
				this._queue.splice(index, 1);
				this._priorities.splice(index, 1);
				break;
			}
		}
	}

	forEach(func: (value: T, index: number, array: T[]) => void) {
		this._queue.forEach(func);
	}

	getElements(): T[] {
		return this._queue;
	}

	getElementPriority(index: number): number {
		return this._priorities[index];
	}

	getPriorities(): number[] {
		return this._priorities;
	}

	getElementsWithPriorities(): [T, number][] {
		let result: [T, number][] = [];

		for (let i = 0, l = this._queue.length; i < l; i++) {
			result.push([this._queue[i], this._priorities[i]]);
		}

		return result;
	}

	private _insertAt(ele: T, priority: number, index: number) {
		if (this._queue.length === index) {
			this._queue.push(ele);
			this._priorities.push(priority);
		} else {
			this._queue.splice(index, 0, ele);
			this._priorities.splice(index, 0, priority);
		}
	}
}

export default PriorityQueue;
