export type { _TiptapCommands } from './tiptap-commands.js';

// ── Default-content helpers ──
export { text, paragraphs, image, imageAttrs } from './doc.js';

// ── Editor ──
export { importEditor } from './editor/index.js';
export { resolveExtensions } from './editor/resolve-extensions.js';
export { EkImage } from './editor/image-extension.js';
export type { TextEditorOptions, UploadHandler, Variant } from './editor/types.js';

// ── Field lifecycle ──
export { loadFieldEditor, destroyFieldEditor, getValue } from './field-editor.js';
export type { FieldEditorOptions, MountFieldEditor, Pointer } from './field-editor.js';

// ── Rendering ──
export { nodeDefaults, markDefaults } from './render-defaults.js';
export type { ElementSpec, NodeDefault, MarkDefault } from './render-defaults.js';

// ── Utilities ──
export { pickFile } from './pick-file.js';
export { debounce } from './debounce.js';

// ── Core types ──
export type { MaybePromise } from './types.js';

// ── ProseMirror JSON types ──
export type {
	/** Augment these from `'@editable-kit/core/types'` to register your own nodes and marks. */
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
} from './prosemirror.js';

// Type alias exports
export type TextJSON = import('./prosemirror.js').ProseMirrorJSON;
export type RichJSON = import('./prosemirror.js').ProseMirrorJSON;
