<script lang="ts">
	import { getColumnsFromFile, workflowIDColumn } from '$lib/io/Stores';

	$: columns = getColumnsFromFile();
	let isDropdownOpen: boolean = false;

	let idColumn: string | null = 'ID Column';

	const chooseIDColumn = (column: string | null) => {
		idColumn = column;
		workflowIDColumn.set(column);
	};

	const toggleDropdown = () => {
		isDropdownOpen = !isDropdownOpen;
	};
</script>

<div class="relative group" on:click={toggleDropdown} on:keypress={null}>
	<button class="bg-gray-200 px-3 py-2 rounded text-black hover:bg-gray-300">
		{idColumn}
	</button>
	<div
		class={`scrollBarDiv
			absolute w-full mt-2 bg-white border
			border-gray-200 rounded shadow-lg
    		transform transition-transform origin-top h-48 overflow-y-auto overflow-x-hidden
    		${isDropdownOpen ? 'translate-y-0 opacity-100' : 'translate-y-1/2 opacity-0'}`}
	>
		{#each $columns as column (column)}
			<button
				class="block w-full text-left px-3 py-2 dark:text-black hover:bg-gray-200"
				on:click={() => {
					chooseIDColumn(column);
				}}
			>
				{column}
			</button>
		{/each}
	</div>
</div>
