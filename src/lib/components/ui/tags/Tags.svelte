<script lang="ts">
	import { onMount } from 'svelte';
	import CloseSolid from '$lib/components/ui/icons/CloseSolid.svelte';

	export let items: Array<string> = [];
	export let removeItem: (item: string) => void;

	let selectedItem: number | null = null;

	function selectItem(index: number) {
		removeItem(items[index]);
	}

	onMount(() => {
		const handleClickOutside = () => {
			selectedItem = null;
		};
		document.addEventListener('click', handleClickOutside);

		const handleKeyDown = (event: KeyboardEvent) => {
			if (
				(event.key === 'Escape' || event.key === 'Backspace' || event.key === 'Delete') &&
				selectedItem !== null
			) {
				removeItem(items[selectedItem]);
				selectedItem = null;
			}
		};
		window.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('click', handleClickOutside);
			window.removeEventListener('keydown', handleKeyDown);
		};
	});
</script>

<div
	class="scrollBarDiv bg-[#1c1c1ccd] flex justify-start items-center rounded-md overflow-x-auto border border-1 border-neutral-700/50"
>
	{#each items as item, i (i)}
		<div
			role="button"
			class="flex justify-between items-center m-1 rounded-md text-xs bg-zinc-900 border border-1 border-neutral-700 text-white p-2 cursor-pointer hover:bg-[#9d99dc77] transition duration-150 ease-in-out"
			tabindex="0"
			on:click={() => selectItem(i)}
			on:keydown={(e) => {
				if (e.key === 'Enter') selectItem(i);
			}}
		>
			<span>{item}</span>
			<div
				role="button"
				class="ml-2 items-center cursor-pointer hover:text-gray-400"
				tabindex="0"
				on:click|stopPropagation={() => removeItem(item)}
				on:keydown|stopPropagation={(e) => {
					if (e.key === 'Enter') removeItem(item);
				}}
			>
				<CloseSolid class="w-3 h-3 mt-0.5" color="white" />
			</div>
		</div>
	{/each}
</div>

<style>
	/* Scrollbar styles */

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
</style>
