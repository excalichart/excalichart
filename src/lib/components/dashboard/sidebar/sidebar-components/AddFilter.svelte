<script lang="ts">
	import Filter from '$lib/components/ui/icons/FilterIcon.svelte';
	import { allCharts, clickedChartIndex, responsiveType } from '$lib/io/Stores';

	let filterIDCounter = 0;
	let showTooltip: boolean = false;
	let hoverTimeout: NodeJS.Timeout;
	let isPressed = false;

	$: i = clickedChartIndex();

	const addFilterToSidebar = () => {
		filterIDCounter += 1;
		allCharts.update((charts) => {
			//@ts-ignore
			charts[$i].filterColumns = [
				//@ts-ignore
				...$allCharts[$i].filterColumns, //@ts-ignore
				{ column: null, value: null, id: filterIDCounter }
			];
			return charts;
		});
	};

	const endHover = (): void => {
		clearTimeout(hoverTimeout);
		showTooltip = false;
	};

	const startPress = (): void => {
		isPressed = true;
		startHover(); // Show tooltip immediately when pressed
	};

	const endPress = (): void => {
		isPressed = false;
		endHover();
	};

	const handleLongPress = (): void => {
		if (isPressed) {
			// Logic for long press action. You can call any function or perform any action here.
			addFilterToSidebar();
		}
	};

	// Update startHover method to also handle the long press
	const startHover = (): void => {
		hoverTimeout = setTimeout(() => {
			showTooltip = true;
			handleLongPress(); // Handle the long press after the timeout
		}, 800);
	};
</script>

<div class="relative inline-flex">
	<button
		aria-label="Add Filter"
		on:click={addFilterToSidebar}
		on:mouseover={startHover}
		on:mouseout={endHover}
		on:focus={() => null}
		on:blur={() => null}
	>
		<Filter class="hover:text-neutral-300" />
	</button>

	<!-- Tooltip element -->
	{#if showTooltip && $responsiveType !== 'touch'}
		<div
			role="tooltip"
			class="absolute -left-10 top-full mt-2 p-2 bg-neutral-200 text-gray-700 text-xs rounded-sm shadow-md"
		>
			Add Filter
		</div>
	{/if}
</div>
