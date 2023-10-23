<script lang="ts">
	import { onMount } from 'svelte';
	import { allCharts, clickedChartIndex } from '$lib/io/Stores';
	let number: number | undefined;

	// Assuming clickedChartIndex is a store
	$: i = clickedChartIndex();
	//let i: number = $clickedChartIndex;

	onMount(() => {
		if ($allCharts[$i] && typeof $allCharts[$i].limit !== 'undefined') {
			number = $allCharts[$i].limit;
		}
	});

	$: {
		if (typeof number !== 'undefined') {
			$allCharts[$i].limit = number;
		}
	}
</script>

<input
	type="number"
	bind:value={number}
	class="text-black w-24 mt-3 h-6 justify-between items-between"
/>
