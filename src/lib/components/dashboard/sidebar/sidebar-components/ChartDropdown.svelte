<script lang="ts">
	import { allCharts, clickedChartIndex, responsiveType } from '$lib/io/Stores';
	import Info from '$lib/components/ui/icons/Info.svelte';

	let dropdownContainer: HTMLElement;
	let showInfoTooltip: boolean = false;
	let hoverTimeout: NodeJS.Timeout;
	let chosenPlot: string = 'Bar Chart (Default)';
	let isChartDropdownOpen: boolean = false;
	let rectangleCharts: any[] = [
		{ chartType: 'Bar' },
		{ chartType: 'Scatter' },
		{ chartType: 'Pie' },
		{ chartType: 'Line' },
		{ chartType: 'Area' }
	];

	$: i = clickedChartIndex();

	$: if ($allCharts[$i]?.chartType) {
		chosenPlot = capitalizeFirstLetter($allCharts[$i].chartType);
	} else {
		chosenPlot = 'Bar Chart (Default)';
	}

	function capitalizeFirstLetter(string: string | null) {
		if (!string) return '';
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	const chooseChart = (plot: string) => {
		chosenPlot = plot;
		plot = plot.toLowerCase();

		allCharts.update((charts) => {
			let updatedChart = charts[$i];
			updatedChart.chartType = plot;

			if (plot === 'area') {
				updatedChart.chartOptions.series[0].type = 'line';
				updatedChart.chartOptions.series[0].areaStyle = {};
			} else {
				updatedChart.chartOptions.series[0].type = plot;
			}
			charts[$i] = updatedChart;
			return [...charts];
		});
	};

	const closeChartDropdown = () => {
		isChartDropdownOpen = false;
	};

	const startInfoHover = (): void => {
		hoverTimeout = setTimeout(() => {
			showInfoTooltip = true;
		}, 800);
	};

	const endInfoHover = (): void => {
		clearTimeout(hoverTimeout);
		showInfoTooltip = false;
	};

	const toggleChartDropdown = () => {
		isChartDropdownOpen = !isChartDropdownOpen;
	};

	const handleOutsideClick = (event: MouseEvent) => {
		if (dropdownContainer && !dropdownContainer.contains(event.target as Node)) {
			closeChartDropdown();
		}
	};
</script>

<div class="w-full py-4 rounded-sm relative ml-4">
	<div class="flex justify-between items-center">
		<button
			bind:this={dropdownContainer}
			class="bg-neutral-900 w-full rounded-sm hover:bg-neutral-900/50 flex-grow flex items-center"
			on:click={toggleChartDropdown}
		>
			<span class="text-sm ml-2 font-thin text-gray-100">
				{chosenPlot}
			</span>
		</button>
		<div
			class="ml-3 relative"
			on:mouseover={startInfoHover}
			on:mouseout={endInfoHover}
			on:blur={() => {
				null;
			}}
			on:focus={() => {
				null;
			}}
		>
			<Info class="hover:text-neutral-300" />

			<!-- Tooltip for Info icon -->
			{#if showInfoTooltip && $responsiveType !== 'touch'}
				<div
					role="tooltip"
					class="absolute -left-20 top-full mt-2 p-2 bg-neutral-200 text-gray-700 text-xs rounded-sm shadow-md z-10"
				>
					Information about the chart type.
				</div>
			{/if}
		</div>
	</div>
</div>
{#if isChartDropdownOpen}
	<button
		class="scrollBarDiv bg-neutral-900 absolute rounded-md top-0 left-14 mt-56 shadow-lg transform transition-transform origin-top overflow-y-auto overflow-x-hidden z-10"
		on:click|stopPropagation={closeChartDropdown}
	>
		{#each rectangleCharts as { chartType }, i (i)}
			<button
				class="block w-full text-left px-3 py-2 hover:bg-neutral-700 font-thin text-sm text-gray-300"
				on:click={() => {
					chooseChart(chartType);
					isChartDropdownOpen = false;
				}}
			>
				{chartType}
			</button>
		{/each}
	</button>
{/if}

<style>
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
