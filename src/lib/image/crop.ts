import type { Size, ImageSize, Point, CropArea } from './types.js';

/**
 * Compute the dimension of the crop area based on image size and aspect ratio
 * @param imgWidth width of the src image in pixels
 * @param imgHeight height of the src image in pixels
 * @param aspect aspect ratio of the crop
 */
export function getCropSize(imgWidth: number, imgHeight: number, aspect: number) {
	if (imgWidth >= imgHeight * aspect) {
		return {
			width: imgHeight * aspect,
			height: imgHeight
		};
	}
	return {
		width: imgWidth,
		height: imgWidth / aspect
	};
}

/**
 * Ensure a new image position stays in the crop area.
 * @param position new x/y position requested for the image
 * @param imageSize width/height of the src image
 * @param cropSize width/height of the crop area
 * @param  zoom zoom value
 * @returns
 */
export function restrictPosition(
	position: Readonly<Point>,
	imageSize: Readonly<Size>,
	cropSize: Readonly<Size>,
	zoom: Readonly<number>
): Point {
	return {
		x: restrictPositionCoord(position.x, imageSize.width, cropSize.width, zoom),
		y: restrictPositionCoord(position.y, imageSize.height, cropSize.height, zoom)
	};
}

function restrictPositionCoord(
	position: Readonly<number>,
	imageSize: Readonly<number>,
	cropSize: Readonly<number>,
	zoom: Readonly<number>
) {
	// Default max position calculation
	let maxPosition = (imageSize * zoom) / 2 - cropSize / 2;

	// Allow free movement of the image inside the crop area if zoom is less than 1
	// But limit the image's position to inside the cropBox
	if (zoom < 1) {
		maxPosition = cropSize / 2 - (imageSize * zoom) / 2;
	}

	return Math.min(maxPosition, Math.max(position, -maxPosition));
}

export function getDistanceBetweenPoints(pointA: Point, pointB: Point) {
	return Math.sqrt(Math.pow(pointA.y - pointB.y, 2) + Math.pow(pointA.x - pointB.x, 2));
}

/**
 * Compute the output cropped area of the image in percentages and pixels.
 * x/y are the top-left coordinates on the src image
 * @param  crop x/y position of the current center of the image
 * @param  imageSize width/height of the src image (default is size on the screen, natural is the original size)
 * @param  cropSize width/height of the crop area
 * @param aspect aspect value
 * @param zoom zoom value
 * @param restrictPosition whether we should limit or not the cropped area
 */
export function computeCroppedArea(
	crop: Point,
	imgSize: ImageSize,
	cropSize: Size,
	aspect: number,
	zoom: number,
	restrictPosition = true
) {
	const limitAreaFn = restrictPosition ? limitArea : noOp;
	const croppedAreaPercentages = {
		x: limitAreaFn(
			100,
			(((imgSize.width - cropSize.width / zoom) / 2 - crop.x / zoom) / imgSize.width) * 100
		),
		y: limitAreaFn(
			100,
			(((imgSize.height - cropSize.height / zoom) / 2 - crop.y / zoom) / imgSize.height) * 100
		),
		width: limitAreaFn(100, ((cropSize.width / imgSize.width) * 100) / zoom),
		height: limitAreaFn(100, ((cropSize.height / imgSize.height) * 100) / zoom)
	};

	// we compute the pixels size naively
	const widthInPixels = limitAreaFn(
		imgSize.naturalWidth,
		(croppedAreaPercentages.width * imgSize.naturalWidth) / 100,
		true
	);
	const heightInPixels = limitAreaFn(
		imgSize.naturalHeight,
		(croppedAreaPercentages.height * imgSize.naturalHeight) / 100,
		true
	);
	const isImgWiderThanHigh = imgSize.naturalWidth >= imgSize.naturalHeight * aspect;

	// then we ensure the width and height exactly match the aspect (to avoid rounding approximations)
	// if the image is wider than high, when zoom is 0, the crop height will be equals to iamge height
	// thus we want to compute the width from the height and aspect for accuracy.
	// Otherwise, we compute the height from width and aspect.
	const sizePixels = isImgWiderThanHigh
		? {
				width: Math.round(heightInPixels * aspect),
				height: heightInPixels
			}
		: {
				width: widthInPixels,
				height: Math.round(widthInPixels / aspect)
			};
	const croppedAreaPixels = {
		...sizePixels,
		x: limitAreaFn(
			imgSize.naturalWidth - sizePixels.width,
			(croppedAreaPercentages.x * imgSize.naturalWidth) / 100,
			true
		),
		y: limitAreaFn(
			imgSize.naturalHeight - sizePixels.height,
			(croppedAreaPercentages.y * imgSize.naturalHeight) / 100,
			true
		)
	};
	return { croppedAreaPercentages, croppedAreaPixels };
}

/**
 * Ensure the returned value is between 0 and max
 * @param max
 * @param value
 * @param shouldRound
 */
function limitArea(max: number, value: number, shouldRound = false) {
	const v = shouldRound ? Math.round(value) : value;
	return Math.min(max, Math.max(0, v));
}

function noOp(max: number, value: number) {
	return value;
}

/**
 * Return the point that is the center of point a and b
 * @param a
 * @param b
 */
export function getCenter(a: Point, b: Point) {
	return {
		x: (b.x + a.x) / 2,
		y: (b.y + a.y) / 2
	};
}

function createImage(url: string) {
	return new Promise<HTMLImageElement>((resolve, reject) => {
		const image = new Image();
		image.onload = () => resolve(image);
		image.onerror = reject;
		image.src = url;
	});
}

function getRadianAngle(degreeValue: number) {
	return (degreeValue * Math.PI) / 180;
}

/**
 * Returns the new bounding area of a rotated rectangle.
 */
function rotateSize(width: number, height: number, rotation: number) {
	const rotRad = getRadianAngle(rotation);

	return {
		width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
		height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height)
	};
}

/**
 * This function was adapted from the one in the ReadMe of https://github.com/DominicTobias/react-image-crop
 */
export async function getCroppedImg(
	imageSrc: string,
	pixelCrop: CropArea,
	rotation = 0,
	flip = { horizontal: false, vertical: false }
) {
	const image = await createImage(imageSrc);
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');

	if (!ctx) {
		return null;
	}

	const rotRad = getRadianAngle(rotation);

	// calculate bounding box of the rotated image
	const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.width, image.height, rotation);

	// set canvas size to match the bounding box
	canvas.width = bBoxWidth;
	canvas.height = bBoxHeight;

	// translate canvas context to a central location to allow rotating and flipping around the center
	ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
	ctx.rotate(rotRad);
	ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
	ctx.translate(-image.width / 2, -image.height / 2);

	// draw rotated image
	ctx.drawImage(image, 0, 0);

	// croppedAreaPixels values are bounding box relative
	// extract the cropped image using these values
	const data = ctx.getImageData(pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height);

	// set canvas width to final desired crop size - this will clear existing context
	canvas.width = pixelCrop.width;
	canvas.height = pixelCrop.height;

	// paste generated rotate image at the top left corner
	ctx.putImageData(data, 0, 0);

	// As Base64 string
	// return canvas.toDataURL('image/jpeg');

	// As a blob
	return new Promise<Blob>((resolve, reject) => {
		canvas.toBlob((file) => {
			if (!file) {
				return reject();
			}
			return resolve(file);
			// resolve(URL.createObjectURL(file));
		}, 'image/png'); // PNG to preserve transparency
	});
}
