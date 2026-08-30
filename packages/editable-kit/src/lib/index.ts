import type { ProseMirrorJSON } from './types/prosemirror.js';

export type { _TiptapCommands } from './tiptap-commands.js';

// ── Editable context components ──
export { default as Root } from './components/editable/editable.svelte';
export {
	EditableState,
	type EditableCommand
} from './components/editable/editable-state.svelte.js';
export type { SaveStatus } from './components/editable/editable-context.svelte.js';

// ── Field components ──
export { Field, Text, Multiline, Rich, Image } from './components/editors/index.js';
export { pickFile } from './components/field/pick-file.js';

// ── Default-content helpers ──
export { text, paragraphs, image, imageAttrs } from './doc.js';

// ── Renderer ──
export {
	Renderer,
	PlainText,
	mergeOverrides,
	nodeDefaults,
	markDefaults
} from './components/renderer/index.js';
export type {
	NodeOverrides,
	NodeOverrideSnippets,
	MarkOverrideSnippets,
	NodeSnippet,
	MarkSnippet,
	ElementSpec,
	NodeDefault,
	MarkDefault
} from './components/renderer/index.js';

// ── Editor types ──
export type { TextEditorOptions, UploadHandler, Variant } from './components/editor/types.js';

// ── Core types ──
export type { MaybePromise } from './types.js';

// ── ProseMirror JSON types ──
export type {
	/** Augment these from `'editable-kit/types'` to register your own nodes and marks. */
	NodeTypes,
	MarkTypes,
	ProseMirrorJSON,
	/** TipTap's own document JSON — the type of anything `editor.getJSON()` returns. */
	JSONContent,
	JSONMark,
	PMNode,
	Mark,
	TextNode,
	ImageNode,
	HardBreakNode,
	ParagraphNode,
	HeadingNode,
	BlockquoteNode,
	BulletListNode,
	OrderedListNode,
	ListItemNode,
	CodeBlockNode,
	HorizontalRuleNode,
	InlineNode,
	BlockNode,
	DocNode,
	BoldMark,
	ItalicMark,
	UnderlineMark,
	StrikeMark,
	CodeMark,
	LinkMark
} from './types/prosemirror.js';

// Type alias exports
type TextJSON = ProseMirrorJSON;
type RichJSON = ProseMirrorJSON;

export type { TextJSON, RichJSON };
