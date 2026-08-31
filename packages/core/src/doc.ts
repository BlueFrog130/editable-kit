import type { ImageNode, ParagraphNode, ProseMirrorJSON } from './prosemirror.js';

/**
 * A document for a `Text` field: bare inline text, no paragraph wrapper.
 *
 * ```ts
 * function newNote() {
 * 	return { title: text('Untitled'), body: paragraphs() };
 * }
 * ```
 */
export function text(value = ''): ProseMirrorJSON {
	// ProseMirror rejects empty text nodes, so an empty string is an empty document
	// rather than a node that throws the moment the editor mounts.
	return { type: 'doc', content: value ? [{ type: 'text', text: value }] : [] };
}

/**
 * A document for a `Multiline` or `Rich` field: one paragraph per argument.
 * With no arguments you get a single empty paragraph — the empty rich document.
 */
export function paragraphs(...values: string[]): ProseMirrorJSON {
	const paragraph = (value: string): ParagraphNode =>
		value ? { type: 'paragraph', content: [{ type: 'text', text: value }] } : { type: 'paragraph' };

	return { type: 'doc', content: (values.length ? values : ['']).map(paragraph) };
}

/**
 * A document for an `Image` field: a single image node, the shape TipTap itself
 * stores. Pass `width`/`height` when you know them — the renderer emits them, so the
 * image reserves its space instead of shifting the page as it loads.
 */
export function image(src = '', attrs: Omit<ImageNode['attrs'], 'src'> = {}): ProseMirrorJSON {
	// An image field with nothing picked yet is an empty document, not an image with no src.
	return { type: 'doc', content: src ? [{ type: 'image', attrs: { src, ...attrs } }] : [] };
}

/**
 * The attributes of an image document's node, or `{}` if nothing has been picked yet.
 * For reading a stored image outside a field — a thumbnail, an `og:image` tag.
 */
export function imageAttrs(doc: ProseMirrorJSON): Partial<ImageNode['attrs']> {
	const node = doc.content?.[0];
	return node?.type === 'image' ? node.attrs : {};
}
