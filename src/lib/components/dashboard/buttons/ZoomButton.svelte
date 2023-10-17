<script lang="ts">
	import { scale, polygons } from '$lib/io/Stores';
	import { scaleRectangle } from '$lib/components/dashboard/canvas/draw-utils/PolygonOperations';
	import PlusSolid from '$lib/components/ui/icons/PlusSolid.svelte';
	import Minus from '$lib/components/ui/icons/Minus.svelte';

	const increaseZoom = () => {
		applyZoom(true); // zoom in
	};

	const decreaseZoom = () => {
		applyZoom(false); // zoom out
	};

	const applyZoom = (zoomIn: boolean) => {
		const currentScale = $scale;
		let newValue: number;
		let relativeScaleFactor: number;

		if (zoomIn) {
			newValue = currentScale + 0.1; // Adjusted for 20%
		} else {
			newValue = currentScale - 0.1; // Adjusted for 20%
		}

		relativeScaleFactor = newValue / currentScale;
		newValue = Math.max(newValue, 0.2); // Ensure it doesn't go below 0.2 to match the 20% decrease

		scale.set(newValue);

		polygons.update((polys) => {
			return polys.map((poly) => {
				return scaleRectangle(poly, relativeScaleFactor);
			});
		});
	};
</script>

<div
	class="flex justify-center items-center rounded-md shadow-lg bg-neutral-800 p-1 border border-1 border-neutral-700/70"
>
	<div class="divide-neutral-700 flex items-center justify-between space-x-2">
		<button on:click={decreaseZoom} class="p-1.5 transition-colors duration-300 focus:outline-none">
			<Minus class="w-6 h-6 text-neutral-300 hover:text-neutral-50" />
		</button>

		<span class="text-neutral-300 px-2">
			{Math.round($scale * 100) + '%'}
		</span>

		<button on:click={increaseZoom} class="p-1.5 transition-colors duration-300 focus:outline-none">
			<PlusSolid class="w-6 h-6 text-neutral-300 hover:text-neutral-50" />
		</button>
	</div>
</div>
