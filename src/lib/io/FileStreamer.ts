export type bytes = number;

export class FileStreamer {
	private offset: number = 0;
	private readonly defaultChunkSize = 1000 * 1024 * 100; // 100 Kilabyte bytes

	constructor(private blob: Blob) {
		this.rewind();
	}

	public rewind(bytesLength: bytes = this.offset): void {
		this.offset -= bytesLength;
	}

	public isEndOfBlob(): boolean {
		return this.offset >= this.getBlobSize();
	}

	public readBlockAsArrayBuffer(length: bytes = this.defaultChunkSize): Promise<ArrayBuffer> {
		const fileReader: FileReader = new FileReader();
		const blob: Blob = this.blob.slice(this.offset, this.offset + length);

		return new Promise<ArrayBuffer>((resolve, reject) => {
			fileReader.onload = (event: Event) => {
				const data = this.getArrayBufferFromEvent(event);
				this.shiftOffset(blob.size);
				resolve(data);
			};

			//@ts-ignore
			fileReader.onerror = (event: ErrorEvent) => {
				reject(event.error);
			};

			fileReader.readAsArrayBuffer(blob);
		});
	}

	protected shiftOffset(bytesRead: bytes): void {
		this.offset += bytesRead;
	}

	protected getArrayBufferFromEvent(event: Event): ArrayBuffer {
		const target: FileReader = event.target as FileReader; //@ts-ignore
		const result: Uint8Array = new Uint8Array(target.result);
		return result;
	}

	private getTextFromEvent(event: Event): string {
		const target: FileReader = event.target as FileReader; //@ts-ignore\
		return target.result;
	}

	private testEndOfFile(): void {
		if (this.isEndOfBlob()) {
			console.log('Done reading blob');
		}
	}

	private getBlobSize(): number {
		return this.blob.size;
	}
}
