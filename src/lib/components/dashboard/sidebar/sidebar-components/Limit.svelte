<script lang="ts">
	import { allCharts, clickedChartIndex } from '$lib/io/Stores';
	import { onMount } from 'svelte';
	let number: number | undefined;
	$: i = clickedChartIndex();

	onMount(() => {
		if ($allCharts[$i]?.limit) {
			number = $allCharts[$i].limit;
		}
	});
</script>

<input
	type="number"
	min="0"
	bind:value={number}
	on:input={() => {
		if (
			$allCharts &&
			$allCharts[$i] &&
			typeof number === 'number' &&
			$allCharts[$i].limit !== number
		) {
			$allCharts[$i].limit = number;
		}
	}}
	class="text-black w-24 mt-3 h-6 justify-between items-between"
/>
