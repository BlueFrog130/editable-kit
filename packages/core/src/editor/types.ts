import type { Extensions, Editor } from '@tiptap/core';
import type { EditorProps } from '@tiptap/pm/view';

export type TextEditorOptions = {
	/**
	 * Replaces the variant defaults outright. Pass a promise (`import('...').then(...)`)
	 * and it loads in parallel with TipTap. To build on the defaults instead of dropping
	 * them, `Promise.all([defaultExtensions('rich'), import('...')])`.
	 */
	extensions?: Extensions | Promise<Extensions>;
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

/**
 * Turns a picked file into a URL the editor can point at. Nothing in the library calls
 * one — build the flow in your toolbar: `pickFile()`, your upload, then `setImage`.
 */
export type UploadHandler = (file: File) => Promise<string>;
