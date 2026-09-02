// Code samples for the framework-agnostic core docs. Plain TypeScript — nothing here
// imports a UI framework, which is the point of the section.

export const CORE_INSTALL = `pnpm add @editable-kit/core`;

export const CORE_SURFACE = `import {
  // documents
  text, paragraphs, image, imageAttrs, doc, heading, codeBlock, list, textContent,
  // the field lifecycle
  loadFieldEditor, destroyFieldEditor, getValue,
  // extensions
  importEditor, defaultExtensions, EkImage,
  // view-mode rendering
  nodeDefaults, markDefaults,
  // utilities
  pickFile, debounce
} from '@editable-kit/core';

import type { ProseMirrorJSON, Variant, ElementSpec } from '@editable-kit/core';`;

export const CORE_ADAPTER_SHAPE = `// What an adapter owns, in full:
//
//   1. one element, rendered in both view and edit mode
//   2. view mode  -> walk the document with nodeDefaults / markDefaults
//   3. edit mode  -> loadFieldEditor(), re-create the element, mount() onto it
//   4. teardown   -> destroyFieldEditor(), then discard that element
//
// Core owns none of it. It has no reactivity, no components and no DOM of its own —
// it hands back plain values and one editor controller.`;

export const DOC_HELPERS = `import { text, paragraphs, image, doc, heading, list, codeBlock } from '@editable-kit/core';

text();                       // an empty plain-text document
text('Untitled');             // { type: 'doc', content: [{ type: 'text', text: 'Untitled' }] }

paragraphs();                 // one empty paragraph — the empty rich document
paragraphs('One', 'Two');     // two paragraphs

image();                      // an image field with nothing picked yet
image('/hero.png', { alt: 'Hero', width: 1200, height: 630 });

// doc() composes nodes and other documents into one document
doc(
  heading(2, 'Release notes'),
  paragraphs('Two things changed.', 'Both are small.'),
  list(['Drag handles', 'Code blocks']),
  codeBlock("paragraphs('Edit me')", 'typescript'),
  image('/hero.png', { alt: 'Hero' })
);`;

export const DOC_READING = `import { imageAttrs, textContent } from '@editable-kit/core';

// Reading a stored image outside a field — a thumbnail, an og:image tag
const { src, alt } = imageAttrs(page.hero); // {} if nothing is picked yet

// Plain text of any document or node — a search index, an excerpt, a meta description
textContent(paragraphs('One', 'Two')); // 'One\\nTwo'
textContent(codeBlock('a\\nb'));        // 'a\\nb'
textContent(page.body, ' · ');         // custom block separator`;

export const DOC_TYPES = `import type { ProseMirrorJSON } from '@editable-kit/core';

// One value type for every variant, images included. There is nothing to project
// in or out — what you store is what TipTap's editor.getJSON() returns.
type Page = {
  title: ProseMirrorJSON;
  body: ProseMirrorJSON;
  hero: ProseMirrorJSON;
};`;

export const DOC_AUGMENT = `// types.d.ts — register a node or mark your own extension adds
import type { JSONContent } from '@editable-kit/core';

declare module '@editable-kit/core/types' {
  interface MarkTypes {
    // Declare the entry as a type, not an interface, so it stays
    // assignable to TipTap's JSONContent.
    highlight: { type: 'highlight'; attrs: { color: string } };
  }

  interface NodeTypes {
    callout: { type: 'callout'; attrs: { tone: 'info' | 'warn' }; content?: JSONContent[] };
  }
}`;

export const FIELD_LIFECYCLE = `import { loadFieldEditor, destroyFieldEditor } from '@editable-kit/core';

const opts = {
  variant: 'rich' as const,
  content: page.body,
  ariaLabel: 'Body',
  onchange: (value) => (page.body = value) // fires on blur, not per keystroke
};

// 1. load TipTap and this variant's extensions
const mount = await loadFieldEditor(opts);

// 2. re-create the element you are handing over — ProseMirror takes ownership
//    of its children, so it must be one nothing else will touch again
const fresh = replaceElement(field);

// 3. mount synchronously onto that element (not inside it)
const editor = mount(fresh);

// …later
destroyFieldEditor(editor, opts); // reports the final value, then tears down
fresh.remove();                   // the element is yours to discard`;

export const FIELD_OPTIONS = `type FieldEditorOptions = {
  variant: 'plain' | 'multiline' | 'rich' | 'image';
  content: ProseMirrorJSON;
  options?: TextEditorOptions;
  ariaLabel?: string;
  /** Place the caret where the user clicked. Omit for a keyboard focus. */
  pointer?: { left: number; top: number };
  /** Fires on blur — not per keystroke. */
  onchange?: (value: ProseMirrorJSON) => void;
  onfocus?: (editor: Editor) => void;
};`;

export const FIELD_POINTER = `element.addEventListener('mousedown', async (e) => {
  const mount = await loadFieldEditor({
    variant: 'rich',
    content: page.body,
    // Without this the caret lands at the end of the document rather than
    // under the pointer, and the click reads as if it missed.
    pointer: { left: e.clientX, top: e.clientY },
    onchange: (value) => (page.body = value)
  });

  editor = mount(recreate(element));
});`;

export const FIELD_VANILLA = `import { loadFieldEditor, destroyFieldEditor, text } from '@editable-kit/core';

let value = text('Click to edit');
let editor;

const el = document.querySelector('#title');
el.textContent = value.content?.[0]?.text ?? '';

el.addEventListener('click', async function activate(e) {
  if (editor) return;

  const opts = {
    variant: 'plain',
    content: value,
    pointer: { left: e.clientX, top: e.clientY },
    onchange: (next) => (value = next)
  };

  const mount = await loadFieldEditor(opts);
  editor = mount(el);

  el.addEventListener('blur', () => {
    destroyFieldEditor(editor, opts);
    editor = undefined;
    // ProseMirror replaced this element's children — re-render view mode yourself.
  }, { once: true });
});`;

export const EXT_VARIANTS = `import { defaultExtensions } from '@editable-kit/core';

await defaultExtensions('plain');     // Document (text*), Text, History, Placeholder
await defaultExtensions('multiline'); // + Paragraph, Document is paragraph+
await defaultExtensions('rich');      // + Bold, Italic, Underline, Strike, Link,
                                      //   Heading (1-3), lists, Blockquote, HardBreak
await defaultExtensions('image');     // Document (image?), Text, EkImage, History`;

export const EXT_REPLACE = `// Replaces the variant defaults outright. Pass a promise and it loads in
// parallel with TipTap rather than queueing behind it.
loadFieldEditor({
  variant: 'rich',
  content: page.body,
  options: {
    extensions: import('./my-extensions.js').then((m) => m.extensions)
  }
});`;

export const EXT_EXTEND = `import { defaultExtensions } from '@editable-kit/core';

// Build on the defaults instead of dropping them — still one parallel load.
loadFieldEditor({
  variant: 'rich',
  content: page.body,
  options: {
    extensions: Promise.all([
      defaultExtensions('rich'),
      import('@tiptap/extension-highlight')
    ]).then(([defaults, { Highlight }]) => [...defaults, Highlight])
  }
});`;

export const EXT_OPTIONS = `type TextEditorOptions = {
  /** Replaces the variant defaults outright. */
  extensions?: Extensions | Promise<Extensions>;
  /** Overrides the placeholder without touching the rest of the set. */
  placeholder?: string;
  /** After the Editor is created — full TipTap/ProseMirror access. */
  oncreate?: (editor: Editor) => void;
  ondestroy?: (editor: Editor | null) => void;
  /** ProseMirror EditorProps: DOM attributes, key handlers, paste rules. */
  editorProps?: EditorProps;
};`;

export const EXT_IMAGE_UPLOAD = `import { pickFile } from '@editable-kit/core';
import type { UploadHandler } from '@editable-kit/core';

// Nothing in the library calls an UploadHandler — the flow is yours to build.
const upload: UploadHandler = async (file) => {
  const body = new FormData();
  body.append('file', file);
  const res = await fetch('/api/upload', { method: 'POST', body });
  return (await res.json()).url;
};

async function replaceImage(editor) {
  const file = await pickFile();       // undefined if the dialog was dismissed
  if (!file) return;
  editor.chain().focus().setImage({ src: await upload(file) }).run();
}`;

export const EXT_RENDER_DEFAULTS = `import { nodeDefaults, markDefaults } from '@editable-kit/core';
import type { ElementSpec } from '@editable-kit/core';

nodeDefaults.paragraph({ type: 'paragraph' });        // { tag: 'p' }
nodeDefaults.heading({ type: 'heading', attrs: { level: 2 } }); // { tag: 'h2' }
markDefaults.bold({ type: 'bold' });                  // { tag: 'strong' }

// This table is the renderer's configuration. Supporting an extension that maps
// cleanly to one element is one entry; anything that doesn't is the adapter's
// override mechanism. A null spec renders the children bare.
nodeDefaults.callout = (node): ElementSpec => ({
  tag: 'aside',
  attrs: { 'data-tone': node.attrs?.tone }
});`;
