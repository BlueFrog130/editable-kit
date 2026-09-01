<p align="center">
  <h1 align="center">@editable-kit/svelte</h1>
  <p align="center">
    Inline editing components for Svelte 5 — text, rich text, and images.
  </p>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@editable-kit/svelte"><img src="https://img.shields.io/npm/v/%40editable-kit%2Fsvelte?color=%23f43f5e&label=npm" alt="npm version"></a>
  <a href="https://github.com/BlueFrog130/editable-kit/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/%40editable-kit%2Fsvelte?color=%234f46e5" alt="license"></a>
  <a href="https://www.npmjs.com/package/@editable-kit/svelte"><img src="https://img.shields.io/npm/dm/%40editable-kit%2Fsvelte?color=%2310b981" alt="downloads"></a>
  <img src="https://img.shields.io/badge/svelte-5-ff3e00" alt="Svelte 5">
</p>

<p align="center">
  <a href="https://bluefrog130.github.io/editable-kit/">Live Demo</a> · <a href="https://github.com/BlueFrog130/editable-kit">GitHub</a> · <a href="https://www.npmjs.com/package/@editable-kit/svelte">npm</a>
</p>

---

Turn any Svelte 5 page into an editable CMS-like experience. Bind a field at the property it edits — `<Editable.Text bind:value={post.title} />` — and your users can edit text, rich content, and images inline. No separate admin panel, no preview iframe, no side panel.

**It is not a CMS.** There is no content lake, no hosted backend, no GraphQL layer — you own the data and the storage. Unlike visual editors that overlay your site in an iframe, editing happens on the real page: the editor mounts onto the very element that rendered your content, so the editable view and the published view are the same DOM.

## Features

- **Plain text editing** — Single-line and multiline `contenteditable` fields
- **Rich text editing** — Full WYSIWYG powered by [TipTap](https://tiptap.dev/) (bold, italic, headings, links, lists, blockquotes, and more)
- **Image editing** — Replace and re-describe images through TipTap's image node
- **No layout shift** — TipTap mounts onto the already-rendered element instead of injecting its own, so toggling edit mode adds no box and changes no CSS selector match
- **Type-safe** — The binding _is_ the type check: there are no string selectors to get wrong
- **Zero editor code in view mode** — TipTap loads only when a field is actually focused, not when editing is switched on
- **Bring your own toolbar** — `EditableState` exposes reactive commands; the chrome is yours to design
- **Svelte 5 runes** — Built entirely with `$state`, `$derived`, `$effect`, and snippets
- **ProseMirror JSON renderer** — Render saved rich text content without loading the editor

## Installation

```bash
pnpm add @editable-kit/svelte
```

```bash
npm install @editable-kit/svelte
```

```bash
yarn add @editable-kit/svelte
```

> **Peer dependency:** `svelte ^5.0.0`

## Quick Start

```svelte
<script lang="ts">
	import * as Editable from '@editable-kit/svelte';
	import type { ProseMirrorJSON } from '@editable-kit/svelte';

	// Every field stores a ProseMirror document, images included.
	type PageData = {
		title: ProseMirrorJSON;
		body: ProseMirrorJSON;
		image: ProseMirrorJSON;
	};

	let data: PageData = $state({} as PageData); // your data here
	let editing = $state(false);

	// `saved` is a plain snapshot of `data` — already flushed, ready to serialize.
	async function handleSave(saved: PageData) {
		await fetch('/api/page', { method: 'PUT', body: JSON.stringify(saved) });
		editing = false;
	}
</script>

<button onclick={() => (editing = !editing)}>
	{editing ? 'Cancel' : 'Edit'}
</button>

<Editable.Root bind:data {editing} onsave={handleSave}>
	{#snippet children({ save, reset, dirty })}
		<h1><Editable.Text bind:value={data.title} /></h1>
		<div><Editable.Rich bind:value={data.body} /></div>
		<Editable.Image bind:value={data.image} />

		{#if editing}
			<button onclick={save} disabled={!dirty}>Save</button>
			<button onclick={reset}>Discard</button>
		{/if}
	{/snippet}
</Editable.Root>
```

## Core Concepts

### Fields

Four components, one job each. Every one takes `bind:value` pointed straight at the property it
edits — no wrapper component, no key, no string selector.

| Component            | Document holds                     | Description                                 |
| -------------------- | ---------------------------------- | ------------------------------------------- |
| `Editable.Text`      | bare inline text                   | Single-line plain text                      |
| `Editable.Multiline` | paragraphs                         | Multiple paragraphs, no formatting marks    |
| `Editable.Rich`      | paragraphs, headings, lists, marks | Full rich text                              |
| `Editable.Image`     | one `image` node                   | A single image, pointed at a URL you supply |

Every variant's `value` is a `ProseMirrorJSON` document — an image field holds a document with a
single `image` node, which is what TipTap keeps internally. Nothing is projected in or out, so the
attributes the editor tracks (`title`, intrinsic `width`/`height`) survive a round trip instead of
being flattened to `{ src, alt }`.

```svelte
<h1><Editable.Text bind:value={post.title} /></h1>
<article><Editable.Rich bind:value={post.body} /></article>
<Editable.Image bind:value={post.cover} />
```

A field works on its own — pass it `editing` and you are done. `Editable.Field` is the same
component with an explicit `variant` prop, for when the variant is chosen at runtime.

### Editable.Root

Optional, and the only wrapper there is. It gives every field beneath it shared editing state: one
`editing` flag, one toolbar, one `save()`, one `reset()`, one `dirty`.

```svelte
<Editable.Root bind:data {editing} onsave={handleSave}>
	{#snippet children({ state, save, reset, dirty, saveStatus })}
		<!-- your editable content -->
	{/snippet}
</Editable.Root>
```

| Prop         | Description                                                             |
| ------------ | ----------------------------------------------------------------------- |
| `editing`    | Toggles editing for every field inside                                  |
| `data?`      | Bindable. Supply it to get `reset()` and to have it handed to `onsave`  |
| `overrides?` | Default renderer overrides for every field inside                       |
| `onsave?`    | `(data: T) => MaybePromise<void>` — receives a plain snapshot of `data` |

### Saving

There is no save payload type. Fields write into the object you bound, so persisting is just
"save the object you already have":

```ts
async function handleSave(saved: PageData) {
	await db.save(saved); // already current
}
```

> **Text fields sync on blur, not per keystroke.** Reading your data while a field is focused gives
> its value as of the last blur — a deliberate trade, so typing costs nothing. `save()` flushes the
> focused field before `onsave` runs, so what you persist is always current.

`dirty` compares values rather than focus events, so a field that mounts and unmounts untouched does
not flag the form. `reset()` restores the snapshot `Root` took when editing turned on. A failed save
leaves `dirty` set and keeps the user in editing mode, so nothing is lost.

### Images

An image field is a document holding one `image` node, and its `src` is whatever URL you put
there. There is no built-in picker, no cropper, and no format conversion — the file you upload is
the file that gets served. Focusing the field selects its image node, so toolbar commands apply to
it; build the replace flow yourself with `pickFile()`, your upload, and `setImage`.

```ts
import { pickFile } from '@editable-kit/svelte';

async function replaceImage(state: EditableState) {
	const file = await pickFile();
	if (!file) return;

	const res = await fetch('/api/upload', { method: 'POST', body: file });
	const { url } = await res.json();

	state.run((editor) => editor.chain().focus().setImage({ src: url }).run());
}
```

Store `width`/`height` when you have them — `image('/hero.jpg', { width, height })`. The renderer
emits them, so images reserve their space before loading. Resize, crop, or re-encode in your upload
handler (or at your CDN) if you want that — the field does none of it.

An empty image field has no image to give it a box, so it renders a dashed placeholder you can size
and colour with `--ek-image-placeholder-height`, `--ek-image-placeholder-background`,
`--ek-image-placeholder-radius`, and `--ek-placeholder-color`.

### Default content

`text()` and `paragraphs()` build the two document shapes the fields expect, so a factory for a new
list item is a one-liner. Both get the empty case right — a hand-written `{ type: 'text', text: '' }`
is rejected by ProseMirror, and only once the editor mounts.

```ts
import { text, paragraphs, image } from '@editable-kit/svelte';

text('Untitled'); //  a Text field's document
text(); //            empty
paragraphs('First', 'Second'); // one paragraph each, for Multiline / Rich
paragraphs(); //      one empty paragraph
image('/hero.jpg', { alt: 'Hero', width: 1200, height: 675 }); // an Image field's document
image(); //           empty, nothing picked yet

function newNote(): Note {
	return { title: text('Untitled'), body: paragraphs(), image: image() };
}
```

Reading a stored image back outside a field — a thumbnail, an `og:image` tag — is `imageAttrs()`:

```ts
import { imageAttrs } from '@editable-kit/svelte';

const { src, alt } = imageAttrs(post.cover);
```

### Arrays

An ordinary `{#each}`. Key by item identity, not index, so reordering or removing a row keeps every
editor bound to the right record.

```svelte
{#each posts as post (post)}
	<article>
		<Editable.Text bind:value={post.title} />
		<Editable.Rich bind:value={post.body} />
	</article>
{/each}
```

### Renderer

Render ProseMirror JSON as HTML without loading the editor — perfect for read-only views and SSR.

```svelte
<script>
	import { Renderer } from '@editable-kit/svelte/renderer';
</script>

<Renderer doc={data.body} />
```

### Custom extensions

Add a TipTap extension through `options.extensions` and its nodes end up in the document. They still
render — an unknown node renders its children, and you can give it a snippet through `overrides` —
but that snippet receives TipTap's loose `JSONContent`. Register the type to get your own instead:

```ts
// src/app.d.ts — or any module file in your project
import type { PMNode } from '@editable-kit/svelte';

type CalloutNode = { type: 'callout'; attrs: { tone: 'info' | 'warn' }; content?: PMNode[] };

declare module '@editable-kit/core/types' {
	interface NodeTypes {
		callout: CalloutNode;
	}
	interface MarkTypes {
		highlight: { type: 'highlight'; attrs: { color: string } };
	}
}
```

`overrides.nodes.callout` is now typed with `CalloutNode`, and `PMNode` — every `content` array, and
any document you hand-author — includes it. Two rules: key the entry by the extension's `name`, since
that is what TipTap writes into the document and what the renderer looks up; and declare the node as
a `type`, not an `interface`, so it stays assignable to TipTap's `JSONContent`.

Registering a type does not render it. A node that maps cleanly to one element is an entry in
`nodeDefaults` / `markDefaults`:

```ts
import { nodeDefaults } from '@editable-kit/svelte';

nodeDefaults.callout = (node) => ({ tag: 'aside', attrs: { 'data-tone': node.attrs?.tone } });
```

Anything else is a snippet in `overrides`, set per field or once on `Root`.

## Styling

Every field renders one element in both modes — `[data-ek-field]`, a `<span>` for `text` and a `<div>` otherwise. That element is the contenteditable once an editor mounts, so put your classes on it (via the field's `class`, or by styling `[data-ek-field]`) rather than on a wrapper around it. Because the element is identical whether or not you are editing, `.prose > :first-child`-style selectors keep matching the same thing and nothing moves.

## Exports

```ts
// Main entry — everything
import * as Editable from '@editable-kit/svelte';
import {
	Root,
	Text,
	Multiline,
	Rich,
	Image,
	Field,
	EditableState,
	Renderer
} from '@editable-kit/svelte';
import { text, paragraphs, image, imageAttrs } from '@editable-kit/svelte'; // document helpers

// Read-only renderer, without pulling in the editor components
import { Renderer } from '@editable-kit/svelte/renderer';

// The node/mark type registries, to augment for your own extensions
declare module '@editable-kit/core/types' {
	/* interface NodeTypes { ... } */
}
```

## Development

This package lives in the [editable-kit monorepo](https://github.com/BlueFrog130/editable-kit) —
clone it and run `pnpm install`, then `pnpm dev` for the docs site.

## License

[MIT](https://github.com/BlueFrog130/editable-kit/blob/main/LICENSE) — Made by [BlueFrog130](https://github.com/BlueFrog130)
