import type { Extensions, Editor } from '@tiptap/core';
import type { EditorProps } from '@tiptap/pm/view';
import type { NodeOverrides } from '../renderer/types.js';
import type { ProseMirrorJSON } from '$lib/types/prosemirror.js';

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

export type Variant = 'plain' | 'multiline' | 'rich' | 'image';

/** Turns a picked file into a URL the editor can point at. */
export type UploadHandler = (file: File) => Promise<string>;

export type FieldProps = {
	content: ProseMirrorJSON;
	variant: Variant;
	editing: boolean;
	overrides?: NodeOverrides;
	options?: TextEditorOptions;
	upload?: UploadHandler;
	onfocus?: (editor: import('@tiptap/core').Editor) => void;
	/** Fires on blur and on image edits — not per keystroke. See `Editable.Root`. */
	onchange?: (value: ProseMirrorJSON) => void;
	'aria-label'?: string;
	class?: import('svelte/elements').ClassValue;
};
