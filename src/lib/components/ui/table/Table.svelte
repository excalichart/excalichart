<script>
	export let rows = [];
	export let columns = [];
</script>

<div class="scrollable-table">
	<table>
		<thead>
			<tr>
				{#each columns as column (column)}
					<th>{column.label}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each rows as row (row)}
				<tr>
					{#each columns as column (column)}
						<td>{row[column.field]}</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	/* Styles for the table */
	table {
		width: 100vw;
		background-color: white;
		border-collapse: collapse;
	}

	/* Styles for headers */
	th {
		padding: 0.5rem 1rem;
		text-align: left;
		background-color: white;
		color: #4a4a4a;
		border-left: 1px solid #e0e0e0;
		border-top: 1px solid #e0e0e0;
		border-bottom: 1px solid #e0e0e0;
	}

	/* Remove border for the last header cell */
	th:last-child {
		border-right: 1px solid #e0e0e0;
	}

	/* Styles for table cells */
	td {
		padding: 0.5rem 1rem;
		border-left: 1px solid #e0e0e0;
	}

	/* Remove border for the last table cell in each row */
	tr td:last-child {
		border-right: 1px solid #e0e0e0;
	}

	/* Scrollable container */
	.scrollable-table {
		max-width: 100%;
		max-height: 300px; /* You can adjust this value as needed */
		overflow: auto;
	}
</style>
