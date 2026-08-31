export function blobToDataURL(blob: Blob): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = () => reject(reader.error);
		reader.readAsDataURL(blob);
	});
}

/** Static demo has no object store, so images live inline as data URLs. */
export function uploadAsDataURL(file: File): Promise<string> {
	return blobToDataURL(file);
}
