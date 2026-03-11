import type { ClassValue } from 'svelte/elements';
import type { EditorComponent } from '../editor/index.js';
import type { FocusUtils, Point } from './types.js';

export type ImageProps = {
	class?: ClassValue;
	src: string;
	alt: string;
	maxWidth: number;
	maxHeight: number;
	quality: number;
	aspect?: number;
	onchange?: (data: { crop: Point; zoom: number }) => void;
	editor: EditorComponent;
	editing: boolean;
	onfocus?: (editor: FocusUtils) => void;
	'aria-label'?: string;
};

export { default as Image } from './image.svelte';
