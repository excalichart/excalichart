export class EChartBuilder {
	protected chartOption?: ChartType;
	private xData: Array<any>;
	private yData: Array<any>;
	private xType: string | null;
	private xAxisType: string;

	constructor(
		chartOption: ChartType = 'Bar',
		xData: Array<any> = [],
		yData: Array<any> = [],
		xType: string | null = 'category'
	) {
		this.chartOption = chartOption;
		this.xData = xData;
		this.yData = yData;
		this.xType = xType;
		this.xAxisType = this.getColumnType(this.xData);
	}

	getColumnType(column: Array<any>): string {
		let dtype: string = 'category';
		if (typeof this.xType === null) {
			dtype = inferPlotType(column);
		}
		return dtype;
	}

	getOptions() {
		var options = {
			xAxis: {
				data: this.xData,
				type: this.xAxisType
			},
			toolbox: {
				show: true,
				dataView: {
					readOnly: false
				},
				restore: {},
				saveAsImage: {}
			},
			yAxis: {
				type: 'value'
			},
			series: [
				{
					data: this.yData,
					type: this.chartOption
				}
			]
		};
		return options;
	}
}

function inferPlotType(data: Array<any>): string {
	let plotAxisType: string;

	if (data.find((element) => typeof element === 'number') == true) {
		plotAxisType = 'numerical';
	} else {
		plotAxisType = 'category';
	}

	return plotAxisType;
}
