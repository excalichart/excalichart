<script lang="ts">
	import NavBar from '$lib/components/dashboard/navbar/NavBar.svelte';
	import Canvas from '$lib/components/dashboard/canvas/Canvas.svelte';
	import Sidebar from '$lib/components/dashboard/sidebar/Sidebar.svelte';
	import FileUploadPanel from '$lib/components/dashboard/fileuploadpanel/FileUploadPanel.svelte';

	import Safety from '$lib/components/dashboard/buttons/Safety.svelte';
	import Help from '$lib/components/dashboard/buttons/Help.svelte';
	import ZoomButton from '$lib/components/dashboard/buttons/ZoomButton.svelte';
	import ToggleSidebar from '$lib/components/dashboard/sidebar/ToggleSidebar.svelte';

	import { onMount } from 'svelte';
	import { activeDropZone, keyPress, tabValue, screenSize } from '$lib/io/Stores';

	let width: number = 0;

	onMount(() => {
		width = window.innerWidth;
		handleResize();
		window.addEventListener('resize', handleResize);
		document.addEventListener('keydown', handleKeyPress);

		return () => {
			document.removeEventListener('keydown', handleKeyPress);
			window.removeEventListener('resize', handleResize);
		};
	});

	function handleKeyPress(event: KeyboardEvent): void {
		if (event.key === 'Escape') {
			activeDropZone.set(false);
		} else if (['0', '1', '2', '3'].includes(event.key)) {
			keyPress.set(event.key);
		}
	}

	const handleResize = (): void => {
		var sc: 'small' | 'large' = width <= 768 ? 'small' : 'large';
		screenSize.set(sc);
	};
</script>

<div class="w-screen h-screen overflow-hidden bg-neutral-900 }">
	<div class="flex justify-center items-center fixed top-4 left-1/2 -translate-x-1/2 z-10">
		<NavBar />
	</div>

	<div class="absolute z-10 ml-6 mt-6">
		<Sidebar />
		<ToggleSidebar />
	</div>

	<div class="relative z-0 w-screen h-screen">
		<Canvas />
	</div>

	{#if $activeDropZone}
		<div class="z-20 fixed inset-0 bg-black/60" />

		<div class="z-30 fixed inset-0 flex justify-center items-center w-screen h-screen">
			<FileUploadPanel activeTabValue={$tabValue} />
		</div>
	{/if}

	<footer>
		<div class="fixed bottom-4 left-6">
			<ZoomButton />
		</div>

		<div class="fixed bottom-4 right-20">
			<Safety />
		</div>

		<div class="fixed bottom-4 right-4">
			<Help />
		</div>
	</footer>
</div>
<svelte:window
	on:resize={() => {
		if (typeof window !== undefined) {
			width = window.innerWidth;
		}
	}}
/>
<svelte:head>
	<meta
		name="viewport"
		content="width=device-width, initial-scale=1.00, maximum-scale=1.00, minimum-scale=1.00"
	/>
</svelte:head>
