<script lang="ts">
	import CloseSolid from '$lib/components/ui/icons/CloseSolid.svelte';
	import DropZone from './components/DropZone.svelte';
	import ExternalDatasets from './components/ExternalDatasets.svelte';
	import { activeDropZone, activeSidebar, tabValue } from '$lib/io/Stores';
	import CheatSheet from './components/CheatSheet.svelte';
	import ChevronRight from '$lib/components/ui/icons/ChevronRight.svelte';

	const handleClick = () => {
		tabValue.set(1);
		activeDropZone.set(false);
		activeSidebar.set(true);
	};

	let items: {
		title: string;
		value: number;
		component: any; // Specify a more precise type if possible
	}[] = [
		{
			title: 'Load Files',
			component: DropZone,
			value: 1
		},

		{
			title: 'Cheat Sheet',
			component: CheatSheet,
			value: 2
		}
	];

	const exampleDataset = {
		title: 'Use Sample Datasets',
		component: ExternalDatasets,
		value: 3
	};

	export let activeTabValue: number = 1;
	const handleTabClick = (tabValue: number) => () => (activeTabValue = tabValue);
	const handleKeyPress = (e: KeyboardEvent, tabValue: number) => {
		if (e.key === 'Enter') handleTabClick(tabValue)();
	};
</script>

<div
	class="relative bg-white overflow-auto scrollBarDiv p-4 sm:p-10 w-full h-3/5 shadow-xl ring-1 ring-gray-900/5 sm:mx-auto sm:max-w-xl rounded sm:rounded-lg"
>
	<div class="mx-auto max-w-full">
		<h1 class="text-2xl text-gray-800 font-normal">Add Data to Canvas</h1>
		<button class="absolute top-3 right-3" on:click={handleClick}>
			<CloseSolid class="text-black h-6 w-6" />
		</button>
		<div class="mt-4 w-full">
			<div class="divide-y">
				<div>
					<ul class="flex justify-between list-none space-x-8">
						<!-- Wrap the first two tabs in a flex container -->
						<div class="flex space-x-8">
							{#each items as item}
								<li>
									<div
										on:click={handleTabClick(item.value)}
										on:keypress={(e) => handleKeyPress(e, item.value)}
										class={`py-2 cursor-pointer rounded-sm ${
											activeTabValue === item.value ? 'border-b-2 border-neutral-800' : ''
										}`}
										role="tab"
										tabindex="0"
									>
										<span
											class={`${
												activeTabValue === item.value
													? 'text-neutral-800 hover:text-neutral-900 textSize'
													: 'text-neutral-400 hover:text-neutral-500 textSize'
											}`}
										>
											{item.title}
										</span>
									</div>
								</li>
							{/each}
						</div>

						<!-- "Sample Datasets" tab with ml-auto -->
						<li class="ml-auto flex space-x-3">
							<img src="area-stack-gradient.png" class="h-14" alt="Eye Catcher for sample data " />

							<div
								on:click={handleTabClick(exampleDataset.value)}
								on:keypress={(e) => handleKeyPress(e, exampleDataset.value)}
								class={`py-2 cursor-pointer rounded-sm  ${
									activeTabValue === exampleDataset.value ? 'border-b-2 border-neutral-800' : ''
								}`}
								role="tab"
								tabindex="0"
							>
								<span
									class={`${
										activeTabValue === exampleDataset.value
											? 'text-neutral-800 hover:text-neutral-900 textSize'
											: 'text-neutral-400 hover:text-neutral-500 textSize'
									}`}
								>
									<span class="text-xs"> No Data? </span>

									<div class="flex justify-start items-center space-x-2">
										{exampleDataset.title}
										<ChevronRight class="mt-1 ml-1 hover:text-neutral-500" />
									</div>
								</span>
							</div>
						</li>
					</ul>
				</div>
				<div>
					{#each items as item}
						{#if activeTabValue == item.value}
							<div class="mb-2.5 py-6 rounded-b-md">
								<svelte:component this={item.component} />
							</div>
						{/if}
					{/each}
					<!-- External Datasets content -->
					{#if activeTabValue == exampleDataset.value}
						<div class="mb-2.5 py-6 rounded-b-md">
							<svelte:component this={exampleDataset.component} />
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.scrollBarDiv {
		/* Remove the fixed height */
		max-height: 36rem; /* Or adjust this to a value that fits your design better */

		/* Overflow properties */
		overflow-y: auto;
		overflow-x: auto;

		/* Scrollbar styles for Webkit browsers */
		scrollbar-width: thin;
		scrollbar-color: rgba(40, 40, 40, 0.3) rgba(0, 0, 0, 0.1);
	}

	.textSize {
		font-size: 0.95rem;
	}
	.tab-active {
		background-color: #ffffff; /* bg-white */
		color: #4b5563; /* text-gray-700 */
		border-color: #e5e7eb; /* border-gray-300 */
		border-bottom: 0;
	}
</style>
