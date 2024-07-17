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

export type CropArea = {
	x: number;
	y: number;
	width: number;
	height: number;
};
