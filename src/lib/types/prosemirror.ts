// Mark types

export type BoldMark = { type: 'bold' };
export type ItalicMark = { type: 'italic' };
export type UnderlineMark = { type: 'underline' };
export type StrikeMark = { type: 'strike' };
export type LinkMark = {
	type: 'link';
	attrs: { href: string; target?: string | null; rel?: string | null; class?: string | null };
};

export type Mark = BoldMark | ItalicMark | UnderlineMark | StrikeMark | LinkMark;

// Inline nodes

export type TextNode = {
	type: 'text';
	text: string;
	marks?: Mark[];
};

export type ImageNode = {
	type: 'image';
	attrs: { src: string; alt?: string | null; title?: string | null };
};

export type HardBreakNode = {
	type: 'hardBreak';
};

export type InlineNode = TextNode | ImageNode | HardBreakNode;

// Block nodes

export type ParagraphNode = {
	type: 'paragraph';
	content?: InlineNode[];
};

export type HeadingNode = {
	type: 'heading';
	attrs: { level: 1 | 2 | 3 };
	content?: InlineNode[];
};

export type BlockquoteNode = {
	type: 'blockquote';
	content?: BlockNode[];
};

export type BulletListNode = {
	type: 'bulletList';
	content?: ListItemNode[];
};

export type OrderedListNode = {
	type: 'orderedList';
	attrs?: { start?: number };
	content?: ListItemNode[];
};

export type ListItemNode = {
	type: 'listItem';
	content?: BlockNode[];
};

export type BlockNode =
	| ParagraphNode
	| HeadingNode
	| BlockquoteNode
	| BulletListNode
	| OrderedListNode
	| ListItemNode;

export type PMNode = InlineNode | BlockNode;

export type DocNode = {
	type: 'doc';
	content?: PMNode[];
};

/** Top-level ProseMirror document JSON */
export type ProseMirrorJSON = DocNode;
