import type { Editor } from '@tiptap/core';
import { importEditor } from './editor/index.js';
import type { TextEditorOptions, Variant } from './editor/types.js';
import type { ProseMirrorJSON } from './prosemirror.js';

/** Viewport coordinates of the click that activated the field, if it was a click. */
export type Pointer = { left: number; top: number };

export type FieldEditorOptions = {
	variant: Variant;
	content: ProseMirrorJSON;
	options?: TextEditorOptions;
	ariaLabel?: string;
	/** Place the caret where the user clicked. Omitted for a keyboard focus. */
	pointer?: Pointer;
	/** Fires on blur — not per keystroke. */
	onchange?: (value: ProseMirrorJSON) => void;
	onfocus?: (editor: Editor) => void;
};

/** Mounts the loaded editor onto an element. Synchronous — see {@link loadFieldEditor}. */
export type MountFieldEditor = (node: HTMLElement) => Editor;

/** TipTap's `JSONContent` is looser than our document type; this narrows it. */
export function getValue(editor: Editor | undefined, fallback: ProseMirrorJSON): ProseMirrorJSON {
	return (editor?.getJSON() ?? fallback) as ProseMirrorJSON;
}

// ponytail: no scrollIntoView anywhere — the field was just clicked, so it is already on
// screen, and letting ProseMirror scroll to the selection nudges any scrollable ancestor
// (or the page) sideways, which reads as the field shifting.
const NO_SCROLL = { scrollIntoView: false };

/**
 * Load TipTap and this variant's extensions, and hand back a function that mounts an
 * editor **onto** a given element rather than inside it — the whole no-layout-shift
 * design. ProseMirror takes ownership of that element's children.
 *
 * Loading and mounting are separate on purpose. A UI framework has to hand over an
 * element it will not touch again, which usually means re-creating it first; doing that
 * before the `await` would leave the field in a half-torn-down state for the length of a
 * network fetch. So: `await loadFieldEditor()` first, re-create the element, then call
 * the returned function synchronously.
 *
 * ```ts
 * const mount = await loadFieldEditor(opts);
 * if (stillEditing) editor = mount(freshElement);
 * ```
 */
export async function loadFieldEditor(opts: FieldEditorOptions): Promise<MountFieldEditor> {
	const [{ Editor: Tiptap }, extensions] = await importEditor(opts.variant, opts.options);

	return function mount(node) {
		const editor: Editor = new Tiptap({
			// ProseMirror's `mount` place: use this element as the editable node instead of
			// appending a new one. Verified against @tiptap/core createView.
			element: { mount: node } as unknown as HTMLElement,
			content: opts.content,
			extensions,
			autofocus: false,
			editable: true,
			injectCSS: false,
			editorProps: {
				...opts.options?.editorProps,
				attributes: {
					...(typeof opts.options?.editorProps?.attributes === 'object'
						? opts.options.editorProps.attributes
						: {}),
					...(opts.ariaLabel ? { 'aria-label': opts.ariaLabel } : {})
				}
			},
			onBlur: () => opts.onchange?.(getValue(editor, opts.content)),
			onFocus: ({ editor: e }) => opts.onfocus?.(e)
		});

		opts.options?.oncreate?.(editor);

		if (opts.variant === 'image') {
			editor.commands.focus(null, NO_SCROLL);
		} else {
			const at = opts.pointer && editor.view.posAtCoords(opts.pointer);
			if (at) editor.chain().setTextSelection(at.pos).focus(null, NO_SCROLL).run();
			else editor.commands.focus('end', NO_SCROLL);
		}

		return editor;
	};
}

/**
 * Report the final value, run `ondestroy`, and tear the editor down. The element it was
 * mounted on is the caller's to discard — ProseMirror has replaced its children.
 */
export function destroyFieldEditor(editor: Editor, opts: FieldEditorOptions): void {
	opts.onchange?.(getValue(editor, opts.content));
	opts.options?.ondestroy?.(editor);
	editor.destroy();
}
