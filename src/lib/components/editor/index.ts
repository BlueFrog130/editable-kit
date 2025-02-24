import type { Editor } from '@tiptap/core';
import type { Component } from 'svelte';

export type EditorContentProps = {
	editor: EditorComponent;
	editing: boolean;
} & EditorComponentProps;

export type EditorComponentProps = {
	content: string;
	oncreate?: (editor: Editor) => void;
	ondestroy?: (editor: Editor | null) => void;
	onfocus?: (editor: Editor) => void;
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
export type EditorComponent = ReturnType<
	Component<any, { getContent: EditorGetContentFn; setContent: () => Promise<void> }>
>;

export function importEditor() {
	return Promise.all([
		import('@tiptap/core'),
		import('./editor.svelte'),
		import('./extensions.js')
	]);
}
