import type { Extensions, Editor } from '@tiptap/core';
import type { EditorProps } from '@tiptap/pm/view';
import type { NodeOverrides } from '../renderer/types.js';
import type { ProseMirrorJSON } from '$lib/index.js';
import type { Component } from 'svelte';

export type TextEditorOptions = {
	/** Customize extensions. Receives defaults, returns final array. Async for lazy imports. */
	extensions?: (defaults: Extensions) => Extensions | Promise<Extensions>;
	/** Override placeholder text */
	placeholder?: string;
	/** Called after Editor is created — full TipTap/ProseMirror access */
	oncreate?: (editor: Editor) => void;
	/** Called when Editor is destroyed */
	ondestroy?: (editor: Editor | null) => void;
	/** ProseMirror EditorProps for view customization (DOM attrs, key handlers, etc.) */
	editorProps?: EditorProps;
};

export type Variant = 'plain' | 'multiline' | 'rich';

export type EditorContentProps = {
	editor: EditorComponent;
	editing: boolean;
	variant: Variant;
	overrides?: NodeOverrides;
	textEditorOptions?: TextEditorOptions;
	'aria-label'?: string;
} & EditorComponentProps;

export type EditorComponentProps = {
	content: ProseMirrorJSON;
	oncreate?: (editor: Editor) => void;
	ondestroy?: (editor: Editor | null) => void;
	onfocus?: (editor: Editor) => void;
	onblur?: () => void;
};

export type EditorContent =
	| {
			type: 'text';
			content: ProseMirrorJSON;
	  }
	| {
			type: 'image-src';
			src: string;
			alt: string;
	  }
	| {
			type: 'image-blob';
			blob: Blob;
			alt: string;
	  };

export type EditorComponent = ReturnType<
	Component<Record<string, unknown>, { getContent: () => Promise<EditorContent> }>
>;
