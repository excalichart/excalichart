<script lang="ts">
	type TabItem = {
		title: string;
		value: number;
		component: any; // Specify a more precise type if possible
	};

	export let items: TabItem[] = [];
	export let activeTabValue: number = 1;

	const handleClick = (tabValue: number) => () => (activeTabValue = tabValue);
	const handleKeyPress = (e: KeyboardEvent, tabValue: number) => {
		if (e.key === 'Enter') handleClick(tabValue)();
	};
</script>

<div class="divide-y">
	<div>
		<ul class="flex flex-wrap list-none space-x-8">
			{#each items as item}
				<li>
					<div
						on:click={handleClick(item.value)}
						on:keypress={(e) => handleKeyPress(e, item.value)}
						class={`py-2 cursor-pointer  rounded-sm  ${
							activeTabValue === item.value ? 'border-b-2 border-neutral-800' : ''
						}`}
						role="tab"
						tabindex="0"
					>
						<span
							class={` ${
								activeTabValue === item.value
									? 'text-neutral-800 hover:text-neutral-900 textsize'
									: 'text-neutral-400 hover:text-neutral-600 textsize'
							}`}
						>
							{item.title}
						</span>
					</div>
				</li>
			{/each}
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
	</div>
</div>

<style>
	.textsize {
		font-size: 0.95rem;
	}
	.tab-active {
		background-color: #ffffff; /* bg-white */
		color: #4b5563; /* text-gray-700 */
		border-color: #e5e7eb; /* border-gray-300 */
		border-bottom: 0;
	}
</style>
