export function removeFromIndexedDB(dbName: string, storeName: string, key: IDBValidKey) {
	return new Promise<void>((resolve, reject) => {
		const openRequest = indexedDB.open(dbName);

		openRequest.onerror = function () {
			reject('Error opening db');
		};

		openRequest.onsuccess = function () {
			const db = openRequest.result;
			const transaction = db.transaction(storeName, 'readwrite');
			const store = transaction.objectStore(storeName);

			const request = store.delete(key);

			request.onsuccess = function () {
				resolve();
			};

			request.onerror = function () {
				reject('Error deleting item from db');
			};

			// Close the database after finishing
			transaction.oncomplete = function () {
				db.close();
			};
		};
	});
}
