import type { Snippet } from 'svelte';
import type {
	ParagraphNode,
	HeadingNode,
	BlockquoteNode,
	BulletListNode,
	OrderedListNode,
	ListItemNode,
	ImageNode,
	HardBreakNode,
	BoldMark,
	ItalicMark,
	UnderlineMark,
	StrikeMark,
	LinkMark
} from '$lib/types/prosemirror.js';

export type NodeOverrideSnippets = {
	paragraph?: Snippet<[ParagraphNode, Snippet]>;
	heading?: Snippet<[HeadingNode, Snippet]>;
	blockquote?: Snippet<[BlockquoteNode, Snippet]>;
	bulletList?: Snippet<[BulletListNode, Snippet]>;
	orderedList?: Snippet<[OrderedListNode, Snippet]>;
	listItem?: Snippet<[ListItemNode, Snippet]>;
	image?: Snippet<[ImageNode]>;
	hardBreak?: Snippet<[HardBreakNode]>;
};

export type MarkOverrideSnippets = {
	bold?: Snippet<[BoldMark, Snippet]>;
	italic?: Snippet<[ItalicMark, Snippet]>;
	underline?: Snippet<[UnderlineMark, Snippet]>;
	strike?: Snippet<[StrikeMark, Snippet]>;
	link?: Snippet<[LinkMark, Snippet]>;
};

export type NodeOverrides = {
	nodes?: NodeOverrideSnippets;
	marks?: MarkOverrideSnippets;
};
