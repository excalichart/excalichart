<script lang="ts">
	import {
		getColumnsFromFile,
		allCharts,
		clickedChartIndex,
		duckDBInstanceStore
	} from '$lib/io/Stores';
	import { checkNameForSpacesAndHyphens } from '$lib/io/FileUtils';
	import FilterDropdown from './FilterDropdown.svelte';
	import FilterRange from './FilterRange.svelte';
	import { onDestroy } from 'svelte';
	import CloseSolid from '$lib/components/ui/icons/CloseSolid.svelte';

	let dropdownContainer: HTMLElement;
	let frequencies: { [key: string]: number } = {};
	let distinctValuesObject: Array<any>;
	let dataValue: string | number | object;
	let selectedColumns: string[] = [];
	let selectedColumn: string = 'Add Filter';
	let showRange = false;
	let showValueDropdown = false;
	let isFieldDropdown = false;
	let min: number;
	let max: number;
	export let filterData: any;

	$: columns = getColumnsFromFile();
	$: i = clickedChartIndex();

	$: {
		if (filterData.column) {
			selectedColumn = filterData.column;
			handleAsyncOperations(selectedColumn);
		}
	}

	$: if (isFieldDropdown) {
		document.addEventListener('click', handleOutsideClick);
	} else {
		document.removeEventListener('click', handleOutsideClick);
	}

	const removeFilter = () => {
		allCharts.update((charts) => {
			//@ts-ignore
			charts[$i].filterColumns = charts[$i].filterColumns.filter(
				//@ts-ignore
				(item) => item.id !== filterData.id
			);
			return charts;
		});
	};

	const handleOutsideClick = (event: MouseEvent) => {
		if (dropdownContainer && !dropdownContainer.contains(event.target as Node)) {
			isFieldDropdown = false;
		}
	};

	const addColumnToFilter = (column: string) => {
		selectedColumn = column;
		if (selectedColumns.includes(column)) {
			selectedColumns = selectedColumns.filter((item) => item !== column);
		} else {
			selectedColumns = [...selectedColumns, column];
		}
		handleAsyncOperations(column);
	};

	const handleAsyncOperations = async (column: string) => {
		let chart = $allCharts[$i];
		if (chart.filename) {
			var filename = checkNameForSpacesAndHyphens(chart.filename);
			var correctColumn = checkNameForSpacesAndHyphens(column);
			const randomValue = await $duckDBInstanceStore.query(
				`SELECT ${correctColumn} as column FROM ${filename} ORDER BY RANDOM() LIMIT 1`
			);
			var formattedData = formatData(randomValue);
			addComponentToFilter(formattedData, correctColumn, filename);
		}
	};

	const addComponentToFilter = async (
		formattedData: any,
		correctColumn: string,
		filename: string
	) => {
		dataValue = formattedData[0].column;
		if (typeof dataValue === 'string') {
			const distinctValues = await $duckDBInstanceStore.query(
				`SELECT DISTINCT ${correctColumn} as distinctValues FROM ${filename}`
			);
			distinctValuesObject = formatData(distinctValues).map((value: any) => value.distinctValues);
			distinctValuesObject = distinctValuesObject.filter((item) => item != null && item != '');
			showValueDropdown = true;
		} else if (typeof dataValue === 'number') {
			const minResp = await $duckDBInstanceStore.query(
				`SELECT MIN(${correctColumn}) as min FROM ${filename}`
			);
			const maxResp = await $duckDBInstanceStore.query(
				`SELECT MAX(${correctColumn}) as max FROM ${filename}`
			);

			min = formatData(minResp)[0].min;
			max = formatData(maxResp)[0].max;
			const histResp = await $duckDBInstanceStore.query(
				`SELECT histogram(${correctColumn}) as hist FROM ${filename}`
			);
			var histResponse = formatData(histResp).map((value: any) => value.hist);
			findFrequencies(histResponse, 20);
			showRange = true;
		}
	};

	function formatData(res: any) {
		const results = JSON.parse(
			JSON.stringify(
				res,
				(_, value) => (typeof value === 'bigint' ? value.toString() : value) // return everything else unchanged
			)
		);
		return results;
	}

	function findFrequencies(arr: { [key: number]: number }[], maxBins: number): void {
		let minRange: number = Infinity;
		let maxRange: number = -Infinity;

		arr.forEach((item) => {
			for (let key in item) {
				if (item[key] < minRange) minRange = item[key];
				if (item[key] > maxRange) maxRange = item[key];
			}
		});
		let range: number = maxRange - minRange;
		let binSize: number = range / maxBins;
		if (maxBins > arr.length) {
			binSize = range / arr.length;
		}

		arr.forEach((item) => {
			for (let key in item) {
				frequencies[key] = (frequencies[key] || 0) + 1;
			}
		});
	}

	onDestroy(() => {
		document.removeEventListener('click', handleOutsideClick);
	});
</script>

<div class="w-full p-4 bg-neutral-900/80 rounded-sm shadow-xl">
	<div class="flex justify-between items-center text-white">
		<div class="relative flex-grow w-full">
			<button
				bind:this={dropdownContainer}
				class="bg-[#303030] w-full rounded-sm hover:bg-neutral-700 flex items-center"
				on:click={() => {
					isFieldDropdown = !isFieldDropdown;
				}}
			>
				<span class="text-sm ml-2"> {selectedColumn}</span>
			</button>

			{#if isFieldDropdown}
				<div
					class={`
					scrollBarDiv bg-neutral-900 absolute top-full w-full mt-2 
					rounded shadow-lg transform transition-transform 
					origin-top overflow-y-auto overflow-x-hidden z-10 
					${isFieldDropdown ? 'translate-y-0 opacity-100' : 'translate-y-1/2 opacity-0'}`}
				>
					{#each $columns as column (column)}
						<button
							class="block w-full text-left px-3 py-2 hover:bg-neutral-800 bg-neutral-900 text-xs"
							on:click={() => {
								addColumnToFilter(column);
								isFieldDropdown = false;
							}}
						>
							{column}
						</button>
					{/each}
				</div>
			{/if}
		</div>
		<button class="ml-2" on:click={removeFilter}>
			<CloseSolid class="w-4 h-4" />
		</button>
	</div>
	<div class="mt-4">
		{#if showRange}
			<FilterRange {min} {max} column={selectedColumn} prevData={filterData.value} />
		{:else if showValueDropdown}
			<FilterDropdown column={selectedColumn} items={distinctValuesObject} />
		{/if}
	</div>
</div>

<style>
	/* For WebKit (Chrome, Safari) */
	.scrollBarDiv::-webkit-scrollbar {
		width: 8px;
	}

	.scrollBarDiv::-webkit-scrollbar-thumb {
		background-color: rgba(255, 255, 255, 0.3);
		border-radius: 4px;
	}

	.scrollBarDiv::-webkit-scrollbar-thumb:hover {
		background-color: rgba(168, 168, 168, 0.5);
	}

	/* For Firefox */
	.scrollBarDiv {
		scrollbar-width: thin;
		scrollbar-color: rgba(40, 40, 40, 0.3) rgba(0, 0, 0, 0.1);
	}

	.selectFieldColor {
		background-color: #33333d;
	}
</style>
