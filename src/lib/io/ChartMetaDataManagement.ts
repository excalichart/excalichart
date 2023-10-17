import { allCharts } from './Stores';

const addChartMetaData = (id: string): void => {
	let chartMetaData: Chart = {
		chartID: id,
		title: '',
		chartType: null,
		filename: null,
		aggregator: null,
		datasetID: null,
		columns: [],
		schema: [],
		workflow: 'basic',
		groupbyColumns: [],
		filterColumns: [],
		xColumn: null,
		yColumn: null,
		/*
		Maybe I should seperate this out to a different store.
		
		The end goal is not to query the database everytime I move the canvas.
		But... If I use a derived store, it would do that anyway. Maybe I need to do some composition instead.

		*/
		legendValues: [],
		legendKey: null,
		chartOptions: {
			xAxis: {},
			series: [{ data: [], type: '', barWidth: '60%' }],
			yAxis: {
				splitLine: { show: false },
				type: 'value'
			},
			legend: {
				data: []
			}
		}
	};

	allCharts.update((value) => [...value, chartMetaData]);
};

export { addChartMetaData };
