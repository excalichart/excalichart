let syncWorker: Worker | undefined = undefined;

export const loadWorker = async () => {
	const SyncWorker = await import('$lib/io/web.worker?worker');
	syncWorker = new SyncWorker.default();
};
