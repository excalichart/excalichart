<script lang="ts">
	import { activeDropZone, activeSidebar } from '$lib/io/Stores';
	import PlusSolid from '$lib/components/ui/icons/PlusSolid.svelte';

	const handleClick = (): void => {
		activeDropZone.set(true);
		activeSidebar.set(false);
	};

	let showTooltip: boolean = false;
	let hoverTimeout: NodeJS.Timeout;

	const startHover = (): void => {
		// Show tooltip after 0.8 seconds (800 milliseconds)
		hoverTimeout = setTimeout(() => {
			showTooltip = true;
		}, 800);
	};

	const endHover = (): void => {
		// Clear timeout to avoid showing the tooltip if hover duration is less than 0.8 seconds
		clearTimeout(hoverTimeout);
		showTooltip = false;
	};
</script>

<div class="relative inline-flex">
	<button
		aria-label="Add Dataset"
		on:click={handleClick}
		on:mouseover={startHover}
		on:mouseout={endHover}
		on:blur={() => {
			null;
		}}
		on:focus={() => {
			null;
		}}
	>
		<PlusSolid class="hover:text-gray-300" />
	</button>

	<!-- Tooltip element -->
	{#if showTooltip}
		<div
			role="tooltip"
			class="absolute -left-10 top-full mt-2 p-2 bg-neutral-200 text-gray-700 text-xs shadow-md"
		>
			Add Dataset
		</div>
	{/if}
</div>
