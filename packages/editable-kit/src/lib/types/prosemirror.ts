import type { JSONContent } from '@tiptap/core';
import type { Level } from '@tiptap/extension-heading';
import type { SetImageOptions } from '@tiptap/extension-image';

/**
 * TipTap's own document JSON type — what `editor.getJSON()` returns, and what any
 * extension's node looks like. The exact node types below are the subset this library
 * renders out of the box; both are assignable to it, so a document containing nodes from
 * an extension you added is still a valid `JSONContent`.
 */
export type { JSONContent };

/** One entry of `JSONContent['marks']`. TipTap does not name it, so we do. */
export type JSONMark = NonNullable<JSONContent['marks']>[number];

// Mark types

export type BoldMark = { type: 'bold' };
export type ItalicMark = { type: 'italic' };
export type UnderlineMark = { type: 'underline' };
export type StrikeMark = { type: 'strike' };
export type CodeMark = { type: 'code' };
export type LinkMark = {
	type: 'link';
	attrs: { href: string; target?: string | null; rel?: string | null; class?: string | null };
};

/**
 * Every mark type the renderer knows, keyed by its TipTap extension name. Augment it
 * from your own module to register a mark an extension of yours adds:
 *
 * ```ts
 * declare module 'editable-kit' {
 * 	interface MarkTypes {
 * 		highlight: { type: 'highlight'; attrs: { color: string } };
 * 	}
 * }
 * ```
 *
 * `overrides.marks.highlight` is then typed, and `Mark` includes it. Declare the entry
 * as a `type`, not an `interface`, so it stays assignable to TipTap's `JSONContent`.
 */
export interface MarkTypes {
	bold: BoldMark;
	italic: ItalicMark;
	underline: UnderlineMark;
	strike: StrikeMark;
	code: CodeMark;
	link: LinkMark;
}

/** Every registered mark. Augmenting [[MarkTypes]] widens it. */
export type Mark = MarkTypes[keyof MarkTypes];

// Inline nodes

export type TextNode = {
	type: 'text';
	text: string;
	marks?: Mark[];
};

/** ProseMirror stores an unset attribute as `null`, not as a missing key. */
type Unset<T> = { [K in keyof T]?: T[K] | null };

export type ImageNode = {
	type: 'image';
	/**
	 * TipTap's own image attributes — `src`, `alt`, `title`, and the intrinsic
	 * `width`/`height` the renderer emits so the image reserves space before it loads.
	 */
	attrs: Unset<SetImageOptions> & { src: string };
};

export type HardBreakNode = {
	type: 'hardBreak';
};

/** The built-in inline nodes. Descriptive only — `content` positions take any [[PMNode]]. */
export type InlineNode = TextNode | ImageNode | HardBreakNode;

// Block nodes

export type ParagraphNode = {
	type: 'paragraph';
	content?: PMNode[];
};

export type HeadingNode = {
	type: 'heading';
	/** `Level` is TipTap's — 1-6. Which of them a field offers is the extension's config. */
	attrs: { level: Level };
	content?: PMNode[];
};

export type BlockquoteNode = {
	type: 'blockquote';
	content?: PMNode[];
};

export type BulletListNode = {
	type: 'bulletList';
	content?: PMNode[];
};

export type OrderedListNode = {
	type: 'orderedList';
	attrs?: { start?: number };
	content?: PMNode[];
};

export type ListItemNode = {
	type: 'listItem';
	content?: PMNode[];
};

/** TipTap's `CodeBlock` node. The extension is not in any default set — add it yourself. */
export type CodeBlockNode = {
	type: 'codeBlock';
	attrs?: { language?: string | null };
	content?: PMNode[];
};

/** TipTap's `HorizontalRule` node. The extension is not in any default set. */
export type HorizontalRuleNode = {
	type: 'horizontalRule';
};

/** The built-in block nodes. Descriptive only — `content` positions take any [[PMNode]]. */
export type BlockNode =
	| ParagraphNode
	| HeadingNode
	| BlockquoteNode
	| BulletListNode
	| OrderedListNode
	| ListItemNode
	| CodeBlockNode
	| HorizontalRuleNode;

/**
 * Every node type the renderer knows, keyed by its TipTap extension name. Augment it
 * from your own module to register a node an extension of yours adds:
 *
 * ```ts
 * declare module 'editable-kit' {
 * 	interface NodeTypes {
 * 		callout: { type: 'callout'; attrs: { tone: 'info' | 'warn' }; content?: PMNode[] };
 * 	}
 * }
 * ```
 *
 * `overrides.nodes.callout` is then typed, and `PMNode` — so every `content` array —
 * includes it. Declare the entry as a `type`, not an `interface`, so it stays assignable
 * to TipTap's `JSONContent`.
 */
export interface NodeTypes {
	text: TextNode;
	image: ImageNode;
	hardBreak: HardBreakNode;
	paragraph: ParagraphNode;
	heading: HeadingNode;
	blockquote: BlockquoteNode;
	bulletList: BulletListNode;
	orderedList: OrderedListNode;
	listItem: ListItemNode;
	codeBlock: CodeBlockNode;
	horizontalRule: HorizontalRuleNode;
}

/** Every registered node. Augmenting [[NodeTypes]] widens it. */
export type PMNode = NodeTypes[keyof NodeTypes];

export type DocNode = {
	type: 'doc';
	content?: PMNode[];
};

/** Top-level ProseMirror document JSON */
export type ProseMirrorJSON = DocNode;
