<script lang="ts">
	import { allCharts, clickedChartIndex } from '$lib/io/Stores';

	export let column: string;
	export let min: number = 0;
	export let max: number = 1;
	export let prevData: any;

	let lowHandle: string;
	let highHandle: string;

	let slider: HTMLElement;
	let dragging = false;
	let start: number;
	let end: number;
	let handlesDragged = false;

	if (prevData) {
		start = (Number(prevData.min) - min) / (max - min);
		end = (Number(prevData.max) - min) / (max - min);
	} else {
		start = 0;
		end = 1;
	}

	$: {
		if (!handlesDragged) {
			lowHandle = prevData ? String(prevData.min) : '0';
			highHandle = prevData ? String(prevData.max) : '1';
		}
	}

	$: i = clickedChartIndex();

	function updateFilter() {
		if (!column) {
			console.warn('Column is not defined. Filter update skipped.');
			return;
		}
		//@ts-ignore
		const existingFilter = $allCharts[$i].filterColumns.find((filter) => filter.column === column); //@ts-ignore
		const nullFilter = $allCharts[$i].filterColumns.find((filter) => filter.column === null);

		if (existingFilter) {
			existingFilter.value = {
				min: lowHandle,
				max: highHandle
			};
		} else if (nullFilter) {
			nullFilter.column = column;
			nullFilter.value = {
				min: lowHandle,
				max: highHandle
			};
		} else {
			//@ts-ignore
			$allCharts[$i].filterColumns = [
				//@ts-ignore
				...$allCharts[$i].filterColumns,
				{
					column,
					value: {
						min: lowHandle,
						max: highHandle
					}
				}
			];
		}

		allCharts.set($allCharts);
	}

	function draggable(node: HTMLElement) {
		let x: number;

		function handleMousedown(event: MouseEvent | TouchEvent) {
			dragging = true; // Set dragging to true here
			if (event.type === 'touchstart') {
				event = event as TouchEvent;
				x = event.touches[0].clientX;
			} else {
				event = event as MouseEvent;
				x = event.clientX;
			}

			node.dispatchEvent(
				new CustomEvent('dragstart', {
					detail: { x }
				})
			);

			window.addEventListener('mousemove', handleMousemove);
			window.addEventListener('mouseup', handleMouseup);
			window.addEventListener('touchmove', handleMousemove);
			window.addEventListener('touchend', handleMouseup);
		}

		function handleMousemove(event: MouseEvent | TouchEvent) {
			console.log('drag move');
			if (!dragging) return; // If not dragging, exit the function

			if (event.type === 'touchmove') {
				event = event as TouchEvent;
				x = event.changedTouches[0].clientX;
				updateFilter();
			} else {
				event = event as MouseEvent;
				x = event.clientX;
				updateFilter();
			}

			node.dispatchEvent(
				new CustomEvent('dragmove', {
					detail: { x }
				})
			);
		}

		function handleMouseup() {
			dragging = false; // Set dragging to false here
			updateFilter();
			node.dispatchEvent(
				new CustomEvent('dragend', {
					detail: { x }
				})
			);

			window.removeEventListener('mousemove', handleMousemove);
			window.removeEventListener('mouseup', handleMouseup);
			window.removeEventListener('touchmove', handleMousemove);
			window.removeEventListener('touchend', handleMouseup);
		}

		node.addEventListener('mousedown', handleMousedown);
		node.addEventListener('touchstart', handleMousedown);

		return {
			destroy() {
				node.removeEventListener('mousedown', handleMousedown);
				node.removeEventListener('touchstart', handleMousedown);
			}
		};
	}

	function updateHandlePositions(newStart: number, newEnd: number) {
		start = newStart;
		end = newEnd;

		const calculatedLowHandle = (min + start * (max - min)).toFixed(2).slice(0, 3);
		const calculatedHighHandle = (min + end * (max - min)).toFixed(2).slice(0, 3);

		lowHandle = calculatedLowHandle;
		highHandle = calculatedHighHandle;

		handlesDragged = true;
	}

	function setHandlePosition(which: 'start' | 'end') {
		return function (evt: CustomEvent) {
			const { left, right } = slider.getBoundingClientRect();
			const parentWidth = right - left;
			var p = Math.min(Math.max((evt.detail.x - left) / parentWidth, 0), 1);
			var actualValue = min + p * (max - min);
			p = (actualValue - min) / (max - min);

			let newStart = start;
			let newEnd = end;

			if (which === 'start') {
				newStart = p;
				newEnd = Math.max(end, p);
			} else {
				newStart = Math.min(p, start);
				newEnd = p;
			}

			updateHandlePositions(newStart, newEnd);
		};
	}
</script>

<div>
	<!--Chart will hopefully go here -->
	<div class="relative w-full h-2 bg-neutral-700 rounded" bind:this={slider}>
		<div
			class="absolute inset-y-0 bg-neutral-500"
			style="left: {100 * start}%; right: {100 * (1 - end)}%;"
		/>

		<div
			class="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-neutral-200 shadow-md"
			use:draggable
			on:dragmove|preventDefault|stopPropagation={setHandlePosition('start')}
			style="left: calc({100 * start}% - 0.75rem);"
		/>
		<div
			class="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-neutral-200 shadow-md"
			use:draggable
			on:dragmove|preventDefault|stopPropagation={setHandlePosition('end')}
			style="left: calc({100 * end}% - 0.75rem);"
		/>
	</div>
	<div class="flex justify-between mt-2 text-xs">
		{#if lowHandle !== '0' || highHandle !== '1'}
			<div class="px-2 py-2 bg-neutral-700/50 shadow-sm">
				{lowHandle}
			</div>
			<div class="px-2 py-2 shadow-sm bg-neutral-700/50">
				{highHandle}
			</div>
		{/if}
	</div>
</div>
