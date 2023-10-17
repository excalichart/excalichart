<script lang="ts">
	import { clickedChartIndex, allCharts, getColumnsFromFile, responsiveType } from '$lib/io/Stores';
	export let open = false;

	let currentValue: string | null = '';
	let showTooltip: boolean = false;
	let hoverTimeout: NodeJS.Timeout;
	let container: HTMLElement;

	$: i = clickedChartIndex();
	$: columns = getColumnsFromFile();

	$: if (
		$allCharts.length > 0 &&
		$allCharts[$i] &&
		$allCharts[$i].yColumn !== null &&
		$allCharts[$i].filename !== null &&
		$allCharts[$i].filename !== undefined
	) {
		currentValue = $allCharts[$i].yColumn;

		// Check if xColumn value exists in schema's name
		let yColumnExistsInSchema = $allCharts[$i].schema.some(
			(item: { name: string }) => item.name === currentValue
		);

		// If xColumn value doesn't exist in schema's name, set currentValue to ''
		if (!yColumnExistsInSchema) {
			currentValue = '';
		}
	} else {
		currentValue = '';
	}

	const startHover = (): void => {
		hoverTimeout = setTimeout(() => {
			showTooltip = true;
		}, 800);
	};

	const endHover = (): void => {
		clearTimeout(hoverTimeout);
		showTooltip = false;
	};

	const handleChoose = (column: string) => {
		allCharts.update((charts) => {
			charts[$i].yColumn = column;
			currentValue = column;
			const selectedColumnSchema = $allCharts[$i].schema.find(
				(item: { name: string }) => item.name === column
			);

			if (selectedColumnSchema && selectedColumnSchema.type === 'string') {
				charts[$i].aggregator = 'count'; //@ts-ignore
				if (charts[$i].xColumn) charts[$i].groupbyColumns = [charts[$i].xColumn];
			}
			return charts;
		});
	};

	const handleOutsideClick = (event: MouseEvent) => {
		if (container && !container.contains(event.target as Node)) {
			open = false;
		}
	};
</script>

<div bind:this={container} class="flex-grow relative">
	<div class="flex items-center">
		<button
			aria-label="Toggle Dropdown"
			class="mx-auto bg-neutral-900 w-full rounded-sm justify-center hover:bg-neutral-900/50 flex-grow flex items-center text-center border-neutral-700/50"
			on:click={() => (open = !open)}
			on:mouseover={startHover}
			on:mouseout={endHover}
			on:blur={null}
			on:focus={null}
		>
			<span class="text-sm text-neutral-300 ml-1">Y</span>
			<span class="text-sm text-gray-100 w-full justify-center truncate px-3">
				{currentValue}
			</span>
		</button>

		<!-- Tooltip element -->
		{#if showTooltip && $responsiveType !== 'touch'}
			<div
				role="tooltip"
				class="absolute -left-10 top-full mt-2 p-2 bg-neutral-200 text-gray-700 text-xs rounded-sm shadow-md z-10"
			>
				Toggle Dropdown for Y-axis
			</div>
		{/if}
	</div>
	{#if open}
		<div
			class="scrollBarDiv bg-neutral-900 rounded-md absolute top-0 left-0 mt-5 transform transition-transform origin-top overflow-y-auto overflow-x-hidden z-10"
		>
			{#each $columns as column}
				<button
					class="block w-full text-left px-3 py-2 text-gray-300 hover:bg-neutral-700 font-thin text-sm truncate"
					on:click={() => {
						handleChoose(column);
						open = false;
					}}
				>
					{column}
				</button>
			{/each}
		</div>
	{/if}
</div>

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
