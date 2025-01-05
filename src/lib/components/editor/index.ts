import type { Editor } from '@tiptap/core';
import type { Component } from 'svelte';

export { default as Editor } from './editor.svelte';
export * from './extensions.js';

export type EditorComponentProps = {
	name: string | number | Symbol;
	content: string;
	oncreate?: (editor: Editor) => void;
	ondestroy?: (editor: Editor | null) => void;
};

export type EditorComponent = Component<EditorComponentProps>;
