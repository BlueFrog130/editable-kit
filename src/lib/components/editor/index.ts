import type { Editor } from '@tiptap/core';
import type { Component } from 'svelte';

export { default as Editor } from './editor.svelte';
export * from './extensions.js';

export type EditorContentProps = {
	editor: EditorComponent;
} & EditorComponentProps;

export type EditorComponentProps = {
	name: string | number | Symbol;
	content: string;
	oncreate?: (editor: Editor) => void;
	ondestroy?: (editor: Editor | null) => void;
};

export type EditorContent =
	| {
			type: 'text';
			content: string;
	  }
	| {
			type: 'image';
			content: null | Blob;
	  };
export type EditorGetContentFn = () => Promise<EditorContent>;
export type EditorComponent = ReturnType<Component<any, { getContent: EditorGetContentFn }>>;
