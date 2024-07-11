import type { CropShape, DispatchEvents, Point, Size } from '$lib/image/types.js';
import type { HTMLImgAttributes } from 'svelte/elements';

export type ImageProps = {
	src: string;
	alt: string;
	uploadPrompt?: string;
	maxWidth: number;
	maxHeight: number;
	quality: number;
};

export type CropperProps = {
	image?: string;
	crop: Point;
	zoom: number;
	aspect: number;
	minZoom?: number;
	maxZoom?: number;
	cropSize?: Size | null;
	cropShape?: CropShape;
	showGrid?: boolean;
	zoomSpeed?: number;
	crossOrigin?: HTMLImgAttributes['crossorigin'];
	restrictPosition?: boolean;
	tabindex?: number;
	oncropcomplete?: undefined | (({ percent, pixels }: DispatchEvents['cropcomplete']) => void);
};

export { default as Image } from './image.svelte';
