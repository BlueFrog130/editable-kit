import type { Point } from './types.js';

export type ImageProps = {
	src: string;
	alt: string;
	maxWidth: number;
	maxHeight: number;
	quality: number;
	aspect: number;
	onchange?: (data: { crop: Point; zoom: number }) => void;
};

export { default as Image } from './image.svelte';
