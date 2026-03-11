export type { _TiptapCommands } from './tiptap-commands.js';

// ── Editable context components ──
export { default as Root } from './components/editable/editable.svelte';
export { default as Data } from './components/editable/editable-data.svelte';
export { default as Each } from './components/editable/editable-each.svelte';
export {
	EditableState,
	type EditableCommand
} from './components/editable/editable-state.svelte.js';
export type { SaveStatus } from './components/editable/editable-context.svelte.js';
export type { SaveResult } from './components/editable/types.js';

// ── Standalone editor components ──
export { PlainText, MultilineText, RichText, EditableImage } from './components/editors/index.js';

// ── Renderer ──
export { Renderer } from './components/renderer/index.js';
export type {
	NodeOverrides,
	NodeOverrideSnippets,
	MarkOverrideSnippets
} from './components/renderer/types.js';

// ── Editor types ──
export type { TextEditorOptions, EditorContent } from './components/editor/types.js';

// ── Core types ──
export type {
	Editable,
	EditorData,
	EditorSaveData,
	MaybePromise,
	ImageState,
	JSONKeys,
	ImageKeys
} from './types.js';

// ── ProseMirror JSON types ──
export type {
	ProseMirrorJSON,
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
	InlineNode,
	BlockNode,
	DocNode,
	BoldMark,
	ItalicMark,
	UnderlineMark,
	StrikeMark,
	LinkMark
} from './types/prosemirror.js';
