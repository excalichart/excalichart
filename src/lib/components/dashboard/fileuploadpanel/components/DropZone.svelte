<script lang="ts">
	import { generateID } from '$lib/io/GenerateID';
	import { fileUploadStore, activeDropZone, activeSidebar } from '$lib/io/Stores';
	import Document from '$lib/components/ui/icons/Document.svelte';
	import { set } from 'idb-keyval';

	let value: string[] = [];
	let isDragging = false;

	function validateFileType(file: File): boolean {
		const allowedExtensions = ['.csv', '.txt', '.parquet', '.json'];
		const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

		if (!allowedExtensions.includes(fileExtension)) {
			alert(`Invalid file type. Please select a CSV, Text, Parquet, or JSON file.`);
			return false;
		}
		return true;
	}

	const insertFileHandle = async (file: File, fileHandle: any) => {
		var tableColumnsSize = {
			filename: file.name,
			size: file.size,
			fileExtension: '',
			externalDataset: null,
			datasetID: generateID()
		};

		fileUploadStore.update((fileUploadStore) => [...fileUploadStore, tableColumnsSize]);
		await set(file.name, fileHandle);
	};

	const selectFile = async () => {
		try {
			// @ts-ignore
			const [fileHandle] = await window.showOpenFilePicker();
			const file = await fileHandle.getFile();
			if (!validateFileType(file)) {
				return;
			}
			value.push(file.name);
			insertFileHandle(file, fileHandle); // Pass both file and fileHandle
			activeDropZone.set(false);
			activeSidebar.set(true);
		} catch (err) {
			console.error('Error accessing file:', err);
		}
	};

	const dropHandle = (event: DragEvent) => {
		value = [];
		event.preventDefault();

		if (event.dataTransfer?.items) {
			[...event.dataTransfer.items].forEach(async (item) => {
				if (item.kind === 'file') {
					//@ts-ignore
					const fileHandle = await item.getAsFileSystemHandle();
					if (fileHandle) {
						const file = await fileHandle.getFile();
						if (file) {
							value.push(file.name);
							insertFileHandle(file, fileHandle);
						}
					}
				}
				activeDropZone.set(false);
				activeSidebar.set(true);
			});
		} else if (event.dataTransfer) {
			[...event.dataTransfer.files].forEach((file) => {
				value.push(file.name);
			});
			activeDropZone.set(false);
			activeSidebar.set(true);
		}
	};

	const showFiles = (files: string[]): string => {
		if (files.length === 1) return files[0];
		let concat = '';
		files.map((file) => {
			concat += file;
			concat += ',';
			concat += ' ';
		});

		if (concat.length > 40) concat = concat.slice(0, 40) + '...';
		return concat;
	};

	const dragLeave = (event: DragEvent) => {
		event.preventDefault();
		const dropzone = document.getElementById('dropzone');
		if (dropzone) {
			dropzone.classList.remove('hover:bg-neutral-600');
		}
		isDragging = false;
	};

	const dragOver = (event: DragEvent) => {
		isDragging = true;

		event.preventDefault();
		const dropzone = document.getElementById('dropzone');
		if (dropzone) {
			dropzone.classList.add('hover:bg-neutral-600');
		}
	};
</script>

<div class="mb-2">
	<span class="text-black textSize font-light">
		Upload <span class="font-medium text-gray-neutral-800 textSize">CSV</span>,
		<span class="font-medium text-gray-neutral-800 textSize">Text</span>, or
		<span class="font-medium text-gray-neutral-800 textSize">Parquet</span>
		Files
	</span>
</div>
<div
	class=" {isDragging
		? 'bg-slate-50'
		: ''} flex flex-col justify-center items-center h-96 rounded-sm border-gray-300 cursor-pointer hover:bg-slate-50 custom-dashed"
	id="dropzone"
	on:drop={dropHandle}
	on:dragover={dragOver}
	on:dragleave={dragLeave}
	on:click={selectFile}
	on:keypress={(event) => {
		if (event.key === 'Enter') {
			selectFile();
		}
	}}
>
	<div class="flex flex-row space-x-4 items-center mr-2 mb-6">
		<Document filetype="CSV" />
		<Document filetype="text" />
		<Document filetype="parquet" />
	</div>

	<svg
		aria-hidden="true"
		class="mb-3 w-10 h-10 text-gray-400"
		fill="none"
		stroke="currentColor"
		viewBox="0 0 24 24"
		xmlns="http://www.w3.org/2000/svg"
		><path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
		/></svg
	>

	{#if value.length === 0}
		<p class="mb-2 text-lg text-gray-500 dark:text-gray-400">
			<span class="font-semibold">DRAG & Drop</span> or click to upload
		</p>
	{:else}
		<p>{showFiles(value)}</p>
	{/if}

	<div class="mt-20 flex justify-center">
		<span class="text-gray-400 text-sm px-10">
			*sourcechart.io is a client-side application without a backend. Data lives only on your
			machine/browser. Data you upload is not sent to any server.
		</span>
	</div>
</div>

<style>
	.textSize {
		font-size: 0.95rem;
	}
	.custom-dashed {
		border-width: 1px;
		border-style: dashed;
		border-image-source: linear-gradient(to bottom, gray 50%, transparent 50%),
			linear-gradient(to right, gray 50%, transparent 50%);
		border-image-slice: 1;
		border-image-repeat: round;
	}
</style>
