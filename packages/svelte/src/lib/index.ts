// ── Editable context components ──
export { default as Root } from './components/editable/editable.svelte';
export {
	EditableState,
	type EditableCommand
} from './components/editable/editable-state.svelte.js';
export type { SaveStatus } from './components/editable/editable-context.svelte.js';

// ── Field components ──
export { Field, Text, Multiline, Rich, Image } from './components/editors/index.js';
export type { FieldProps } from './components/field/types.js';

// ── Renderer ──
export { Renderer, PlainText, mergeOverrides } from './components/renderer/index.js';
export type {
	NodeOverrides,
	NodeOverrideSnippets,
	MarkOverrideSnippets,
	NodeSnippet,
	MarkSnippet
} from './components/renderer/index.js';

// ── Re-exported from @editable-kit/core ──
// Everything framework-agnostic lives there; you never need to install it directly.
// One exception: register your own node/mark types by augmenting
// `'@editable-kit/core/types'`, the module that declares `NodeTypes`/`MarkTypes`.
export {
	text,
	paragraphs,
	image,
	imageAttrs,
	pickFile,
	nodeDefaults,
	markDefaults
} from '@editable-kit/core';
export type {
	_TiptapCommands,
	TextEditorOptions,
	UploadHandler,
	Variant,
	ElementSpec,
	NodeDefault,
	MarkDefault,
	MaybePromise,
	NodeTypes,
	MarkTypes,
	ProseMirrorJSON,
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
	LinkMark,
	TextJSON,
	RichJSON
} from '@editable-kit/core';
