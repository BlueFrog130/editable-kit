import type { Editor } from '@tiptap/core';
import type { Component } from 'svelte';

export { default as Editor } from './editor.svelte';

export type EditorContentProps = {
	editor: EditorComponent;
	editing: boolean;
} & EditorComponentProps;

export type EditorComponentProps = {
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

export function importEditor() {
	return Promise.all([
		import('@tiptap/core'),
		import('./editor.svelte'),
		import('./extensions.js'),
		import('$lib/state/toolbar-state.svelte.js')
	]);
}
