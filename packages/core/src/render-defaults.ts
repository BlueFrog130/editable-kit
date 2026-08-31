import type { JSONContent, JSONMark } from './prosemirror.js';

/**
 * What a node or mark renders to when no override snippet is supplied.
 *
 * This table *is* the renderer's configuration: adding support for a TipTap
 * extension that maps cleanly to one element is one entry here, and anything
 * that doesn't is a snippet in `overrides`.
 */
export type ElementSpec = {
	tag: string;
	attrs?: Record<string, unknown>;
	/** Void elements take no children (`img`, `br`, `hr`). */
	void?: boolean;
};

/**
 * Both sides take TipTap's own JSON shapes: the renderer must survive documents from
 * extensions it has never seen, and `editor.getJSON()` is exactly what it gets.
 *
 * Returning `null` renders the children bare — the node contributes no element.
 */
export type NodeDefault = (node: JSONContent) => ElementSpec | null;
export type MarkDefault = (mark: JSONMark) => ElementSpec | null;

function level(value: unknown): number {
	const n = Number(value);
	// ponytail: clamped, not validated — a heading level of 0 or 9 from a reconfigured
	// Heading extension would otherwise emit `<h0>`, which is not an element.
	return Number.isFinite(n) ? Math.min(6, Math.max(1, Math.round(n))) : 1;
}

export const nodeDefaults: Record<string, NodeDefault> = {
	paragraph: () => ({ tag: 'p' }),
	heading: (node) => ({ tag: `h${level(node.attrs?.level)}` }),
	blockquote: () => ({ tag: 'blockquote' }),
	bulletList: () => ({ tag: 'ul' }),
	orderedList: (node) => ({ tag: 'ol', attrs: { start: node.attrs?.start } }),
	listItem: () => ({ tag: 'li' }),
	codeBlock: (node) => ({ tag: 'pre', attrs: { 'data-language': node.attrs?.language } }),
	horizontalRule: () => ({ tag: 'hr', void: true }),
	hardBreak: () => ({ tag: 'br', void: true }),
	image: (node) => {
		const src = node.attrs?.src;
		// No src yet (an image field before anything is picked) — render nothing
		// rather than a broken `<img>`.
		if (typeof src !== 'string' || src === '') return null;
		return {
			tag: 'img',
			void: true,
			attrs: {
				src,
				alt: node.attrs?.alt ?? '',
				title: node.attrs?.title ?? undefined,
				width: node.attrs?.width ?? undefined,
				height: node.attrs?.height ?? undefined,
				loading: 'lazy',
				decoding: 'async'
			}
		};
	}
};

export const markDefaults: Record<string, MarkDefault> = {
	bold: () => ({ tag: 'strong' }),
	italic: () => ({ tag: 'em' }),
	underline: () => ({ tag: 'u' }),
	strike: () => ({ tag: 's' }),
	code: () => ({ tag: 'code' }),
	link: (mark) => ({
		tag: 'a',
		attrs: {
			href: mark.attrs?.href,
			target: mark.attrs?.target ?? undefined,
			// The Link extension sets this same default, so view and edit modes agree.
			rel: mark.attrs?.rel ?? (mark.attrs?.target === '_blank' ? 'noopener noreferrer' : undefined),
			class: mark.attrs?.class ?? undefined
		}
	})
};
