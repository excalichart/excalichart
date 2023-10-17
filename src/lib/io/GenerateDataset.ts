function generateRandomNumber(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
export function generateDataset(
	min: number,
	max: number,
	rows: number,
	dimensions: number
): number[][] {
	let dummyData: number[][] = [];
	for (var i = 0; i < rows; i++) {
		let dataPoint: number[] = [];
		for (var j = 0; j < dimensions; j++) {
			dataPoint.push(generateRandomNumber(min, max));
		}
		dummyData.push(dataPoint);
	}
	return dummyData;
}
