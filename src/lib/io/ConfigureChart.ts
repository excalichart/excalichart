interface EChartOption {
	title?: {
		text: string;
	};
	tooltip?: any;
	legend?: any;
	xAxis?: any;
	yAxis?: any;
	series?: any[];
	// ... You can expand this interface to cover other ECharts properties
}

/**
Example usage:
const config = new EChartConfigBuilder()
	.setTitle('My Chart')
	.setTooltip({ trigger: 'axis' })
	.setXAxis({ type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] })
	.setYAxis({ type: 'value' })
	.setSeries([
		{
			name: 'Series 1',
			type: 'bar',
			data: [10, 52, 200, 334, 390, 330, 220]
		}
	])
	.build();

console.log(config);

*/
class EChartConfigBuilder {
	private configuration: EChartOption = {};

	setTitle(title: string): this {
		this.configuration.title = {
			text: title
		};
		return this;
	}

	setTooltip(tooltip: any): this {
		this.configuration.tooltip = tooltip;
		return this;
	}

	setLegend(legend: any): this {
		this.configuration.legend = legend;
		return this;
	}

	setXAxis(xAxis: any): this {
		this.configuration.xAxis = xAxis;
		return this;
	}

	setYAxis(yAxis: any): this {
		this.configuration.yAxis = yAxis;
		return this;
	}

	setSeries(series: any[]): this {
		this.configuration.series = series;
		return this;
	}

	build(): EChartOption {
		return this.configuration;
	}
}

export default EChartConfigBuilder;
