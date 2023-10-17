export function downloadTSV(data: any[], filename: string) {
	const csv = dataToTSV(data);
	const blob = new Blob([csv], { type: 'text/csv' });
	const url = window.URL.createObjectURL(blob);
	const a = document.createElement('a');

	a.setAttribute('hidden', '');
	a.setAttribute('href', url);
	a.setAttribute('download', filename);

	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
}

export function dataToTSV(data: any[]): string {
	const header = Object.keys(data[0]).join('\t');
	const rows = data.map((row) => {
		return Object.values(row)
			.map((val) => {
				if (
					typeof val === 'string' &&
					(val.includes(',') || val.includes('\n') || val.includes('"'))
				) {
					val = '"' + val.replace(/"/g, '""') + '"';
				}
				return val;
			})
			.join('\t');
	});

	return header + '\n' + rows.join('\n');
}
