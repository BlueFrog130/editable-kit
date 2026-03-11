<p align="center">
  <h1 align="center">editable-kit</h1>
  <p align="center">
    Inline editing components for Svelte 5 — text, rich text, and images with cropping.
  </p>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/editable-kit"><img src="https://img.shields.io/npm/v/editable-kit?color=%23f43f5e&label=npm" alt="npm version"></a>
  <a href="https://github.com/BlueFrog130/editable-kit/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/editable-kit?color=%234f46e5" alt="license"></a>
  <a href="https://www.npmjs.com/package/editable-kit"><img src="https://img.shields.io/npm/dm/editable-kit?color=%2310b981" alt="downloads"></a>
  <img src="https://img.shields.io/badge/svelte-5-ff3e00" alt="Svelte 5">
</p>

---

Turn any Svelte 5 page into an editable CMS-like experience. Drop in `<Editable.Root>` and `<Editable.Data>`, and your users can edit text, rich content, and images inline — no separate admin panel needed.

## Features

- **Plain text editing** — Single-line and multiline `contenteditable` fields
- **Rich text editing** — Full WYSIWYG powered by [TipTap](https://tiptap.dev/) (bold, italic, headings, links, lists, blockquotes, and more)
- **Image editing** — Pan/zoom cropping with WebP export via `OffscreenCanvas`
- **Floating toolbar** — Context-aware formatting toolbar that appears on selection
- **Type-safe** — Generic `Editable.Data<T>` enforces correct property selectors at the snippet level
- **Lazy-loaded** — TipTap and the toolbar are dynamically imported to minimize bundle size
- **Svelte 5 runes** — Built entirely with `$state`, `$derived`, `$effect`, and snippets
- **ProseMirror JSON renderer** — Render saved rich text content without loading the editor

## Installation

```bash
pnpm add editable-kit
```

```bash
npm install editable-kit
```

```bash
yarn add editable-kit
```

> **Peer dependency:** `svelte ^5.0.0`

## Quick Start

```svelte
<script lang="ts">
	import * as Editable from 'editable-kit';
	import type { ProseMirrorJSON, ImageState } from 'editable-kit';

	type PageData = {
		title: ProseMirrorJSON;
		body: ProseMirrorJSON;
		image: ImageState;
	};

	let data: PageData = $state({} as PageData); // your data here
	let editing = $state(false);

	async function handleSave(allData) {
		const page = allData.get('page');
		if (page) {
			// Send to your API, save to IndexedDB, etc.
			console.log(page.title, page.body, page.image);
		}
		editing = false;
	}
</script>

<button onclick={() => (editing = !editing)}>
	{editing ? 'Cancel' : 'Edit'}
</button>

<Editable.Root {editing} onsave={handleSave}>
	{#snippet children({ state, save, editing })}
		<Editable.Data key="page" {data}>
			{#snippet children({ text, rich, image })}
				<h1>{@render text('title')}</h1>
				<div>{@render rich('body')}</div>
				{@render image('image', { maxWidth: 800, maxHeight: 500, quality: 0.85 })}
			{/snippet}
		</Editable.Data>

		{#if editing}
			<button onclick={save}>Save</button>
		{/if}
	{/snippet}
</Editable.Root>
```

## Core Concepts

### Editable.Root

The root context provider. Controls whether editing is enabled and coordinates save operations across all nested `Editable.Data` components.

```svelte
<Editable.Root {editing} onsave={handleSave}>
	{#snippet children({ state, save })}
		<!-- your editable content -->
	{/snippet}
</Editable.Root>
```

### Editable.Data

Wraps a data object and exposes typed snippet renderers for each field. The `key` prop identifies this data group when saving.

```svelte
<Editable.Data key="hero" {data}>
	{#snippet children({ text, rich, image })}
		{@render text('title')}
		{@render rich('description')}
		{@render image('cover', { maxWidth: 1200, quality: 0.9 })}
	{/snippet}
</Editable.Data>
```

### Editable.Each

Render arrays of editable items with full type safety.

```svelte
<Editable.Each key="posts" items={posts}>
	{#snippet children({ text, rich, image }, item, index)}
		<article>
			{@render text('title')}
			{@render rich('body')}
		</article>
	{/snippet}
</Editable.Each>
```

### Renderer

Render ProseMirror JSON as HTML without loading the editor — perfect for read-only views and SSR.

```svelte
<script>
	import { Renderer } from 'editable-kit/renderer';
</script>

<Renderer content={data.body} />
```

## Editor Types

| Snippet | Data Type         | Description                                  |
| ------- | ----------------- | -------------------------------------------- |
| `text`  | `ProseMirrorJSON` | Single-line plain text                       |
| `rich`  | `ProseMirrorJSON` | Full rich text with formatting toolbar       |
| `image` | `ImageState`      | Image with pan/zoom cropping and WebP export |

## Exports

```ts
// Main entry — context components + types
import * as Editable from 'editable-kit';
import { Root, Data, Each, EditableState, Renderer } from 'editable-kit';

// Standalone editors (for advanced use)
import { PlainText, MultilineText, RichText, EditableImage } from 'editable-kit/editors';

// Read-only renderer
import { Renderer } from 'editable-kit/renderer';
```

## Development

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server
pnpm build            # Build app + library
pnpm package          # Package library only
pnpm check            # Type check
pnpm test             # Run tests
pnpm lint             # Check formatting
pnpm format           # Auto-format
```

## License

[MIT](LICENSE) — Made by [BlueFrog130](https://github.com/BlueFrog130)
