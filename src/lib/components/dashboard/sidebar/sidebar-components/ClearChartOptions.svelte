<script lang="ts">
	import { clearChartOptions } from '$lib/io/Stores'; //@ts-ignore
	//import Button from 'flowbite-svelte/Button.svelte';

	function clearUpdatedChartObject() {
		$clearChartOptions = true;
		setTimeout(() => {
			$clearChartOptions = false;
		}, 100);
	}
</script>
