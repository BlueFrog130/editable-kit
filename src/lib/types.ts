import type { Editor } from '@tiptap/core';

export type MaybePromise<T> = T | Promise<T>;

export type ImageState = {
	src: string;
	alt: string;
};

export type ImageEditState = {
	src: File | null;
	alt: string;
};

export type EditorData = object;
/**
 * Transformed editor data into the following
 * string -> { type: 'text', content: string }
 * ImageState -> { type: 'image', content: null | Blob }
 */
export type EditorSaveData<T extends EditorData> = {
	[P in keyof T]: T[P] extends string
		? { type: 'text'; content: string }
		: { type: 'image'; content: null | Blob };
};

type KeysWithValsOfType<T, V> = keyof { [P in keyof T as T[P] extends V ? P : never]: P } & keyof T;

export type StringKeys<T> = KeysWithValsOfType<T, string>;
export type ImageKeys<T> = KeysWithValsOfType<T, ImageState>;

export type Editable =
	| {
			type: 'image';
			editor: {
				replaceImage: () => void;
			};
	  }
	| {
			type: 'text';
			editor: Editor;
	  };
