import type { Editor } from '@tiptap/core';
import type { ProseMirrorJSON } from './types/prosemirror.js';

export type MaybePromise<T> = T | Promise<T>;

export type ImageState = {
	src: string;
	alt: string;
};

export type EditorData = object;
/**
 * Transformed editor data into the following
 * ProseMirrorJSON -> { type: 'text', content: ProseMirrorJSON }
 * ImageState -> { type: 'image-src', src: string, alt: string } | { type: 'image-blob', blob: Blob, alt: string }
 */
export type EditorSaveData<T extends EditorData> = {
	[P in keyof T]: T[P] extends ProseMirrorJSON
		? { type: 'text'; content: ProseMirrorJSON }
		:
				| { type: 'image-src'; src: string; alt: string }
				| { type: 'image-blob'; blob: Blob; alt: string };
};

export type KeysWithValsOfType<T, V> = keyof { [P in keyof T as T[P] extends V ? P : never]: P } &
	keyof T;

export type JSONKeys<T> = KeysWithValsOfType<T, ProseMirrorJSON>;
export type ImageKeys<T> = KeysWithValsOfType<T, ImageState>;

export type TextEditable = {
	type: 'text';
	editor: Editor;
};

export type ImageEditable = {
	type: 'image';
	editor: {
		replaceImage: () => void;
		setImageSrc: (src: string) => void;
		getAlt: () => string;
		setAlt: (alt: string) => void;
	};
};

export type Editable = TextEditable | ImageEditable;
