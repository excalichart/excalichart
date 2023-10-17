<script lang="ts">
	import {
		getColumnsFromFile,
		clearChartOptions,
		allCharts,
		clickedChart,
		clickedChartIndex,
		showGroupByAggregator
	} from '$lib/io/Stores';
	import Group from '$lib/components/ui/icons/Group.svelte';
	import CarrotDown from '$lib/components/ui/icons/CarrotDown.svelte';
	import { Tags } from '$lib/components/ui/tags';
	import Aggregator from './Aggregator.svelte';
	let dropdownContainer: HTMLElement;
	let container: HTMLElement;

	let tags: Array<string> = [];
	let selectedButtons: Array<string> = [];
	let isGroupByDropdownOpen: boolean = false;
	let showGroupByTooltip: boolean = false;
	let hoverTimeout: NodeJS.Timeout;

	$: columns = getColumnsFromFile();
	$: clickChart = clickedChart();
	$: i = clickedChartIndex();

	$: if ($allCharts.length > 0 && $allCharts[$i]?.groupbyColumns) {
		let schemaNames = $allCharts[$i].schema.map((item: { name: string }) => item.name);
		let validGroupByColumns = $allCharts[$i].groupbyColumns.filter((column) =>
			schemaNames.includes(column)
		);
		tags = validGroupByColumns;
		$allCharts[$i].groupbyColumns = validGroupByColumns;
	}

	$: if ($clearChartOptions && tags.length > 0 && $clickChart?.groupbyColumns) {
		tags = [];
		let chart: Chart = $allCharts[$i];
		chart.groupbyColumns = [];
		$allCharts[$i] = chart;
	}

	const startGroupByHover = (): void => {
		hoverTimeout = setTimeout(() => {
			showGroupByTooltip = true;
		}, 3000);
	};

	const endGroupByHover = (): void => {
		clearTimeout(hoverTimeout);
		showGroupByTooltip = false;
	};

	const handleEscapeKey = (event: KeyboardEvent) => {
		if (event.key === 'Escape') {
			isGroupByDropdownOpen = false;
		}
	};
	const handleOutsideClick = (event: MouseEvent) => {
		if (dropdownContainer && !dropdownContainer.contains(event.target as Node)) {
			isGroupByDropdownOpen = false;
		}
	};

	const addColumnToGroupBy = (column: string) => {
		let chart = $allCharts[$i];
		if (selectedButtons.includes(column)) {
			selectedButtons = selectedButtons.filter((item) => item !== column);
			tags = tags.filter((tag) => tag !== column);
		} else if (!tags.includes(column)) {
			selectedButtons.push(column);
			tags.push(column);
		}
		chart.groupbyColumns = tags;
		$allCharts[$i] = chart;
	};

	const removeTag = (tag: string) => {
		tags = tags.filter((item) => item !== tag);
		let chart = $allCharts[$i];
		chart.groupbyColumns = tags;
		$allCharts[$i] = chart;
	};
</script>

<div bind:this={container} class="relative">
	<div
		class="flex items-center"
		on:mouseover={startGroupByHover}
		on:mouseout={endGroupByHover}
		on:blur={() => {
			null;
		}}
		on:focus={() => {
			null;
		}}
	>
		<span class="text-sm text-neutral-300">Groupby</span>
		<button
			class="flex w-full items-center justify-between ml-2 mr-2 bg-neutral-900/80 hover:bg-neutral-900/50 rounded-sm"
			on:click={(event) => {
				isGroupByDropdownOpen = !isGroupByDropdownOpen;
				event.stopPropagation();
			}}
		>
			<span class="text-sm ml-2 text-neutral-200">Choose Columns </span>
			<CarrotDown class="hover:text-neutral-300" />
		</button>
		<button
			on:click={() => {
				$showGroupByAggregator = !$showGroupByAggregator;
			}}
		>
			<Group class="hover:text-neutral-300 ml-1" />
		</button>

		{#if isGroupByDropdownOpen}
			<div
				bind:this={dropdownContainer}
				class="scrollBarDiv absolute top-full left-16 rounded-sm bg-neutral-900 shadow-lg transform transition-transform origin-top overflow-y-auto overflow-x-hidden z-10"
			>
				{#each $columns as column (column)}
					<button
						class="block w-full text-left px-3 py-2 hover:bg-neutral-700 font-thin text-sm text-gray-300 truncate"
						on:click={() => {
							addColumnToGroupBy(column);
							showGroupByAggregator.set(true);
						}}
					>
						{column}
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<!--
	{#if showGroupByTooltip}
		<div
			role="tooltip"
			class="absolute left-0 transform -translate-y-1/2 p-2 bg-neutral-200 text-gray-700 text-xs rounded shadow-md"
		>
			Click to select columns for grouping.
		</div>
	{/if}
	-->
</div>
{#if $showGroupByAggregator}
	<div class="mt-2">
		<Tags items={tags} removeItem={removeTag} />
	</div>
	<Aggregator />
{/if}

<style>
	/* For WebKit (Chrome, Safari) */
	.scrollBarDiv::-webkit-scrollbar {
		width: 4px; /* Change this value to make the scrollbar thinner or thicker */
	}

	.scrollBarDiv::-webkit-scrollbar-thumb {
		background-color: rgba(255, 255, 255, 0.3);
		border-radius: 2px; /* Adjust the border-radius as per the new width */
	}

	.scrollBarDiv::-webkit-scrollbar-thumb:hover {
		background-color: rgba(168, 168, 168, 0.5);
	}

	/* For Firefox */
	.scrollBarDiv {
		scrollbar-width: thin; /* This property can have values of "none", "auto", "thin", and "wide" */
		scrollbar-color: rgba(40, 40, 40, 0.3) rgba(0, 0, 0, 0.1);
		max-height: 200px;
		overflow-y: auto;
	}
</style>
