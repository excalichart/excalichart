<script lang="ts">
	import { Cursor, Rectangle, Eraser, Arrow, HandGrab } from './navbar-icons';
	import { navBarState, keyPress, responsiveType } from '$lib/io/Stores';

	let activeIndex: number | null | undefined = null;
	let showTooltip: { [key: number]: boolean } = {};
	let hoveredIndex: number | null = null;
	let hoverTimeout: NodeJS.Timeout;
	let longPressTimeout: NodeJS.Timeout;
	let isPressed = false;
	let clickedIndex: number | null = null;

	let icons: { name: string; mode: NavBar; component: any; index: number; tooltip: string }[] = [
		{ name: 'HandGrab', mode: 'pan', component: HandGrab, index: 0, tooltip: 'Pan Canvas' },
		{
			name: 'Cursor',
			mode: 'select',
			component: Cursor,
			index: 1,
			tooltip: 'Select Items'
		},
		{
			name: 'Rectangle',
			mode: 'drawRectangle',
			component: Rectangle,
			index: 2,
			tooltip: 'Draw Rectangle'
		},
		{
			name: 'Arrow',
			mode: 'drawArrow',
			component: Arrow,
			index: 3,
			tooltip: 'Draw Arrow'
		},
		{
			name: 'Eraser',
			mode: 'eraser',
			component: Eraser,
			index: 4,
			tooltip: 'Erase Canvas'
		}
	];

	$: if ($keyPress !== null) {
		activeIndex = parseInt($keyPress);
	}

	$: {
		const selectedIcon = icons.find((icon) => icon.mode === $navBarState);
		activeIndex = selectedIcon ? selectedIcon.index : null;
	}

	$: if (activeIndex !== null) {
		const selectedIcon = icons.find((icon) => icon.index === activeIndex);
		if (selectedIcon) {
			navBarState.set(selectedIcon.mode);
		}
	}

	const setMode = (mode: NavBar, indexClicked: number) => {
		navBarState.set(mode);
		activeIndex = indexClicked;

		// Add these lines to remember the clicked button and hide the tooltip for touch devices
		if ($responsiveType === 'touch') {
			clickedIndex = null;
			showTooltip = {};
		} else {
			clickedIndex = indexClicked;
		}
	};

	const startHover = (index: number): void => {
		hoveredIndex = index;
		hoverTimeout = setTimeout(() => {
			showTooltip[index] = true;
		}, 500); // Show tooltip after 500ms
	};

	const endHover = (): void => {
		clearTimeout(hoverTimeout);
		showTooltip = {};
		hoveredIndex = null;
	};

	const startLongPress = (index: number): void => {
		isPressed = true;

		startHover(index);

		longPressTimeout = setTimeout(() => {
			showTooltip[index] = true;
		}, 500);
	};

	const endLongPress = (): void => {
		isPressed = false;

		clearTimeout(longPressTimeout);
		endHover(); // Reset the hover state
	};
</script>

<div
	class="flex justify-center items-center rounded-md shadow-lg h-12 bg-neutral-800 p-1 border border-1 border-neutral-700/70"
>
	<div class="divide-neutral-700 divide-x space-x-2 flex justify-between">
		<div class="flex items-center justify-items-center space-x-3">
			<div
				on:click={() => setMode('pan', 0)}
				on:mouseover={() => startHover(0)}
				on:mouseout={endHover}
				on:touchstart={() => startLongPress(0)}
				on:touchend={endLongPress}
				on:keypress={null}
				on:blur={null}
				on:focus={null}
				class={`flex items-center w-8 h-8 justify-center mx-1 rounded-md overflow-hidden ${
					activeIndex === 0
						? 'bg-[#6f6599]'
						: $responsiveType !== 'touch' || isPressed
						? 'hover:text-neutral-700/90 hover:bg-neutral-500'
						: ''
				}`}
			>
				<HandGrab
					class="w-5 h-5 ml-1  text-neutral-400 hover:text-neutral-200 active:text-neutral-50"
				/>
				<div class="bottom-0 right-0 mt-4">
					<span class="text-xs text-neutral-500">0</span>
				</div>

				{#if showTooltip[0] && (clickedIndex !== 0 || $responsiveType !== 'touch')}
					<div
						role="tooltip"
						class="absolute -bottom-6 left-1/2 z-30 transform -translate-x-1/2 px-1 bg-neutral-200 text-gray-700 text-xs shadow-sm"
					>
						Select Items
					</div>
				{/if}
			</div>

			<div
				on:click={() => setMode('select', 1)}
				on:mouseover={() => startHover(1)}
				on:mouseout={endHover}
				on:touchstart={() => startLongPress(1)}
				on:touchend={endLongPress}
				on:keypress={null}
				on:blur={null}
				on:focus={null}
				class={`flex items-center w-8 h-8 justify-center mx-1 rounded-md overflow-hidden ${
					activeIndex === 1
						? 'bg-[#6f6599]'
						: $responsiveType !== 'touch' || isPressed
						? 'hover:text-neutral-700/90 hover:bg-neutral-500'
						: ''
				}`}
			>
				<Cursor
					class="w-5 ml-1  h-5 text-neutral-400 hover:text-neutral-200 active:text-neutral-50"
				/>
				<div class="bottom-0 right-0 mt-4">
					<span class="text-xs text-neutral-500">1</span>
				</div>

				{#if showTooltip[1] && (clickedIndex !== 1 || $responsiveType !== 'touch')}
					<div
						role="tooltip"
						class="absolute -bottom-6 left-1/2 z-30 transform -translate-x-1/2 px-1 bg-neutral-200 text-gray-700 text-xs shadow-sm"
					>
						Select Items
					</div>
				{/if}
			</div>
		</div>

		<div class="flex items-center justify-items-center space-x-3">
			<div
				on:click={() => setMode('drawRectangle', 2)}
				on:keypress={null}
				on:mouseover={() => startHover(2)}
				on:mouseout={endHover}
				on:touchstart={() => startLongPress(2)}
				on:touchend={endLongPress}
				on:blur={null}
				on:focus={null}
				class={`flex items-center w-8 h-8 justify-center mx-1 rounded-md overflow-hidden ${
					activeIndex === 2
						? 'bg-[#6f6599] '
						: $responsiveType !== 'touch' || isPressed
						? 'hover:text-neutral-700/90 hover:bg-neutral-500'
						: ''
				}`}
			>
				<Rectangle
					class="w-5 ml-1 h-5 text-neutral-400 hover:text-neutral-200 active:text-neutral-50 "
				/>
				<div class="bottom-0 right-0 mt-4">
					<span class="text-xs text-neutral-500">2</span>
				</div>

				{#if showTooltip[2]}
					<div
						role="tooltip"
						class="absolute -bottom-6 left-1/2 z-30 transform -translate-x-1/2 px-1 bg-neutral-200 text-gray-700 text-xs shadow-sm"
					>
						Draw Rectangle
					</div>
				{/if}
			</div>

			<!-- Arrow Icon -->
			<div
				on:click={() => setMode('drawArrow', 3)}
				on:keypress={null}
				on:mouseover={() => startHover(3)}
				on:mouseout={endHover}
				on:touchstart={() => startLongPress(3)}
				on:touchend={endLongPress}
				on:blur={null}
				on:focus={null}
				class={`flex items-center w-8 h-8 justify-center mx-1 rounded-md overflow-hidden ${
					activeIndex === 3
						? 'bg-[#6f6599]'
						: $responsiveType !== 'touch' || isPressed
						? 'hover:text-neutral-700/90 hover:bg-neutral-500'
						: ''
				}`}
			>
				<Arrow
					class="w-5 h-5 ml-1 fill:red-400 text-neutral-400 hover:text-neutral-200 active:text-neutral-50"
				/>
				<div class="bottom-0 right-0 mt-4">
					<span class="text-xs text-neutral-500">3</span>
				</div>

				{#if showTooltip[3]}
					<div
						role="tooltip"
						class="absolute -bottom-6 left-1/2 z-30 transform -translate-x-1/2 px-1 bg-neutral-200 text-gray-700 text-xs shadow-sm"
					>
						Draw Arrow
					</div>
				{/if}
			</div>

			<!-- Eraser Icon -->
			<div
				on:click={() => setMode('eraser', 4)}
				on:keypress={null}
				on:mouseover={() => startHover(4)}
				on:mouseout={endHover}
				on:touchstart={() => startLongPress(4)}
				on:touchend={endLongPress}
				on:blur={null}
				on:focus={null}
				class={`flex items-center w-8 h-8 justify-center mx-1 rounded-md overflow-hidden ${
					activeIndex === 4
						? 'bg-[#6f6599]'
						: $responsiveType !== 'touch' || isPressed
						? 'hover:text-neutral-700/90 hover:bg-neutral-500'
						: ''
				}`}
			>
				<Eraser
					class="w-5 h-5 ml-1 text-neutral-400 hover:text-neutral-200 active:text-neutral-50"
				/>
				<div class="bottom-0 right-0 mt-4">
					<span class="text-xs text-neutral-500">4</span>
				</div>
				{#if showTooltip[4]}
					<div
						role="tooltip"
						class="absolute -bottom-6 left-1/2 z-30 transform -translate-x-1/2 px-1 bg-neutral-200 text-gray-700 text-xs shadow-sm"
					>
						Erase Canvas
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<link
	rel="stylesheet"
	href="https://fonts.googleapis.com/css2?family=Oxygen+Mono:wght@400;500;700&display=swap"
/>

<style>
	.font {
		font-family: 'Oxygen Mono', monospace;
	}
</style>
