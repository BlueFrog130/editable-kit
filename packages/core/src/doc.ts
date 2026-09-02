import type { JSONContent } from '@tiptap/core';
import type {
	CodeBlockNode,
	HeadingNode,
	ImageNode,
	ListItemNode,
	ParagraphNode,
	PMNode,
	ProseMirrorJSON
} from './prosemirror.js';

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

/**
 * A document assembled from nodes and other documents. Documents are flattened into
 * their content, so every helper here composes with every other one:
 *
 * ```ts
 * doc(
 * 	heading(2, 'Release notes'),
 * 	paragraphs('Two things changed.', 'Both are small.'),
 * 	list(['Drag handles', 'Code blocks']),
 * 	codeBlock("paragraphs('Edit me')", 'typescript'),
 * 	image('/hero.png', { alt: 'Hero' })
 * );
 * ```
 */
export function doc(...parts: (PMNode | ProseMirrorJSON)[]): ProseMirrorJSON {
	const content = parts.flatMap((part) =>
		part.type === 'doc' ? ((part as ProseMirrorJSON).content ?? []) : [part as PMNode]
	);

	return { type: 'doc', content };
}

/** A heading node. `level` is 1-6; which levels a field offers is the extension's config. */
export function heading(level: HeadingNode['attrs']['level'], value = ''): HeadingNode {
	return {
		type: 'heading',
		attrs: { level },
		...(value && { content: [{ type: 'text', text: value }] })
	};
}

/**
 * A code block node, `language` being the highlighter's language id. Needs TipTap's
 * `CodeBlock` (or `CodeBlockShiki`) extension — it is in no default set.
 */
export function codeBlock(code = '', language?: string): CodeBlockNode {
	return {
		type: 'codeBlock',
		attrs: { language: language ?? null },
		...(code && { content: [{ type: 'text', text: code }] })
	};
}

/**
 * A bullet (or, with `ordered`, a numbered) list — one item per string, each wrapped in
 * the `listItem` > `paragraph` nesting ProseMirror's schema requires.
 */
// ponytail: strings only. For a nested list or a marked-up item, build the listItem
// nodes by hand — the nesting is the only fiddly part and this covers the common case.
export function list(items: string[], ordered = false): PMNode {
	const item = (value: string): ListItemNode => ({
		type: 'listItem',
		content: [paragraphs(value).content![0]!]
	});

	return { type: ordered ? 'orderedList' : 'bulletList', content: items.map(item) };
}

/**
 * The plain text of a document or of any node in one — every text node concatenated,
 * with `blockSeparator` between sibling nodes, the way ProseMirror's own
 * `node.textBetween()` builds `textContent`. For a search index, an excerpt, a
 * `<meta description>`, or reading a code block's source out of view mode.
 *
 * ```ts
 * textContent(paragraphs('One', 'Two')); // 'One\nTwo'
 * textContent(codeBlock('a\nb')); // 'a\nb'
 * ```
 */
// ponytail: JSON has no schema, so a node counts as a block boundary by not being a
// text node. Inline non-text nodes (a hardBreak, an inline image) therefore separate
// too — right for the break, close enough for the image. Need real `isBlock`? Read
// `editor.state.doc.textBetween()` from a mounted field instead.
export function textContent(node: JSONContent, blockSeparator = '\n'): string {
	if (node.type === 'text') return node.text ?? '';

	return (node.content ?? []).reduce(
		(acc, child, i) =>
			acc + (i && child.type !== 'text' ? blockSeparator : '') + textContent(child, blockSeparator),
		''
	);
}
