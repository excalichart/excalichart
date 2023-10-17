<script lang="ts">
	import { generateID } from '$lib/io/GenerateID';
	import { datasets } from './Datasets';
	import { fileUploadStore, activeDropZone } from '$lib/io/Stores';
	import Download from '$lib/components/ui/icons/Download.svelte';

	const addURLToDatabase = (dataset: ExternalDataset) => {
		var tableColumnsSize = {
			filename: dataset.name,
			externalDataset: dataset,
			datasetID: generateID(),
			size: null,
			fileExtension: ''
		};

		fileUploadStore.update((fileUploadStore) => [...fileUploadStore, tableColumnsSize]);
		activeDropZone.set(false);
	};

	function downloadRawCSV(csvData: string, filename: string) {
		const blob = new Blob([csvData], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');

		a.setAttribute('hidden', '');
		a.setAttribute('href', url);
		a.setAttribute('download', filename);

		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}

	const downloadRawDataset = async (dataset: ExternalDataset) => {
		try {
			const response = await fetch(dataset.url);
			const data = await response.text(); // Assuming the data is in JSON format\
			downloadRawCSV(data, dataset.url.split('/').pop() + '');
		} catch (error) {
			console.error('Error downloading dataset:', error);
		}
	};
</script>

<div class="overflow-y-auto scrollBarDiv">
	<table class="w-full bg-white text-neutral-950 divide-y divide-neutral-300">
		<thead>
			<tr>
				<th
					class="py-2 px-2 sm:px-4 text-sm border-b border-neutral-300 text-left flex justify-center text-neutral-950"
					>Dataset Name</th
				>
				<th
					class="hidden md:table-cell py-2 px-2 sm:px-4 text-sm border-b border-neutral-300 justify-center text-neutral-950"
					>Description</th
				>
				<th
					class="py-2 px-2 sm:px-4 text-sm flex justify-center border-b border-neutral-300 text-neutral-950"
					>Actions</th
				>
				<th class="py-2 px-2 sm:px-4 text-sm border-b border-neutral-300 text-neutral-950"
					>Download</th
				>
			</tr>
		</thead>
		<tbody>
			{#each datasets as dataset, index}
				<tr
					class={index % 2 === 0 ? 'bg-neutral-100 hover:bg-neutral-200' : 'hover:bg-neutral-200'}
				>
					<td class="py-2 px-2 sm:px-4 text-xs">{dataset.name}</td>
					<td class="hidden md:table-cell py-2 px-2 sm:px-4 text-xs">{dataset.description}</td>
					<td class="p-1 sm:px-4">
						<button
							class="bg-[#8884c0] hover:bg-[#807cb7] active:bg-[#7976ab] text-sm text-white p-2 rounded"
							on:click={() => addURLToDatabase(dataset)}
						>
							Add Dataset
						</button>
					</td>
					<td class="p-1 sm:px-4 flex items-center justify-center">
						<button
							class="bg-[#8884c0] hover:bg-[#807cb7] active:bg-[#7976ab] text-white p-2 text-sm transition duration-200 ease-in-out shadow-md rounded-full flex items-center justify-center"
							on:click={async () => downloadRawDataset(dataset)}
						>
							<Download class="h-6 w-6 " />
						</button>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.scrollBarDiv {
		max-height: 24rem; /* Adjust to fit your design */

		/* Overflow properties */
		overflow-y: auto;
		overflow-x: auto;
	}
</style>
