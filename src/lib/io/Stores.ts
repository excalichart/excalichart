/**  State Management for eCharts Stores **/
import {
	storeToLocalStorage,
	storeFromLocalStorage,
	storeFromSessionStorage,
	storeToSessionStorage
} from '$lib/io/Storage';
import type { DuckDBClient } from './DuckDBClient';
import { writable, derived } from 'svelte/store';
import { DataIO } from '$lib/io/DataIO';

export const globalMouseState = writable<boolean>(false);
export const isMouseDown = writable<boolean>(false);
export const navBarState = writable<NavBar>('select');
export const touchState = writable<TouchState>('isHovering');
export const mostRecentChartID = writable<string | null>(null);
export const chosenFile = writable<string | null>('');
export const newChartID = writable<string>();
export const activeSidebar = writable<boolean>(false);
export const clearChartOptions = writable<boolean>(false);
export const timesVisitedDashboard = writable<number>(0);
export const groupbyColumns = writable<string[]>([]);
export const touchType = writable<string | null>();
export const workflowIDColumn = writable<string | null>();
export const epsilonDistance = writable<number>();
export const minimumPointsForCluster = writable<number>();
export const filters = writable<any[]>([]);
export const keyPress = writable<string>('');
export const mobileNav = writable<MobileBar | null>(null);
export const activeMobileNav = writable<boolean>(false);
export const responsiveType = writable<string>();
export const insideOutsideClick = writable<string>('outside');
export const showGroupByAggregator = writable<boolean>(true);
export const tabValue = writable<number>(1);
export const screenSize = writable<'small' | 'large'>();
export const duckDBInstanceStore = writable<DuckDBClient>();
export const activeDropZone = writable<boolean>(storeFromSessionStorage('activeDropZone', true));
export const allCharts = writable<Chart[]>(storeFromLocalStorage('allCharts', []));
export const fileUploadStore = writable<FileUpload[]>(storeFromLocalStorage('fileUploadStore', []));
export const arrows = writable<Arrow[]>(storeFromLocalStorage('arrowsStore', []));
export const lockSidebar = writable<boolean>(storeFromLocalStorage('lockSidebar', true));
export const selectedColumnStore = writable<ColumnName[]>([]);
export const polygons = writable<Polygon[]>(storeFromLocalStorage('polygon', []));
export const scale = writable<number>(storeFromLocalStorage('zoom', 1));
export const panAmount = writable<{ x: number; y: number }>(
	storeFromLocalStorage('panAmount', { x: 0, y: 0 })
);

export const getFileFromStore = () =>
	derived([fileUploadStore, chosenFile], ([$fileUploadStore, $chosenFile]) => {
		const fObject = $fileUploadStore.find(
			(axis: { filename: string }) => axis.filename == $chosenFile
		);
		return fObject;
	});

export const getColumnsFromFile = () =>
	derived([allCharts, mostRecentChartID], ([$allCharts, $mostRecentChartID]) => {
		const options = $allCharts.find(
			(item: { chartID: string }) => item.chartID === $mostRecentChartID
		);
		if (options?.columns) {
			return options.columns;
		} else {
			return [];
		}
	});

export const chartOptions = () =>
	derived([allCharts, mostRecentChartID], ([$allCharts, $mostRecentChartID]) => {
		const options = $allCharts.find(
			(item: { chartID: string }) => item.chartID === $mostRecentChartID
		);
		return {
			datasetID: options?.datasetID,
			filename: options?.filename,
			xColumn: options?.xColumn,
			yColumn: options?.yColumn,
			columns: options?.columns,
			groupbyColumns: options?.groupbyColumns,
			filterColumns: options?.filterColumns,
			aggregator: options?.aggregator
		};
	});

export const getChartOptions = (id: string | undefined) => {
	if (id) {
		return derived(
			[allCharts, epsilonDistance, minimumPointsForCluster, duckDBInstanceStore], //@ts-ignore
			async (
				[$allCharts, $epsilonDistance, $minimumPointsForCluster, $duckDBInstanceStore],
				set
			) => {
				if ($allCharts.length > 0) {
					const chart = $allCharts.find((item: { chartID: string }) => item.chartID === id);
					if (chart) {
						const db = $duckDBInstanceStore;
						const newChart = new DataIO(db, chart, $epsilonDistance, $minimumPointsForCluster);
						const chartOption = await newChart.updateChart();
						set(chartOption);
					}
				} else {
					set(undefined);
				}
			}
		);
	}
};

export const fileDropdown = () =>
	derived(fileUploadStore, ($fileUploadStore) => {
		const filenames = $fileUploadStore.map((chart) => chart.filename);
		const uniqueFilenames = [...new Set(filenames)];
		return uniqueFilenames;
	});

export const clickedChart = () =>
	derived([allCharts, mostRecentChartID], ([$allCharts, $mostRecentChartID]) => {
		if ($allCharts.length > 0) {
			const dataset = $allCharts.find(
				(item: { chartID: string }) => item.chartID === $mostRecentChartID
			);
			return dataset;
		}
	});

export const clickedChartIndex = () =>
	derived([allCharts, mostRecentChartID], ([$allCharts, $mostRecentChartID]) => {
		const i = $allCharts.findIndex(
			(item: { chartID: string }) => item.chartID === $mostRecentChartID
		);
		return i;
	});

export const canvasBehavior = () => {
	return derived(
		[navBarState, touchState, touchType, responsiveType],
		([$navBarState, $touchState, $touchType, $responsiveType]) => {
			let behavior: TouchState;
			if ($navBarState === 'drawRectangle' && $touchState === 'isTouching') {
				behavior = 'isDrawing';
			} else if ($navBarState === 'eraser' && $touchState === 'isTouching') {
				behavior = 'isErasing';
			} else if (
				$navBarState === 'select' &&
				$touchState === 'isTouching' &&
				$touchType !== 'move' &&
				$touchType !== 'default'
			) {
				behavior = 'isResizing';
			} else if (
				$navBarState === 'select' &&
				$touchType === 'move' &&
				$touchState === 'isTouching'
			) {
				behavior = 'isTranslating';
			} else if ($navBarState === 'select' && $touchState === 'isHovering') {
				behavior = 'isHovering';
			} else if ($navBarState === 'pan' && $touchState === 'isTouching') {
				behavior = 'isPanning';
			} else if (
				$navBarState === 'select' &&
				$touchState === 'isTouching' &&
				$responsiveType === 'mouse' &&
				$touchType === 'default'
			) {
				behavior = 'isTouching';
			} else if ($navBarState === 'drawArrow' && $touchState === 'isTouching') {
				behavior = 'isDrawingArrow';
			} else {
				return 'default';
			}
			return behavior;
		}
	);
};

export const columnLabel = (axis: string) =>
	derived([allCharts, mostRecentChartID], ([$allCharts, $mostRecentChartID]) => {
		const options = $allCharts.find(
			(item: { chartID: string }) => item.chartID === $mostRecentChartID
		);
		if (options) {
			let axisColumn;
			let columns = options.columns;
			if (axis === 'X') {
				axisColumn = options.xColumn;
			} else if (axis === 'Y') {
				axisColumn = options.yColumn;
			}
			if (columns && axisColumn) {
				if (columns.includes(axisColumn)) {
					return axisColumn;
				} else {
					return `${axis.toUpperCase()} Axis`;
				}
			} else {
				return `${axis.toUpperCase()} Axis`;
			}
		} else {
			return `${axis.toUpperCase()} Axis`;
		}
	});

storeToLocalStorage(fileUploadStore, 'fileUploadStore');
storeToLocalStorage(allCharts, 'allCharts');
storeToLocalStorage(arrows, 'arrowsStore');
storeToLocalStorage(lockSidebar, 'lockSidebar');
storeToLocalStorage(polygons, 'polygon');
storeToSessionStorage(activeDropZone, 'activeDropZone');
