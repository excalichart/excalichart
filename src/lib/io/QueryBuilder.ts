import { checkNameForSpacesAndHyphens } from './FileUtils';

export class Query {
	// Builder Class for constructing DuckDB Queries. If you want to add a feature, add a new method and call it in new Query(queryObject).build
	queryObject: QueryObject;
	workFlow: WorkFlow;

	constructor(queryObject: QueryObject, workflow: WorkFlow) {
		this.queryObject = queryObject;
		this.workFlow = workflow;
	}

	public build() {
		if (this.workFlow === 'basic') {
			return this.getBasicQuery();
		} else if (this.workFlow === 'cluster') {
			return this.getClusterQuery();
		} else if (this.workFlow === 'export') {
			return this.getExportQuery();
		} else {
			return '';
		}
	}

	private checkClusterColumns() {
		let columns = this.queryObject.queries.select.cluster.attributes;
		for (let i = 0; i < columns.length; i++) {
			columns[i] = checkNameForSpacesAndHyphens(columns[i]);
		}
		return columns;
	}

	private getClusterQuery() {
		let columns = this.checkClusterColumns();
		let filename: string = '';

		if (this.queryObject.queries.select.cluster.from) {
			var f = this.queryObject.queries.select.cluster.from;
			filename = checkNameForSpacesAndHyphens(f);
		}

		let query = ['SELECT', columns.join(', '), 'FROM', filename].join(' ');
		return query;
	}

	private getBasicQuery() {
		let yColumn = this.checkSelectBlock().yColumn;

		var groupby = this.constructGroupBy();
		var aggregator = this.queryObject.queries.select.basic.yColumn.aggregator;
		var groupbyColumns = this.queryObject.queries.select.basic.groupbyColumns;
		var filterColumns = this.queryObject.queries.select.basic.filterColumns;
		let filters = '';

		if (aggregator && groupbyColumns)
			yColumn = this.checkAggregator(
				yColumn,
				aggregator,
				this.queryObject.queries.select.basic.groupbyColumns
			);

		if (filterColumns.length > 0) {
			if (groupbyColumns.length > 0) {
				filters = this.constructFilters(filterColumns, true);
			} else {
				filters = this.constructFilters(filterColumns, false);
			}
		}

		//@ts-ignore
		const columns = this.getAllColumns(yColumn);
		var selectQuery = this.constructSelect(columns.join(', '), this.checkSelectBlock().file);
		var queryParts = [selectQuery, groupby, filters];
		var queryString = queryParts.join(' ');
		return queryString;
	}

	private checkSelectBlock() {
		let selectBlock: Queries = this.queryObject.queries;
		let xColumn: string;
		let yColumn: string;
		let file: string;
		if (
			selectBlock.select.basic.xColumn.column &&
			selectBlock.select.basic.yColumn.column &&
			selectBlock.select.basic.from
		) {
			xColumn = checkNameForSpacesAndHyphens(selectBlock.select.basic.xColumn.column);
			yColumn = checkNameForSpacesAndHyphens(selectBlock.select.basic.yColumn.column);
			file = checkNameForSpacesAndHyphens(selectBlock.select.basic.from);
			return { xColumn: xColumn, yColumn: yColumn, file: file };
		} else {
			return { xColumn: null, yColumn: null, file: null };
		}
	}

	private constructGroupBy() {
		let groupbyQuery: string;
		let groupby: string[] = this.queryObject.queries.select.basic.groupbyColumns;
		let selectBlock = this.queryObject.queries.select.basic;

		if (selectBlock.xColumn.column && groupby.length > 0) {
			groupbyQuery = this.checkXColumnInGroupBy(groupby, selectBlock.xColumn.column);
			groupbyQuery = ['', 'GROUP BY', groupbyQuery].join(' ');
		} else {
			return '';
		}
		return groupbyQuery;
	}

	private getAllColumns(processedYColumn?: string): string[] {
		const sanitizedXColumn = checkNameForSpacesAndHyphens(
			this.queryObject.queries.select.basic.xColumn.column
		);

		const baseColumns = [sanitizedXColumn, processedYColumn];

		if (this.queryObject.queries.select.basic.legendKey) {
			baseColumns.push(
				checkNameForSpacesAndHyphens(this.queryObject.queries.select.basic.legendKey)
			);
		}

		const uniqueColumns = [...new Set(baseColumns.filter(Boolean))]; //@ts-ignore
		return uniqueColumns;
	}

	private checkXColumnInGroupBy(groupby: Array<string>, xColumn: string) {
		//if (groupby.find((item) => item === xColumn)) {
		//If X column is in the group
		return groupby.join(', ');
		//}//else {
		//return '';
		//}
	}

	private getAllColumnsQuery(): string {
		const columns = [
			...this.queryObject.queries.select.basic.groupbyColumns,
			this.queryObject.queries.select.basic.xColumn.column,
			this.queryObject.queries.select.basic.yColumn.column
		];
		const uniqueColumns = [...new Set(columns)]; // To ensure unique columns.
		return uniqueColumns.join(', ');
	}

	public getExportQuery(): string {
		const columns = this.getAllColumnsQuery();
		let file: string = '';
		if (this.queryObject.queries.select.basic.from) {
			file = checkNameForSpacesAndHyphens(this.queryObject.queries.select.basic.from);
		}
		let filters = '';

		if (this.queryObject.queries.select.basic.filterColumns.length > 0) {
			filters = this.constructFilters(this.queryObject.queries.select.basic.filterColumns, false);
		}

		const queryParts = [`SELECT ${columns} FROM ${file}`, filters];
		const query = queryParts.join(' ').trim();
		return query;
	}

	private checkAggregator(
		yColumn: string | null,
		aggregator: string | number | null,
		groupbyColumns: Array<string>
	): string | null {
		let column;
		if (groupbyColumns.length > 0) {
			column = `${aggregator}(${yColumn}) AS ${yColumn}`;
			return column;
		} else {
			column = yColumn;
		}
		return column;
	}

	private constructFilters(conditions: any[], hasGroupBy: boolean): string {
		const clauses = conditions.map((condition) => {
			if ('min' in condition.value && 'max' in condition.value) {
				return `${checkNameForSpacesAndHyphens(condition.column)} BETWEEN ${
					condition.value.min
				} AND ${condition.value.max}`;
			} else if ('item' in condition.value) {
				return `${checkNameForSpacesAndHyphens(condition.column)} = '${condition.value.item}'`;
			}
			return '';
		});

		const filteredClauses = clauses.filter(Boolean);

		if (filteredClauses.length === 0) {
			return ''; // Return an empty string if there are no valid conditions
		}
		return (hasGroupBy ? 'HAVING ' : 'WHERE ') + filteredClauses.join(' AND ');
	}

	private constructSelect(columns: string, file: string | null): string {
		if (columns && file) {
			return `SELECT ${columns} FROM ${file}`;
		} else {
			return '';
		}
	}
}
