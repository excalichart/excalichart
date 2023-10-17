import type { DuckDBClient } from './DuckDBClient';
import { Query } from '$lib/io/QueryBuilder';
import { DBSCAN } from '$lib/analytics/dbscan/DBScan';
import dayjs from 'dayjs';

class DataIO {
	private db: DuckDBClient;
	private chart: Chart;
	private epsilon: number | undefined;
	private minPoints: number | undefined;

	constructor(db: DuckDBClient, chart: Chart, epsilon?: number, minPoints?: number) {
		this.db = db;
		this.chart = chart;
		this.epsilon = epsilon;
		this.minPoints = minPoints;
	}

	private getQueryObject(chart: Chart): QueryObject {
		return {
			chartID: chart?.chartID,
			queries: {
				select: {
					basic: {
						xColumn: { column: chart?.xColumn },
						yColumn: { column: chart?.yColumn, aggregator: chart?.aggregator },
						from: chart?.filename,
						groupbyColumns: [...(chart?.groupbyColumns ? chart.groupbyColumns : [])],
						filterColumns: [...(chart?.filterColumns ? chart.filterColumns : [])],
						legendKey: chart?.legendKey
					},
					cluster: {
						attributes: [...(chart?.groupbyColumns ? chart.groupbyColumns : [])],
						from: chart.filename
					}
				}
			}
		};
	}

	private createChartTitle(): {
		text: string;
		subtext: string;
		left: string;
	} {
		const queryObject = this.getQueryObject(this.chart);
		const basicQuery = queryObject.queries.select.basic;

		const mainTitleParts: string[] = [];
		const subTitleParts: string[] = [];

		// Define the Main Subject based on aggregator and yColumn
		if (basicQuery.yColumn.aggregator) {
			mainTitleParts.push(`${basicQuery.yColumn.aggregator} of ${basicQuery.yColumn.column}`);
		} else if (basicQuery.yColumn.column) {
			mainTitleParts.push(basicQuery.yColumn.column);
		}

		// Determine X axis context
		if (basicQuery.xColumn.column) {
			mainTitleParts.push(`by ${basicQuery.xColumn.column}`);
		}

		// Determine Grouping Context
		if (basicQuery.groupbyColumns && basicQuery.groupbyColumns.length) {
			mainTitleParts.push(`Grouped by ${basicQuery.groupbyColumns.join(', ')}`);
		}

		// Add Filter Context
		if (basicQuery.filterColumns && basicQuery.filterColumns.length) {
			mainTitleParts.push(
				`Filtered by ${basicQuery.filterColumns.map((fc) => fc.column).join(', ')}`
			);
		}

		// Data source or origin as subtext
		if (basicQuery.from) {
			subTitleParts.push(`Data from ${basicQuery.from}`);
		}

		return {
			text: mainTitleParts.join(' - '),
			subtext: subTitleParts.join(' - '),
			left: 'left'
		};
	}

	private query() {
		const queryObject = this.getQueryObject(this.chart);
		const query = new Query(queryObject, this.chart.workflow);
		return query.build();
	}

	public async queryExportCSV() {
		const queryObject = this.getQueryObject(this.chart);
		const query = new Query(queryObject, this.chart.workflow);
		const queryString = query.getExportQuery();
		const data = await this.getMultiDimensionalData(queryString);
		this.downloadTSV(data, 'export.tsv');
	}

	//TODO: Refactor this function to be more generic
	private updateBasicChart(results: any[], chart: Chart) {
		const xColumn = this.getColumn(chart.xColumn);
		const yColumn = this.getColumn(chart.yColumn);
		let x = results.map((item) => item[xColumn]);
		const y = results.map((item) => item[yColumn]);

		const inferredFormat = this.inferDateFormat(x);
		const allowedFormats = new Set(['HH:mm:ss', 'HH:mm', 'MM-DD', 'MMM YYYY', 'YYYY']);

		if (typeof inferredFormat === 'string' && allowedFormats.has(inferredFormat)) {
			x = x.map((dateString) => dayjs(dateString).format(inferredFormat));
		}

		var title = this.createChartTitle();
		chart.chartOptions.title = title;
		chart.chartOptions.grid = {
			left: '15%'
		};

		if (chart.legendKey) {
			const legendKeyColumn = this.getColumn(chart.legendKey);
			const uniqueLegendKeys = [...new Set(results.map((item) => item[legendKeyColumn]))];

			const groupedData = uniqueLegendKeys.map((legend) => ({
				name: legend,
				data: results
					.filter((item) => item[legendKeyColumn] === legend)
					.map((item) => [item[xColumn], item[yColumn]])
			}));

			chart.chartOptions.series = groupedData.map((group, index) => ({
				name: group.name.toString(),
				type: 'scatter',
				data: group.data
			}));

			chart.chartOptions.legend = {
				top: '3%',
				right: '10%'
			};
			chart.chartOptions.xAxis = {};
			chart.chartOptions.xAxis.type = 'category';
			chart.chartOptions.xAxis.splitLine = false;
		} else {
			chart.chartOptions.xAxis.data = x;
			chart.chartOptions.series[0].data = y;
		}
		return chart;
	}

	private getColumn(column: string | null): string {
		return column ? column.toString() : '';
	}

	private downloadTSV(data: any[], filename: string) {
		const tsv = this.dataToTSV(data);
		const blob = new Blob([tsv], { type: 'text/tsv' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.setAttribute('hidden', '');
		a.setAttribute('href', url);
		a.setAttribute('download', filename);
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}

	private dataToTSV(data: any[]): string {
		const header = Object.keys(data[0]).join('\t');
		const rows = data.map((row) => {
			return Object.values(row)
				.map((val) => {
					if (
						typeof val === 'string' &&
						(val.includes(',') || val.includes('\n') || val.includes('"'))
					) {
						return '"' + val.replace(/"/g, '""') + '"';
					}
					return val;
				})
				.join('\t');
		});

		return `${header}\n${rows.join('\n')}`;
	}

	public async updateChart() {
		console.warn = () => {};
		const queryString = this.query();
		const results = await this.getDataResults(this.db, queryString);
		if (this.chart.workflow === 'basic') {
			return this.updateBasicChart(results, this.chart);
		} else if (this.chart.workflow === 'cluster' && this.chart.chartType === 'density') {
			// Handle logic for clustering and density
		} else if (this.chart.workflow === 'cluster' && this.chart.chartType) {
			const chartResults = this.getAudienceSegmentationResult(results);
			return this.updateAudienceSegmentationChart(chartResults, this.chart);
		}
	}

	private getDensityResults(results: any) {
		const multidimensialArray = results.map((obj: any) => Object.values(obj));
		if (this.epsilon && this.minPoints) {
			const dbscan = new DBSCAN(multidimensialArray, this.epsilon, this.minPoints, 'euclidean');
			const clusters = dbscan.run().getClusters();
			if (multidimensialArray.length > 1000) {
				// Handle larger datasets
				return;
			} else {
				// Handle smaller datasets
				return clusters;
			}
		} else {
			throw new Error('Epsilon and minPoints should be set for density analysis.');
		}
	}

	private getAudienceSegmentationResult(results: any): any[] {
		const multidimensialArray = results.map((obj: any) => Object.values(obj));
		return multidimensialArray;
	}

	private updateAudienceSegmentationChart(results: any[], chart: Chart) {
		// Logic to update chart based on audience segmentation results
		return chart;
	}

	public async getDataResults(db: DuckDBClient, queryString: string): Promise<any[]> {
		try {
			const results = await db.query(queryString);
			return results;
		} catch (error) {
			return [];
		}
	}

	public async getMultiDimensionalData(queryString: string): Promise<any[]> {
		const results = await this.getDataResults(this.db, queryString);
		return results.map((row) => Object.values(row));
	}

	private inferDateFormat(xAxis: string[]): string | string[] {
		console.warn = () => {};

		// Define potential date formats you expect
		const potentialFormats = ['YYYY-MM-DD', 'MM/DD/YYYY', 'DD-MM-YYYY', 'YYYY/MM/DD', 'DD/MM/YYYY'];

		// Check if each date string in xAxis is valid for any of the potential formats
		const allValid = xAxis.every((x) => {
			if (!isNaN(parseFloat(x))) {
				return false;
			}
			return potentialFormats.some((format) => dayjs(x, format, true).isValid());
		});

		if (!allValid) {
			return xAxis;
		}

		const dateObjects = xAxis.map((x) => {
			for (let format of potentialFormats) {
				const dateObj = dayjs(x, format, true);
				if (dateObj.isValid()) {
					return dateObj;
				}
			}
			return dayjs(x); // fallback
		});

		const minDate = dateObjects.reduce((a, b) => (a.isBefore(b) ? a : b));
		const maxDate = dateObjects.reduce((a, b) => (a.isAfter(b) ? a : b));
		console.warn = () => {};

		const rangeInDays = maxDate.diff(minDate, 'day');
		const rangeInHours = maxDate.diff(minDate, 'hour');
		const rangeInMinutes = maxDate.diff(minDate, 'minute');
		const rangeInYears = maxDate.diff(minDate, 'year');

		// Decide on the appropriate format based on the calculated date ranges
		if (rangeInMinutes < 60) {
			return 'HH:mm:ss'; // Hours, minutes, seconds
		} else if (rangeInHours < 24) {
			return 'HH:mm'; // Hours, minutes
		} else if (rangeInDays < 30) {
			return 'MM-DD'; // Month-Day
		} else if (rangeInYears < 1) {
			return 'MMM YYYY'; // Month abbreviation and Year
		} else {
			return 'YYYY'; // Just the year
		}
	}
}

export { DataIO };
