<script lang="ts">
	export let filetype: string;
</script>

<div class="mb-3 relative w-10 h-10">
	<div class="absolute inset-0 flex justify-start items-center z-10">
		<span class="text-xs text-white bg-gray-400 px-1 mt-5"> {filetype} </span>
	</div>
	<svg class="w-12 h-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
		<g fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="0.1">
			<path
				fill="currentColor"
				d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"
			/>
		</g>
	</svg>
</div>
