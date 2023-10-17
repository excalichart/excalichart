<script lang="ts">
	import {
		getColumnsFromFile,
		allCharts,
		clickedChartIndex,
		duckDBInstanceStore
	} from '$lib/io/Stores';
	import { onDestroy } from 'svelte';
	import Tags from '$lib/components/ui/tags/Tags.svelte';
	import { checkNameForSpacesAndHyphens } from '$lib/io/FileUtils';

	let dropdownContainer: HTMLElement;
	let tags: Array<string> = [];
	let selectedButtons: Array<string> = [];
	let isDropdownOpen: boolean = false;

	$: columns = getColumnsFromFile();
	$: i = clickedChartIndex();

	$: {
		if (isDropdownOpen) {
			document.addEventListener('click', handleOutsideClick);
		} else {
			document.removeEventListener('click', handleOutsideClick);
		}
	}

	const handleOutsideClick = (event: MouseEvent) => {
		if (dropdownContainer && !dropdownContainer.contains(event.target as Node)) {
			closeDropdown();
		}
	};

	const handleAsyncOperations = async (column: string) => {
		let chart = $allCharts[$i];
		if (chart.filename) {
			var filename = checkNameForSpacesAndHyphens(chart.filename);
			var correctColumn = checkNameForSpacesAndHyphens(column);
			const distinctValues = await $duckDBInstanceStore.query(
				`SELECT DISTINCT ${correctColumn} as distinctValues FROM ${filename}`
			);
			var distinctValuesObject = formatData(distinctValues).map(
				(value: any) => value.distinctValues
			);
			return distinctValuesObject;
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
	const addKey = async (column: string) => {
		let chart = $allCharts[$i];
		selectedButtons.push(column);
		tags = [column];
		var keys = await handleAsyncOperations(column);
		chart.legendValues = keys;
		chart.legendKey = column;
		chart.chartOptions.legend = {
			display: true,
			data: keys,
			position: 'right',
			labels: {
				fontColor: '#fff'
			}
		};
		$allCharts[$i] = chart;
	};

	const removeTag = () => {
		let chart = $allCharts[$i];
		chart.legendKey = null;
		$allCharts[$i] = chart;
	};

	const toggleDropdown = () => {
		isDropdownOpen = !isDropdownOpen;
	};

	const closeDropdown = () => {
		isDropdownOpen = false;
	};

	onDestroy(() => {
		document.removeEventListener('click', handleOutsideClick);
	});
</script>

<div class="w-full p-4 rounded-sm relative selectFieldColor">
	<button
		bind:this={dropdownContainer}
		class="bg-gray-200 w-full rounded-sm hover:bg-gray-300 flex-grow flex items-center"
		on:click={toggleDropdown}
	>
		<span class="text-sm ml-2"> Select Key </span>
	</button>

	{#if isDropdownOpen}
		<button
			class={`
            scrollBarDiv bg-gray-900 absolute top-full w-full mt-2 border
            rounded shadow-lg transform transition-transform 
            origin-top overflow-y-auto overflow-x-hidden z-10 
            ${isDropdownOpen ? 'translate-y-0 opacity-100' : 'translate-y-1/2 opacity-0'}`}
			on:click|stopPropagation={closeDropdown}
		>
			{#each $columns as column (column)}
				<button
					class="block w-full text-left bg-gray-900 text-gray-200 px-3 py-2 hover:bg-gray-200"
					on:click={() => {
						addKey(column);
					}}
				>
					{column}
				</button>
			{/each}
		</button>
	{/if}
	<div class="mt-4 flex-grow">
		{#if tags.length > 0}
			<span class="text-sm"> Columns </span>
			<Tags items={tags} removeItem={removeTag} />
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
		max-height: 200px; /* Adjust this value to your desired maximum height */
		overflow-y: auto;
	}

	.selectFieldColor {
		background-color: #33333d;
	}
</style>
