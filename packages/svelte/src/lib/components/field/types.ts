import type { Editor } from '@tiptap/core';
import type { ClassValue } from 'svelte/elements';
import type { ProseMirrorJSON, TextEditorOptions, Variant } from '@editable-kit/core';
import type { NodeOverrides } from '../renderer/types.js';

export type FieldProps = {
	content: ProseMirrorJSON;
	variant: Variant;
	editing: boolean;
	overrides?: NodeOverrides;
	options?: TextEditorOptions;
	onfocus?: (editor: Editor) => void;
	/** Fires on blur and on image edits — not per keystroke. See `Editable.Root`. */
	onchange?: (value: ProseMirrorJSON) => void;
	'aria-label'?: string;
	class?: ClassValue;
};
