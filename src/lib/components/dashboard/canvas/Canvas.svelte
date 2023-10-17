<script lang="ts">
	import DrawRectangleCanvas from './shapes/DrawRectangleCanvas.svelte';
	import DrawUtils from './shapes/DrawUtils.svelte';
	import * as PolyOps from './draw-utils/PolygonOperations';
	import {
		navBarState,
		mostRecentChartID,
		touchType,
		touchState,
		canvasBehavior,
		activeDropZone,
		responsiveType,
		activeSidebar,
		screenSize,
		polygons,
		scale,
		panAmount
	} from '$lib/io/Stores';
	import { get } from 'svelte/store';

	import { generateID } from '$lib/io/GenerateID';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	let scrollX: number = 0;
	let scrollY: number = 0;
	let width: number = 0;
	let height: number = 0;
	let newPolygon: Polygon[] = [];
	let touchStartedOnHandle = false;
	let initialDistance: number | null = null;

	let eraserTrail: Point[] = [];

	let startPosition = { x: 0, y: 0 };
	let currentMousePosition = { x: 0, y: 0 };
	let currentTouchPosition = { x: 0, y: 0 };

	let canvas: HTMLCanvasElement;
	let context: CanvasRenderingContext2D | null;
	let offsetX: number = 0;
	let offsetY: number = 0;
	let isDrawingShape = false;

	let hoverIntersection: boolean = false;
	let handlePosition: HandlePosition;

	$: chartIndex = $polygons.findIndex((poly) => poly.id === $mostRecentChartID);
	$: CANVASBEHAVIOR = canvasBehavior();
	$: controlBar($CANVASBEHAVIOR, $responsiveType);

	if (browser) {
		onMount(() => {
			context = canvas.getContext('2d');
			width = window.innerWidth;
			height = window.innerHeight;
			updateOffset();
			window.addEventListener('wheel', handleScroll, { passive: false });
			return () => {
				window.removeEventListener('wheel', handleScroll);
			};
		});
	}

	const updateOffset = () => {
		const rect = canvas.getBoundingClientRect();
		offsetX = rect.left;
		offsetY = Math.abs(rect.top - height);
	};

	const handleMouseDown = (e: MouseEvent | TouchEvent): void => {
		let x: number;
		let y: number;
		if (window.TouchEvent && e instanceof TouchEvent && e.touches.length === 2) {
			initialDistance = getDistance(e.touches[0], e.touches[1]);
		}
		if (window.TouchEvent && e instanceof TouchEvent) {
			responsiveType.set('touch');

			x = e.touches[0].clientX;
			y = e.touches[0].clientY;
		} else if (e instanceof MouseEvent) {
			responsiveType.set('mouse');

			x = e.clientX;
			y = e.clientY;
		} else {
			return;
		}
		x = x - offsetX + scrollX;
		y = y - offsetY + scrollY;
		startPosition = { x, y };

		for (let poly of $polygons) {
			const handlePosition = PolyOps.getHandlesHovered({ x, y }, poly);
			if (handlePosition !== 'center' || handlePosition !== null) {
				touchStartedOnHandle = true;
				break;
			}
		}
		if ($CANVASBEHAVIOR === 'isDrawing') {
			isDrawingShape = true;
		}

		touchState.set('isTouching');
	};

	const handleScroll = (event: WheelEvent) => {
		if (event.ctrlKey) {
			handleZoom(event);
		} else {
			// Update for polygons
			polygons.update((polys) => {
				return polys.map((poly) => {
					return {
						...poly,
						vertices: poly.vertices.map((vertex) => {
							return {
								x: vertex.x,
								y: vertex.y + event.deltaY * 0.85
							};
						})
					};
				});
			});
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

		scale.set(newValue);

		polygons.update((polys) => {
			return polys.map((poly) => {
				return PolyOps.scaleRectangle(poly, relativeScaleFactor);
			});
		});
	};

	function controlBar(touchstate: string, responsiveType: string) {
		if (touchstate === 'isErasing' && responsiveType === 'mouse') {
			activeSidebar.set(false);
		} else if (
			(touchstate === 'isResizing' ||
				touchstate === 'isTranslating' ||
				touchstate === 'isDrawing') &&
			responsiveType === 'mouse'
		) {
			//activeSidebar.set(true);
		} else if (
			touchstate === 'isTouching' &&
			responsiveType === 'mouse' &&
			$touchType === 'default'
		) {
			activeSidebar.set(false);
		}
	}

	const handleMouseUp = (e: MouseEvent | TouchEvent): void => {
		let x: number;
		let y: number;

		if (e instanceof MouseEvent) {
			x = e.clientX;
			y = e.clientY;
		} else if (window.TouchEvent && e instanceof TouchEvent) {
			x = e.changedTouches[0].clientX;
			y = e.changedTouches[0].clientY;
		} else {
			return;
		}

		x = x - offsetX + scrollX;
		y = y - offsetY + scrollY;

		if ($CANVASBEHAVIOR === 'isDrawing') {
			let targetId = generateID();
			const polygon = {
				id: targetId,
				vertices: [
					{ x: startPosition.x, y: startPosition.y },
					{ x: x, y: startPosition.y },
					{ x: x, y: y },
					{ x: startPosition.x, y: y }
				]
			};
			newPolygon = [];
			polygons.update((value) => [...value, polygon]);
			mostRecentChartID.set(targetId);
			if ($screenSize === 'large') activeSidebar.set(true);
		}

		touchState.set('isHovering');
		navBarState.set('select');
	};

	function getDistance(touch1: Touch, touch2: Touch): number {
		const dx = touch1.clientX - touch2.clientX;
		const dy = touch1.clientY - touch2.clientY;
		return Math.sqrt(dx * dx + dy * dy);
	}

	const handleMouseMove = (e: MouseEvent | TouchEvent): void => {
		let x: number;
		let y: number;

		// For two-finger zooming on touch devices
		if (
			window.TouchEvent &&
			e instanceof TouchEvent &&
			e.touches.length === 2 &&
			initialDistance !== null
		) {
			{
				const currentDistance = getDistance(e.touches[0], e.touches[1]);
				let scaleFactor = currentDistance / initialDistance;

				const currentScale = get(scale); // Assuming 'get' retrieves the current scale value.
				const newScale = Math.max(0.1, currentScale * scaleFactor); // Ensure the scale doesn't go below 0.1

				scale.set(newScale);

				initialDistance = currentDistance;
				polygons.update((polys) => {
					return polys.map((poly) => {
						return PolyOps.scaleRectangle(poly, $scale);
					});
				});
				return; // We return early after handling zooming.
			}
		}

		if (window.TouchEvent && e instanceof TouchEvent) {
			x = e.touches[0].clientX;
			y = e.touches[0].clientY;

			// Decide the action based on the touch state
			if ($touchState !== 'isPanning') {
				handleTouchMove(x, y);
			}
		} else if (e instanceof MouseEvent) {
			x = e.clientX;
			y = e.clientY;
		} else {
			return;
		}

		x = x - offsetX + scrollX;
		y = y - offsetY + scrollY;

		if ($CANVASBEHAVIOR === 'isHovering') {
			handleMove(x, y);
		} else {
			handleMouseMoveDown(x, y);
		}
	};

	const handleTouchMove = (x: number, y: number): void => {
		let hoverPolygon = null;
		let direction: string;
		$polygons.find((polygon) => {
			let insidePolygon =
				PolyOps.isPointInPolygon({ x: x, y: y }, polygon) && $navBarState == 'select';
			hoverIntersection = insidePolygon ? true : false;
			if (insidePolygon && touchStartedOnHandle) {
				hoverPolygon = polygon;
				handlePosition = PolyOps.getHandlesHovered({ x, y }, polygon, true);
				direction = PolyOps.getCursorStyleFromDirection(handlePosition);
				touchType.set(direction);
				if (handlePosition) return true;
			}
		});
	};

	const handleMove = (x: number, y: number): void => {
		currentMousePosition = { x: x, y: y };
		let hoverPolygon = null;
		let direction: string;
		$polygons.find((polygon) => {
			let insidePolygon =
				PolyOps.isPointInPolygon(currentMousePosition, polygon) && $navBarState == 'select';
			hoverIntersection = insidePolygon ? true : false;
			if (insidePolygon && touchStartedOnHandle) {
				hoverPolygon = polygon;
				handlePosition = PolyOps.getHandlesHovered(currentMousePosition, polygon, false);
				direction = PolyOps.getCursorStyleFromDirection(handlePosition);
				touchType.set(direction);
				if (handlePosition) return true;
			} else {
				if ($touchType !== 'pointer') touchType.set('default');
			}
		});
	};

	const handleErase = (x: number, y: number): void => {
		currentTouchPosition = { x: x, y: y };
		handleEraseShape(x, y);
		const polygon = PolyOps.getContainingPolygon(currentTouchPosition, $polygons);

		if (polygon) {
			polygons.update((polys) => {
				const index = polys.findIndex((p) => p === polygon);
				if (index > -1) {
					polys.splice(index, 1);
				}
				return polys;
			});
		}
	};

	const handleCreateShapes = (x: number, y: number): void => {
		const polygon = {
			vertices: [
				{ x: startPosition.x, y: startPosition.y },
				{ x: x, y: startPosition.y },
				{ x: x, y: y },
				{ x: startPosition.x, y: y }
			]
		};
		if ($CANVASBEHAVIOR === 'isDrawing') {
			newPolygon = [polygon];
		}
	};

	const handleEraseShape = (x: number, y: number): void => {
		eraserTrail = [...eraserTrail, { x: x, y: y }];
	};

	const handleResize = (x: number, y: number): void => {
		if (chartIndex !== null && handlePosition !== null && $CANVASBEHAVIOR === 'isResizing') {
			const poly = $polygons[chartIndex];
			const newPolygon = PolyOps.resizeRectangle(x, y, poly, handlePosition);
			$polygons[chartIndex] = newPolygon;
		}
	};

	const handlePan = (x: number, y: number): void => {
		const deltaX = x - currentMousePosition.x;
		const deltaY = y - currentMousePosition.y;

		polygons.update((polys) => {
			return polys.map((poly) => {
				return {
					...poly,
					vertices: poly.vertices.map((vertex) => {
						return {
							x: vertex.x + deltaX,
							y: vertex.y + deltaY
						};
					})
				};
			});
		});

		currentMousePosition = { x, y };
	};

	const handleMouseMoveDown = (x: number, y: number): void => {
		switch ($CANVASBEHAVIOR) {
			case 'isDrawing':
				handleCreateShapes(x, y);
				break;

			case 'isErasing':
				handleErase(x, y);
				break;

			case 'isResizing':
				handleResize(x, y);
				break;

			case 'isPanning':
				handlePan(x, y);
				break;

			default:
				return;
		}
	};
</script>

<div class="w-full h-full top-0 left-0 fixed">
	<div class="h-full w-full" style={`cursor: ${$touchType};`}>
		<div id="canvasParent">
			{#if !$activeDropZone}
				{#each $polygons as polygon}
					<DrawRectangleCanvas {polygon} />
				{/each}
				{#each newPolygon as polygon}
					<DrawRectangleCanvas {polygon} />
				{/each}
			{/if}
		</div>
		<DrawUtils />
	</div>
	<canvas bind:this={canvas} />
</div>

<svelte:window
	on:resize={() => {
		if (typeof window !== undefined) {
			width = window.innerWidth;
			height = window.innerHeight;
		}
	}}
	on:mousedown={(e) => {
		if (typeof window !== undefined) {
			handleMouseDown(e);
		}
	}}
	on:mousemove={(e) => {
		if (typeof window !== undefined) {
			handleMouseMove(e);
		}
	}}
	on:mouseup={(e) => {
		if (typeof window !== undefined) {
			handleMouseUp(e);
		}
	}}
	on:touchstart={(e) => {
		if (typeof window !== undefined) {
			handleMouseDown(e);
		}
	}}
	on:touchmove={(e) => {
		if (typeof window !== undefined) {
			handleMouseMove(e);
		}
	}}
	on:touchend={(e) => {
		if (typeof window !== undefined) {
			handleMouseUp(e);
		}
	}}
/>
