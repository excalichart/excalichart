/*
import sqlite3InitModule from 'sqlite-wasm-esm';

type DataMessage = {
	message: string;
	filename: string;
	file?: FileUpload;
	size?: number;
	id?: string;
	hexadecimal?: string;
	fileextension?: string;
};
let tableName = 'datastash';
let dbFileName = 'LocalDB';

onmessage = async (e: MessageEvent) => {
	const messageData: DataMessage = e.data;

	switch (messageData.message) {
		case 'initialize':
			insertDataIntoDatabase(messageData);
			break;
		case 'query':
			getBinaryFromDatabase(messageData);
			break;
		case 'delete':
			deleteDataFromDatabase(messageData);
			break;
		default:
			postMessage({ error: 'Invalid command' });
	}
};

const getBinaryFromDatabase = (data: DataMessage) => {
	sqlite3InitModule().then(async (sqlite3) => {
		//@ts-ignore
		const db = new sqlite3.opfs.OpfsDb(dbFileName, 'c');
		const res = db.exec(`SELECT * FROM ${tableName} WHERE filename= '${data.filename}'`, {
			returnValue: 'resultRows'
		});

		var hexEncoding = res[0][1];
		postMessage({
			message: 'finished',
			filename: data.filename,
			hexadecimal: hexEncoding,
			size: data.size,
			fileextension: data.filename.split('.').pop()
		});
		db.close();
	});
};

const deleteDataFromDatabase = (data: DataMessage) => {
	sqlite3InitModule().then(async (sqlite3) => {
		//@ts-ignore
		const db = new sqlite3.opfs.OpfsDb(dbFileName, 'c');
		const res = db.exec(`DELETE FROM ${tableName} WHERE filename= '${data.filename}'`);

		if (res) {
			postMessage({ message: 'delete_success', filename: data.filename });
		} else {
			postMessage({ error: `Failed to delete ${data.filename}` });
		}

		db.close();
	});
};

const insertDataIntoDatabase = (data: DataMessage) => {
	sqlite3InitModule().then(async (sqlite3) => {
		//@ts-ignore
		const db = new sqlite3.opfs.OpfsDb(dbFileName, 'c');
		db.exec(
			`
			CREATE TABLE IF NOT EXISTS ${tableName} (
				filename TEXT,
				data TEXT,
				size INTEGER,
				filetype VARCHAR(10),
				UNIQUE(filename, data, size, filetype)
			);

			INSERT OR IGNORE INTO ${tableName} (filename, data, size, filetype) VALUES ('${data.filename}', '${data.hexadecimal}', ${data.size}, '${data.fileextension}');
			`
		);
		db.close();
	});
};
*/
