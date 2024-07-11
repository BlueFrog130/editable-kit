export * from './crop.js';
export * from './resize.js';

/**
 * Get image dimensions from a file
 */
export async function getDimensions(file: File) {
	console.log('getDimensions');
	return new Promise<{ width: number; height: number }>((resolve, reject) => {
		const img = new window.Image();
		img.onload = () => {
			resolve({ width: img.width, height: img.height });
		};
		img.onerror = (e) => {
			reject(e);
		};
		img.src = URL.createObjectURL(file);
	});
}
