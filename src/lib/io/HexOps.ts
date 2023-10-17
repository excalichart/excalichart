const bufferToHex = (buffer: ArrayBufferLike) => {
	// buffer is an ArrayBuffer
	return [...new Uint8Array(buffer)].map((x) => x.toString(16).padStart(2, '0')).join('');
};

const hexToBuffer = (hex: string) => {
	// buffer is an ArrayBuffer
	return new Uint8Array(hex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))).buffer;
};

export { bufferToHex, hexToBuffer };
