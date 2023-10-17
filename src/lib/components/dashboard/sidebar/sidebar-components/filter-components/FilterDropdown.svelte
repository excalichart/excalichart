<script lang="ts">
	import { allCharts, clickedChartIndex } from '$lib/io/Stores';
	import Tags from '$lib/components/ui/tags/Tags.svelte';

	export let items: any[] = [];
	export let column: string;

	let filterValues: string[] = [];
	let isDropdownOpen: boolean = false;

	$: i = clickedChartIndex();

	$: {
		filterValues = // @ts-ignore
			$allCharts[$i] && $allCharts[$i].filterColumns // @ts-ignore
				? $allCharts[$i].filterColumns.filter((f) => f.column === column).map((f) => f.value.item)
				: [];
	}

	function updateFilter(filterItem: string) {
		if (!column) {
			console.warn('Column is not defined. Filter update skipped.');
			return;
		}

		const currentChartFilterColumns = getChartFilterColumns($i);

		const existingFilter = findFilterByColumn(currentChartFilterColumns, column);

		if (existingFilter) {
			existingFilter.value = { item: filterItem };
		} else {
			updateOrCreateFilter(currentChartFilterColumns, filterItem);
		}

		if (!findFilterValue(filterValues, filterItem)) {
			filterValues = [...filterValues, filterItem];
		}

		allCharts.set($allCharts);
	}

	function getChartFilterColumns(index: number): any[] {
		return $allCharts[index].filterColumns;
	}

	function findFilterByColumn(filters: any[], col: string) {
		return filters.find((filter) => filter.column === col);
	}

	function updateOrCreateFilter(filters: any[], filterItem: string) {
		const nullFilter = filters.find((filter) => filter.column === null);

		if (nullFilter) {
			nullFilter.column = column;
			nullFilter.value = { item: filterItem };
		} else {
			filters.push({
				column,
				value: { item: filterItem }
			});
		}
	}

	function findFilterValue(filterValues: any[], itemValue: string) {
		return filterValues.find((item) => item.item === itemValue);
	}

	function removeSelectedTag(item: string) {
		filterValues = filterValues.filter((val) => val !== item);
		const filterIndex = $allCharts[$i].filterColumns.findIndex(
			(filter) => filter.column === column && filter.value.item === item
		);
		if (filterIndex > -1) {
			$allCharts[$i].filterColumns.splice(filterIndex, 1);
		}
	}

	const toggleDropdown = () => {
		isDropdownOpen = !isDropdownOpen;
	};
</script>

<div class="relative group" on:click={toggleDropdown} on:keypress={null}>
	<button
		class="bg-neutral-900/80 w-full rounded-sm hover:bg-neutral-900 flex-grow justify-between flex items-center shadow-lg border-neutral-700/50 border border-1"
	>
		<span class="text-sm ml-2"> Filter Value </span>
	</button>
	<div
		class={`
			 scrollBarDiv bg-neutral-900  absolute w-full mt-2 
			 rounded shadow-lg transform transition-transform 
			 origin-top min-h-40 overflow-y-auto overflow-x-hidden
    		${isDropdownOpen ? 'translate-y-0 opacity-100' : 'translate-y-1/2 opacity-0'}`}
	>
		{#each items as item (item)}
			<button
				class="block w-full bg-neutral-900 text-left text-gray-300 px-3 py-2 dark:text-gray-400 hover:bg-neutral-800 truncate text-xs"
				on:click={() => updateFilter(item)}
			>
				{item}
			</button>
		{/each}
	</div>
	{#if filterValues.length > 0}
		<Tags items={filterValues} removeItem={removeSelectedTag} />
	{/if}
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
</style>
