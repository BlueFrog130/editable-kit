import type { EditorComponent } from '../editor/index.js';
import type { FocusUtils, Point } from './types.js';

export type ImageProps = {
	src: string;
	alt: string;
	maxWidth: number;
	maxHeight: number;
	quality: number;
	aspect: number;
	onchange?: (data: { crop: Point; zoom: number }) => void;
	editor: EditorComponent;
	editing: boolean;
	onfocus?: (editor: FocusUtils) => void;
};

export { default as Image } from './image.svelte';
