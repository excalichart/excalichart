<script>
	import { screenSize, activeSidebar, lockSidebar, touchType } from '$lib/io/Stores';
	import ChevronDown from '$lib/components/ui/icons/ChevronDown.svelte';
	import ChevronLeft from '$lib/components/ui/icons/ChevronLeft.svelte';
	import ChevronRight from '$lib/components/ui/icons/ChevronRight.svelte';

	const toggleSidebar = () => {
		touchType.set('pointer');
		if ($screenSize === 'small') {
			$activeSidebar = !$activeSidebar;
			lockSidebar.set(false);
		} else {
			$lockSidebar = !$lockSidebar;
		}
	};
</script>

<div
	class="transform transition-transform ease-out duration-300 left-72 ml-4 cursor-pointer {$activeSidebar ||
	$lockSidebar
		? ''
		: '-translate-x-72'} absolute mt-10"
>
	<button
		class="bg-neutral-600 h-5 w-5 rounded-sm flex justify-center items-center hover:bg-neutral-600/80 mt-1"
		on:click={toggleSidebar}
		on:mouseover={() => {
			touchType.set('pointer');
		}}
		on:focus={() => {
			touchType.set('pointer');
		}}
	>
		{#if $lockSidebar}
			<ChevronDown class="hover:text-neutral-300 text-neutral-200" />
		{:else if $activeSidebar}
			<ChevronLeft class="hover:text-neutral-300 text-neutral-200" />
		{:else}
			<ChevronRight class="hover:text-neutral-300 text-neutral-200" />
		{/if}
	</button>
</div>
