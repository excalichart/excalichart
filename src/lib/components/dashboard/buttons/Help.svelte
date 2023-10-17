<script lang="ts">
	import Help from '$lib/components/ui/icons/Help.svelte';
	import { activeDropZone, tabValue, responsiveType } from '$lib/io/Stores';

	let isPressedHelp = false;
	let isPressedSecure = false;
	let pressTimeoutHelp: NodeJS.Timeout;
	let pressTimeoutSecure: NodeJS.Timeout;

	let hoverHelp = false; // Declare a new variable
	let hoverSecure = false;
	let width: number = 0;

	const startPressHelp = (): void => {
		isPressedHelp = true;
		pressTimeoutHelp = setTimeout(() => {
			if (isPressedHelp) hoverHelp = true;
		}, 800);
	};

	const endPressHelp = (): void => {
		isPressedHelp = false;
		clearTimeout(pressTimeoutHelp);
		hoverHelp = false;
	};
</script>

<button
	class={`z-40 bg-neutral-800 w-10 h-10  flex justify-center items-center rounded-md border-neutral-700/70 ${
		isPressedHelp ? 'bg-neutral-500' : ''
	}`}
	on:click={() => {
		activeDropZone.set(true);
		tabValue.set(2);
	}}
	on:mouseenter={() => (hoverHelp = true)}
	on:mouseleave={() => (hoverHelp = false)}
	on:mousedown={startPressHelp}
	on:mouseup={endPressHelp}
	on:touchstart={startPressHelp}
	on:touchend={endPressHelp}
>
	{#if hoverHelp && ($responsiveType === 'touch' || isPressedHelp)}
		<div
			class="absolute mt-2 w-48 p-2 bg-neutral-700 text-neutral-200 rounded-md text-sm right-full mr-2 transform translate-x-25 shadow-lg"
		>
			Open Help and Tips
		</div>
	{/if}
	<Help
		class={`text-neutral-300 ${isPressedHelp ? 'text-neutral-600' : 'hover:text-neutral-400'}`}
	/>
</button>
