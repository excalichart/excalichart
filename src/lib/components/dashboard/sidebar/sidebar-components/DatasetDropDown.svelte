<script lang="ts">
	import {
		chosenFile,
		getFileFromStore,
		fileDropdown,
		allCharts,
		clickedChartIndex,
		duckDBInstanceStore,
		fileUploadStore,
		mostRecentChartID,
		polygons
	} from '$lib/io/Stores';
	import { removeFromIndexedDB } from '$lib/io/IDBUtils';
	import { DuckDBClient } from '$lib/io/DuckDBClient';
	import { checkNameForSpacesAndHyphens } from '$lib/io/FileUtils';
	import { onMount } from 'svelte';
	import { values } from 'idb-keyval';
	import FileUploadButton from '../sidebar-components/FileUploadButton.svelte';
	import CloseSolid from '$lib/components/ui/icons/CloseSolid.svelte';
	import CarrotDown from '$lib/components/ui/icons/CarrotDown.svelte';
	import { addChartMetaData } from '$lib/io/ChartMetaDataManagement';

	let isDropdownOpen = false;
	let selectedDataset: string | null = '';
	let dropdownContainer: HTMLElement;

	$: file = getFileFromStore();
	$: i = clickedChartIndex();
	$: datasets = fileDropdown();

	$: if ($allCharts[$i]?.filename) {
		if (isURL($allCharts[$i].filename)) {
			selectedDataset = extractFilenameFromURLOrString($allCharts[$i].filename);
		} else {
			selectedDataset = $allCharts[$i].filename;
		}
	} else {
		selectedDataset = 'Select Dataset';
	}

	function isURL(input: string | null): boolean {
		if (!input) {
			return false; // Default to false if input is null or empty.
		}
		// More comprehensive regex pattern for URL detection.
		// Covers http, https, ftp, file protocols, IP addresses, localhost, and more.
		const urlPattern = /^(https?|ftp|file):\/\/|^(localhost|(\d{1,3}\.){3}\d{1,3})(:\d+)?(\/\S*)?$/;

		const filenamePattern = /^[^\/\\]*\.([a-z0-9]+)$/i;

		return urlPattern.test(input) || !filenamePattern.test(input);
	}

	onMount(() => {
		$fileUploadStore.forEach(async (file) => {
			if (file.externalDataset?.url) await queryDuckDB(file.filename, true);
		});
	});

	function extractFilenameFromURLOrString(input: string | null): string {
		if (input) {
			const path = new URL(input).pathname;
			const parts = path.split('/');
			return parts[parts.length - 1];
		} else {
			return 'Select Dataset';
		}
	}

	const handleOutsideClick = (event: MouseEvent) => {
		if (dropdownContainer && !dropdownContainer.contains(event.target as Node)) {
			isDropdownOpen = false;
		}
	};

	const getFileHandleFromIDB = async (filename: string) => {
		try {
			const storedFileHandles = await values();
			const fileHandle = storedFileHandles.find((file) => file.name === filename);

			if (!fileHandle) {
				throw new Error(`No fileHandle found for filename: ${filename}`);
			}
			let permission = await fileHandle.queryPermission();

			if (permission !== 'granted') {
				permission = await fileHandle.requestPermission();
				if (permission !== 'granted') {
					return;
				}
			}
			return fileHandle;
		} catch (error) {
			console.error('Error fetching fileHandle from IDB:', error);
			throw error; // You can either re-throw the error or handle it based on your application's requirements
		}
	};

	const queryDuckDB = async (filename: string, mount?: boolean) => {
		if ($mostRecentChartID) addChartMetaData($mostRecentChartID);
		let resp;
		let fname = filename;

		chosenFile.set(filename);
		const dataset = $fileUploadStore.find((file) => file.filename === filename);

		if (!dataset) return;
		let db: DuckDBClient;

		if (dataset?.externalDataset?.url) {
			db = await DuckDBClient.of([]);
			resp = await db.query(`SELECT * FROM '${dataset?.externalDataset?.url}' LIMIT 0`);
			fname = `${dataset?.externalDataset?.url}`;
			selectedDataset = dataset.filename;
		} else if (dataset.filename) {
			const fileHandle = await getFileHandleFromIDB(dataset.filename);
			const file = await fileHandle.getFile();
			db = await DuckDBClient.of([file]);
			const sanitizedFilename = checkNameForSpacesAndHyphens(file.name);
			selectedDataset = dataset.filename;
			resp = await db.query(`SELECT * FROM ${sanitizedFilename} LIMIT 0`); //@ts-ignore
		} else {
			return;
		}
		//@ts-ignore
		var schema = resp.schema; //@ts-ignore
		var columns = schema.map((item) => item['name']);

		duckDBInstanceStore.set(db);
		allCharts.update((charts) => {
			let chart = charts[$i];
			if ($file?.datasetID) charts[$i].datasetID = $file.datasetID; //This is a hack so it doesn't load on the mount
			if (!mount) charts[$i].filename = fname;
			chart.schema = schema;
			chart.columns = columns;
			return charts;
		});
	};

	const removeFromAllCharts = (filename: string) => {
		allCharts.update((charts) => {
			return charts.filter((chart) => chart.filename !== filename);
		});

		fileUploadStore.update((file) => {
			return file.filter((file) => file.filename !== filename);
		});

		removeFromIndexedDB('keyval-store', 'keyval', filename)
			.then(() => {
				console.log('Item removed!');
			})
			.catch((error) => {
				console.error('Error:', error);
			});

		selectedDataset = 'Select Dataset';
	};

	const toggleDropdown = () => {
		isDropdownOpen = !isDropdownOpen;
	};

	let tooltipText = '';

	$: if (!$mostRecentChartID) {
		tooltipText = 'Please create a chart first.';
	} else if ($polygons.length === 0) {
		tooltipText = 'No polygons detected. Please add some rectangles to proceed.';
	}
</script>

<div class="py-1 flex w-full space-x-1 items-center justify-between">
	<span class="text-sm font-light text-neutral-300">Datasets</span>

	<div class="relative flex justify-between">
		<button
			bind:this={dropdownContainer}
			class="bg-neutral-900 justify-between text-center rounded-sm hover:bg-neutral-900/50 flex items-center border-neutral-700/50 w-44 px-1"
			on:click={toggleDropdown}
			disabled={!$mostRecentChartID || $polygons.length === 0}
		>
			<span
				class="text-sm text-gray-100 justify-start flex hover:text-neutral-200 font-thin ml-1 truncate"
			>
				{selectedDataset || 'Select Dataset'}
			</span>
			<CarrotDown class=" hover:text-neutral-400 " />
		</button>
		<div
			class="absolute left-0 mt-1 w-44 text-xs bg-neutral-800 text-neutral-200 p-2 rounded-md shadow-lg tooltip"
			style="visibility: hidden;"
		>
			{tooltipText}
		</div>

		{#if isDropdownOpen}
			<div
				class="scrollBarDiv absolute top-full left-0 rounded-sm bg-neutral-900 w-40 mr-3 shadow-lg transform transition-transform origin-top overflow-y-auto overflow-x-hidden z-10"
			>
				{#each $datasets as dataset}
					{#if dataset !== null}
						<div
							class="flex justify-between w-full items-center text-gray-300 relative selectFieldColor hover:bg-neutral-700"
						>
							<button
								class="flex-grow text-left text-sm px-3 py-2 cursor-pointer truncate"
								on:click={async () => {
									queryDuckDB(dataset);
									isDropdownOpen = false;
								}}
								on:keypress={async (e) => e.key === 'Enter' && queryDuckDB(dataset)}
							>
								{dataset}
							</button>
							<button
								class="ml-2 p-2"
								on:click={(e) => {
									removeFromAllCharts(dataset);
									e.stopPropagation();
								}}
							>
								<CloseSolid class="w-4 h-4 hover:text-gray-300 text-white" />
							</button>
						</div>
					{/if}
				{/each}
			</div>
		{/if}
	</div>

	<FileUploadButton />
</div>

<style>
	/* For WebKit (Chrome, Safari) */
	.scrollBarDiv::-webkit-scrollbar {
		width: 8px;
	}

	.scrollBarDiv::-webkit-scrollbar-thumb {
		background-color: rgba(255, 255, 255, 0.3);
		border-radius: 4px;
	}

	.scrollBarDiv::-webkit-scrollbar-thumb:hover {
		background-color: rgba(168, 168, 168, 0.5);
	}

	/* For Firefox */
	.scrollBarDiv {
		scrollbar-width: thin;
		scrollbar-color: rgba(40, 40, 40, 0.3) rgba(0, 0, 0, 0.1);
		max-height: 200px; /* Adjust this value to your desired maximum height */
		overflow-y: auto;
	}
	button[disabled] {
		cursor: not-allowed; /* Changes the cursor on hover to indicate it's not clickable */
		opacity: 0.5; /* Reduces the button's opacity to indicate it's disabled */
	}

	button[disabled]:hover + .tooltip {
		visibility: visible;
	}

	button[disabled] {
		cursor: not-allowed;
		opacity: 0.5;
	}

	.tooltip {
		transform: translateY(100%);
		z-index: 10;
	}
</style>
