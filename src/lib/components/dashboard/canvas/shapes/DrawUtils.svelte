<script lang="ts">
	import {
		doLinesIntersect,
		pointToLineDistance,
		scaleArrow
	} from '../draw-utils/PolygonOperations';
	import { drawEraserTrail, drawArrow } from '../draw-utils/Draw';
	import { rough } from '$lib/components/ui/roughjs/rough';
	import { canvasBehavior, arrows, scale } from '$lib/io/Stores';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';

	let roughCanvas: any;
	let canvas: HTMLCanvasElement;
	let context: CanvasRenderingContext2D | null;
	let width: number = 0;
	let height: number = 0;
	let eraserTrail: Point[] = [];
	let CANVASBEHAVIOR = canvasBehavior();

	let isCanvasFocused = false;
	let isDragging = false;
	let isDraggingArrow = false;
	let mouseMoved = false;
	let handlesActivated = false;
	let arrowCloseEnough = false;

	let hoveredCircleIndex: number | null = null;
	let hoveredCircleEnd: 'start' | 'end' | null = null;
	let draggingArrowIndex: number | null = null;
	const MIN_DRAG_DISTANCE = 10;

	let offsetX: number = 0;
	let offsetY: number = 0;

	let startX: number = 0;
	let startY: number = 0;
	const MAX_TRAIL_LENGTH = 7;
	let draggingEnd: 'start' | 'end' | null = null;

	let roughness = 0.8;
	let strokeWidth = 1;

	onMount(() => {
		context = canvas.getContext('2d');
		roughCanvas = rough.canvas(canvas);
		width = window.innerWidth;
		height = window.innerHeight;
		updateOffset();
		canvas.width = width;
		canvas.height = height;
		document.addEventListener('mouseup', handleMouseUp);
		canvas.addEventListener('mousedown', (e) => e.preventDefault());
		window.addEventListener('wheel', handleScroll, { passive: false });

		return () => {
			document.removeEventListener('mouseup', handleMouseUp);
			canvas.removeEventListener('mousedown', (e) => e.preventDefault());
			window.removeEventListener('wheel', handleScroll);
		};
	});

	let animationFrameId: number | null = null;

	const updateCanvas = () => {
		if (context) {
			context.clearRect(0, 0, width, height);
			redrawArrows();
		}
		animationFrameId = null;
	};

	const handleScroll = (event: WheelEvent) => {
		if (event.ctrlKey) {
			handleZoom(event);
		} else {
			$arrows = $arrows.map((arrow) => {
				return {
					...arrow,
					startX: arrow.startX,
					startY: arrow.startY + event.deltaY,
					endX: arrow.endX,
					endY: arrow.endY + event.deltaY,
					midX: arrow.midX,
					midY: arrow.midY + event.deltaY
				};
			});

			if (!animationFrameId) {
				animationFrameId = requestAnimationFrame(updateCanvas);
			}
		}
	};

	const handleZoom = (event: WheelEvent) => {
		event.preventDefault();
		const currentScale = get(scale);
		let newValue: number;
		let relativeScaleFactor: number;

		if (event.deltaY > 0) {
			newValue = currentScale - 0.1;
			relativeScaleFactor = newValue / currentScale;
		} else {
			newValue = currentScale + 0.1;
			relativeScaleFactor = newValue / currentScale;
		}
		newValue = Math.max(newValue, 0.1);

		arrows.update((polys) => {
			return polys.map((poly) => {
				return scaleArrow(poly, relativeScaleFactor);
			});
		});

		scale.set(newValue);

		if (!animationFrameId) {
			animationFrameId = requestAnimationFrame(updateCanvas);
		}
	};

	const handleCircleMouseDown = (e: MouseEvent, index: number, end: 'start' | 'end') => {
		e.stopPropagation();
		isDragging = true;
		draggingArrowIndex = index;
		draggingEnd = end;
	};

	const updateOffset = () => {
		const rect = canvas.getBoundingClientRect();
		offsetX = rect.left;
		offsetY = Math.abs(rect.top - height);
	};

	const handleMouseStart = (e: MouseEvent | TouchEvent) => {
		if (e instanceof MouseEvent) {
			startX = e.clientX;
			startY = e.clientY;
		} else if (window.TouchEvent && e instanceof TouchEvent) {
			if (e.touches.length > 0) {
				startX = e.touches[0].clientX;
				startY = e.touches[0].clientY;
			} else {
				return;
			}
		} else {
			return;
		}

		for (let i = 0; i < $arrows.length; i++) {
			let arrow = $arrows[i];
			const distanceToLine = pointToLineDistance(
				startX,
				startY,
				arrow.startX,
				arrow.startY,
				arrow.endX,
				arrow.endY
			);

			if (distanceToLine < 10) {
				handlesActivated = true;
				draggingArrowIndex = i;
				arrowCloseEnough = true;
				isDraggingArrow = true;
				break;
			} else {
				arrowCloseEnough = false;
				handlesActivated = true;
			}
		}
		if (!arrowCloseEnough) {
			handlesActivated = false;
			isDraggingArrow = false;
		}
	};

	const handleMouseMove = (e: MouseEvent | TouchEvent) => {
		let clientX: number;
		let clientY: number;

		if (e instanceof MouseEvent) {
			clientX = e.clientX;
			clientY = e.clientY;
		} else if (window.TouchEvent && e instanceof TouchEvent) {
			if (e.touches.length > 0) {
				clientX = e.touches[0].clientX;
				clientY = e.touches[0].clientY;
			} else {
				return; // If no touch points are available, return from the function
			}
		} else {
			return; // Not a MouseEvent or TouchEvent
		}

		mouseMoved = true;

		eraserTrail = [...eraserTrail, { x: clientX, y: clientY }];

		while (eraserTrail.length > MAX_TRAIL_LENGTH) {
			eraserTrail.shift();
		}

		if (context) {
			context.clearRect(0, 0, width, height);
			redrawArrows();
			if ($CANVASBEHAVIOR === 'isErasing') {
				drawEraserTrail(eraserTrail, context, '#433f3f50', 6);
				eraseIntersectingArrows();
			} else if ($CANVASBEHAVIOR === 'isDrawingArrow') {
				drawArrow(roughCanvas, strokeWidth, roughness, startX, startY, clientX, clientY);
			} else if ($CANVASBEHAVIOR === 'isPanning') {
				const deltaX = clientX - startX;
				const deltaY = clientY - startY;
				$arrows = $arrows.map((arrow) => {
					return {
						...arrow,
						startX: arrow.startX + deltaX,
						startY: arrow.startY + deltaY,
						endX: arrow.endX + deltaX,
						endY: arrow.endY + deltaY,
						midX: arrow.midX + deltaX,
						midY: arrow.midY + deltaY
					};
				});
				startX = clientX;
				startY = clientY;
			}
		}

		if (isDraggingArrow && draggingArrowIndex !== null) {
			const deltaX = clientX - startX;
			const deltaY = clientY - startY;

			$arrows[draggingArrowIndex].startX += deltaX;
			$arrows[draggingArrowIndex].startY += deltaY;
			$arrows[draggingArrowIndex].endX += deltaX;
			$arrows[draggingArrowIndex].endY += deltaY;
			$arrows[draggingArrowIndex].midX += deltaX;
			$arrows[draggingArrowIndex].midY += deltaY;

			startX = clientX;
			startY = clientY;
		} else if (isDragging && draggingArrowIndex !== null) {
			if (draggingEnd === 'start') {
				$arrows[draggingArrowIndex].startX = clientX;
				$arrows[draggingArrowIndex].startY = clientY;
			} else if (draggingEnd === 'end') {
				$arrows[draggingArrowIndex].endX = clientX;
				$arrows[draggingArrowIndex].endY = clientY;
			}
		}

		redrawArrows();
	};

	const handleMouseUp = (e: MouseEvent | TouchEvent) => {
		let clientX: number;
		let clientY: number;

		if (e instanceof MouseEvent) {
			clientX = e.clientX;
			clientY = e.clientY;
		} else if (window.TouchEvent && e instanceof TouchEvent) {
			if (e.changedTouches.length > 0) {
				clientX = e.changedTouches[0].clientX;
				clientY = e.changedTouches[0].clientY;
			} else {
				return;
			}
		} else {
			return;
		}

		const distanceMoved = Math.sqrt((clientX - startX) ** 2 + (clientY - startY) ** 2);

		if ($CANVASBEHAVIOR === 'isDrawingArrow' && mouseMoved && distanceMoved > MIN_DRAG_DISTANCE) {
			$arrows = [
				...$arrows,
				{
					startX,
					startY,
					endX: clientX,
					endY: clientY,
					midX: (clientX + startX) / 2,
					midY: (clientY + startY) / 2
				}
			];
		}
		if (context) {
			eraserTrail = [];
			context.clearRect(0, 0, width, height);
			redrawArrows();
		}

		if (isDragging) {
			isDragging = false;
			draggingArrowIndex = null;
			draggingEnd = null;
		}
		if (isDragging || isDraggingArrow) {
			isDragging = false;
			isDraggingArrow = false;
			draggingArrowIndex = null;
			draggingEnd = null;
		}
		mouseMoved = false;
	};

	const eraseIntersectingArrows = () => {
		for (let i = 0; i < eraserTrail.length - 1; i++) {
			for (let j = $arrows.length - 1; j >= 0; j--) {
				const arrow = $arrows[j];
				if (
					doLinesIntersect(
						{ x: arrow.startX, y: arrow.startY },
						{ x: arrow.endX, y: arrow.endY },
						eraserTrail[0],
						eraserTrail[eraserTrail.length - 1]
					)
				) {
					arrows.update((arrows) => {
						arrows.splice(j, 1);
						return arrows;
					});
					if (draggingArrowIndex === j) {
						draggingArrowIndex = null;
						handlesActivated = false;
					}
				}
			}
		}
	};

	const redrawArrows = () => {
		for (let arrow of $arrows) {
			drawArrow(
				roughCanvas,
				strokeWidth,
				roughness,
				arrow.startX,
				arrow.startY,
				arrow.endX,
				arrow.endY,
				$scale
			);
		}
	};
</script>

<div
	class="absolute h-full w-full"
	on:mousedown={handleMouseStart}
	on:mousemove={handleMouseMove}
	on:mouseup={handleMouseUp}
	on:touchstart={handleMouseStart}
	on:touchmove={handleMouseMove}
	on:touchend={handleMouseUp}
>
	<canvas style="position: fixed; z-index: {isDragging ? 4 : 1};" bind:this={canvas} />
	<svg
		viewBox={`0 0 ${width} ${height}`}
		style="position: absolute;  top: 0; left: 0; z-index:  {isDragging ? 4 : 1};"
	>
		{#if handlesActivated}
			{#each $arrows as arrow, i}
				{#if arrow}
					<circle
						class="circle-focusable"
						cx={arrow.startX}
						cy={arrow.startY}
						r={hoveredCircleIndex === i && hoveredCircleEnd === 'start' ? '7' : '5'}
						fill="#26262777"
						stroke="#9d99dc77"
						stroke-width="2"
						on:mousedown={(e) => handleCircleMouseDown(e, i, 'start')}
						on:mouseover={() => {
							hoveredCircleIndex = i;
							hoveredCircleEnd = 'start';
						}}
						on:mouseout={() => {
							hoveredCircleIndex = null;
							hoveredCircleEnd = null;
						}}
						on:focus={() => (isCanvasFocused = true)}
						on:blur={() => (isCanvasFocused = false)}
					/>
					<circle
						class="circle-focusable"
						cx={arrow.endX}
						cy={arrow.endY}
						r={hoveredCircleIndex === i && hoveredCircleEnd === 'end' ? '7' : '5'}
						stroke="#9d99dc77"
						stroke-width="2"
						fill="#26262777"
						on:mousedown={(e) => handleCircleMouseDown(e, i, 'end')}
						on:mouseover={() => {
							hoveredCircleIndex = i;
							hoveredCircleEnd = 'end';
						}}
						on:mouseout={() => {
							hoveredCircleIndex = null;
							hoveredCircleEnd = null;
						}}
						on:focus={() => (isCanvasFocused = true)}
						on:blur={() => (isCanvasFocused = false)}
					/>
				{/if}
			{/each}
		{/if}
	</svg>
</div>
<svelte:window
	on:resize={() => {
		if (typeof window !== 'undefined') {
			width = window.innerWidth;
			height = window.innerHeight;
			if (canvas) {
				canvas.width = width;
				canvas.height = height;
			}
		}
	}}
/>

<style>
	/* Initial circle styling */
	.circle-focusable {
		transition: stroke 0.3s, fill 0.3s;
	}

	/* Styling for the focused circle */
	.circle-focusable:focus {
		stroke: #5a3360; /* Change to desired stroke color for focus */
		fill: #574a5b; /* Change to desired fill color for focus */
		outline: none; /* Remove browser's default outline */
	}
</style>
