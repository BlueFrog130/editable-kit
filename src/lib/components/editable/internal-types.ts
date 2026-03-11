import type { EditorContent } from '../editor/index.js';

export type EditorRegistration = {
	getContent: () => Promise<EditorContent>;
};

export type ImageOptions = {
	maxWidth: number;
	maxHeight: number;
	quality: number;
	aspect?: number;
};
