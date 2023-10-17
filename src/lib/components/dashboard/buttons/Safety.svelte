<script lang="ts">
	import Safety from '$lib/components/ui/icons/Safety.svelte';

	let isPressedHelp = false;
	let pressTimeoutHelp: NodeJS.Timeout;

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

<div
	class="bg-neutral-800 w-10 h-10 flex justify-center items-center rounded-md border-neutral-700/70"
	on:mouseenter={() => (hoverSecure = true)}
	on:mouseleave={() => (hoverSecure = false)}
>
	{#if hoverSecure}
		<!-- Tooltip display condition -->
		<div
			class="absolute mt-2 w-48 p-2 bg-neutral-700 text-neutral-200 rounded-md text-sm right-full mr-2 transform translate-x-25 shadow-lg"
		>
			Your data never leaves your computer
		</div>
	{/if}
	<Safety class="text-purple-300 hover:text-purple-400" />
</div>
