---
'@editable-kit/svelte': major
'@editable-kit/core': major
---

Bind fields straight at your data. `Editable.Data` and `Editable.Each` are gone, and with them the
`key` prop, the snippet selectors, and the save-payload types.

**Before**

```svelte
<Editable.Root {editing} onsave={handleSave}>
	{#snippet children({ save })}
		<Editable.Data key="page" {data} upload={uploadImage}>
			{#snippet children({ text, rich, image })}
				<h1>{@render text('title')}</h1>
				<div>{@render rich('body')}</div>
				{@render image('cover')}
			{/snippet}
		</Editable.Data>
	{/snippet}
</Editable.Root>
```

**After**

```svelte
<Editable.Root bind:data {editing} upload={uploadImage} onsave={handleSave}>
	{#snippet children({ save, reset, dirty })}
		<h1><Editable.Text bind:value={data.title} /></h1>
		<div><Editable.Rich bind:value={data.body} /></div>
		<Editable.Image bind:value={data.cover} />
	{/snippet}
</Editable.Root>
```

### Breaking

- **Removed** `Editable.Data` and `Editable.Each`. Bind fields directly; arrays are an ordinary
  `{#each}` keyed by item identity.
- **Renamed** the field components: `PlainText` → `Text`, `MultilineText` → `Multiline`,
  `RichText` → `Rich`, `EditableImage` → `Image`, `EditableField` → `Field`. All are exported from
  the package root.
- **Removed** the `editable-kit/editable` and `editable-kit/editors` subpath exports. Import from
  `@editable-kit/svelte`; `@editable-kit/svelte/renderer` still exists.
- **Removed** the `key` prop from every component.
- **Changed** `Root`'s `onsave` from `(data: SaveResult) => …` to `(data: T) => …`, where `T` is
  whatever you bound to `Root`'s new `data` prop. It receives a plain snapshot, already flushed.
- **Removed** the types `SaveResult`, `EditorContent`, `EditorSaveData`, `EditorData`, `JSONKeys`
  and `ImageKeys`.
- **Changed** image fields to store a ProseMirror document like every other variant, instead of
  `{ src, alt }`. An image value is now `{ type: 'doc', content: [{ type: 'image', attrs: {…} }] }`
  — TipTap's own shape. `ImageState` and `FieldValue` are gone; every field's value is a
  `ProseMirrorJSON`. Migrate stored data with `image(src, { alt })`, and read it back outside a
  field with `imageAttrs(doc)`.

### Added

- `Root` takes bindable `data`, plus `upload` and `overrides` defaults that every field inside
  inherits.
- `reset()` on `Root`'s children snippet discards every edit made since editing was switched on.
- `dirty` on `Root`'s children snippet, computed by comparing values rather than focus events, so a
  field that mounts and unmounts untouched does not flag the form.
- `text()`, `paragraphs()` and `image()` build each variant's document shape, so a factory for a
  new list item is a one-liner. They also get the empty cases right, which a hand-written
  `{ type: 'text', text: '' }` does not — ProseMirror rejects empty text nodes, and only once the
  editor mounts.
- `imageAttrs(doc)` reads an image document's attributes, for using a stored image outside a
  field — a thumbnail, an `og:image` tag.

### Fixed

- Clicking an image field no longer makes it disappear. The image extension set was missing
  ProseMirror's required `text` node type, so building its schema threw on first focus.
- Image fields render through the same `Renderer` as every other variant in view mode, so intrinsic
  `width`/`height` reach the `<img>`. The hand-rolled `<img>` they used to get dropped both, which
  cost the layout-shift guarantee on the variant that needs it most.
