<script>
	import Cursor from '$lib/components/ui/icons/Cursor.svelte';
	import Eraser from '$lib/components/ui/icons/Eraser.svelte';
	import Rectangle from '$lib/components/ui/icons/Rectangle.svelte';
	import Arrow from '$lib/components/ui/icons/Arrow.svelte';
	import PlusSolid from '$lib/components/ui/icons/PlusSolid.svelte';
	import Group from '$lib/components/ui/icons/Group.svelte';
	import FilterIcon from '$lib/components/ui/icons/FilterIcon.svelte';
	import ArrowDown from '$lib/components/ui/icons/ArrowDown.svelte';
	import Info from '$lib/components/ui/icons/Info.svelte';

	let editorItems = [
		{ title: 'Move Chart', component: Cursor, value: 1 },
		{ title: 'Delete Chart', component: Eraser, value: 2 },
		{ title: 'Create Chart', component: Rectangle, value: 3 },
		{ title: 'Draw Arrow', component: Arrow, value: 4 }
	];

	let queryItems = [
		{ title: 'Add Dataset', component: PlusSolid, value: 1 },
		{
			title: 'Group the same items together, and then aggregate results',
			component: Group,
			value: 2
		},
		{ title: 'Filter items you want', component: FilterIcon, value: 3 },
		{ title: 'The Chart Style you want', component: Info, value: 4 },
		{ title: 'Download results as CSV', component: ArrowDown, value: 5 }
	];
</script>

<div class="p-4 flex justify-between space-x-4">
	<div class="w-2/5">
		<h2 class="text-lg text-neutral-950 font-semibold mb-2">Editor Cheat Sheet</h2>
		<table class="w-full bg-white shadow-md rounded-lg">
			<tbody>
				{#each editorItems as item}
					<tr class="border border-gray-300">
						<td class="py-1 px-2 font-normal text-sm text-black w-full">{item.title}</td>
						<td class="py-1 px-2">
							<div>
								<svelte:component this={item.component} />
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<div class="w-1/2">
		<h2 class="text-lg text-neutral-950 font-semibold mb-2">Query Cheat Sheet</h2>
		<table class="w-full bg-white shadow-md rounded-md">
			<tbody>
				{#each queryItems as item}
					<tr class="border border-gray-300">
						<td class="py-1 px-2 font-normal text-black text-sm w-full">{item.title}</td>
						<td class="py-1 px-2 w-8">
							<svelte:component
								this={item.component}
								class="h-6 w-6 text-white rounded bg-[#8884c0]"
							/>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
