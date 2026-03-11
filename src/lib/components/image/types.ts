export type CropShape = 'rect' | 'round';

export type Size = {
	width: number;
	height: number;
};

export type ImageSize = {
	width: number;
	height: number;
	naturalWidth: number;
	naturalHeight: number;
};

export type Point = {
	x: number;
	y: number;
};

export type FocusUtils = {
	replaceImage: () => void;
	setImageSrc: (src: string) => void;
	getAlt: () => string;
	setAlt: (alt: string) => void;
};
