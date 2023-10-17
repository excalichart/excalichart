<script lang="ts">
	import {
		clickedChartIndex,
		allCharts,
		duckDBInstanceStore,
		responsiveType
	} from '$lib/io/Stores';
	import Download from '$lib/components/ui/icons/Download.svelte';
	import { DataIO } from '$lib/io/DataIO';

	$: i = clickedChartIndex();
	$: chartConfig = $allCharts[$i];

	const exportToCSV = async () => {
		const db = $duckDBInstanceStore;
		const data = new DataIO(db, chartConfig);
		await data.queryExportCSV();
	};

	let showTooltip: boolean = false;
	let hoverTimeout: NodeJS.Timeout;

	const startHover = (): void => {
		hoverTimeout = setTimeout(() => {
			showTooltip = true;
		}, 800);
	};

	const endHover = (): void => {
		clearTimeout(hoverTimeout);
		showTooltip = false;
	};
</script>

<div class="relative">
	<div
		aria-label="Export to CSV"
		class="selectFieldColor py-2 dark:text-black w-full h-5 flex justify-between items-center"
	>
		<span class="text-sm font-light text-neutral-300">Export</span>
		<div class="relative ml-3">
			<button
				on:mouseover={startHover}
				on:mouseout={endHover}
				on:focus={() => null}
				on:blur={() => null}
				on:click={exportToCSV}
			>
				<Download class="hover:text-neutral-300 " />
			</button>

			{#if showTooltip && $responsiveType !== 'touch'}
				<div
					role="tooltip"
					class="absolute -left-10 top-full mt-2 p-2 bg-neutral-200 text-gray-700 text-xs rounded shadow-md"
				>
					Export to CSV
				</div>
			{/if}
		</div>
	</div>
</div>
