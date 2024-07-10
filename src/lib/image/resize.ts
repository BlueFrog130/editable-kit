/**
 * Resize an image to fit within the specified dimensions.
 */
export function resizeImage(
	file: File,
	maxWidth: number,
	maxHeight: number,
	quality: number,
	contentType: string
) {
	const reader = new FileReader();
	reader.readAsDataURL(file);
	return new Promise<Blob>((resolve, reject) => {
		reader.onload = (event) => {
			if (!event.target) {
				return reject(new Error('Failed to read file'));
			}
			const img = new Image();
			img.src = event.target.result as string;
			img.onload = () => {
				let width = img.width;
				let height = img.height;
				let newWidth = width;
				let newHeight = height;
				if (width > maxWidth) {
					newWidth = maxWidth;
					newHeight = (height * maxWidth) / width;
				}
				if (newHeight > maxHeight) {
					newHeight = maxHeight;
					newWidth = (width * maxHeight) / height;
				}
				const canvas = document.createElement('canvas');
				canvas.width = newWidth;
				canvas.height = newHeight;
				const ctx = canvas.getContext('2d');
				if (!ctx) {
					return reject(new Error('Failed to create canvas context'));
				}
				ctx.drawImage(img, 0, 0, newWidth, newHeight);
				canvas.toBlob(
					(blob) => {
						if (!blob) {
							return reject(new Error('Failed to create blob'));
						}
						resolve(blob);
					},
					contentType,
					quality
				);
			};
			img.onerror = (error) => {
				reject(error);
			};
		};
		reader.onerror = (error) => {
			reject(error);
		};
	});
}
