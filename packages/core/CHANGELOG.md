# @editable-kit/core

## 1.0.0

### Major Changes

- [#17](https://github.com/BlueFrog130/editable-kit/pull/17) [`3071a55`](https://github.com/BlueFrog130/editable-kit/commit/3071a55c3b22045917c13c5ccdb2c768f774f491) Thanks [@BlueFrog130](https://github.com/BlueFrog130)! - Bind fields straight at your data. `Editable.Data` and `Editable.Each` are gone, and with them the
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

- [#17](https://github.com/BlueFrog130/editable-kit/pull/17) [`15b0743`](https://github.com/BlueFrog130/editable-kit/commit/15b0743a7cbb559535f35bdbe24be03477d485eb) Thanks [@BlueFrog130](https://github.com/BlueFrog130)! - Split the library into three packages so it can support more than one UI framework.

  | Before                                                    | After                                             |
  | --------------------------------------------------------- | ------------------------------------------------- |
  | `import … from 'editable-kit'`                            | `import … from '@editable-kit/svelte'`            |
  | `import … from 'editable-kit/renderer'`                   | `import … from '@editable-kit/svelte/renderer'`   |
  | `import type … from 'editable-kit/types'`                 | `import type … from '@editable-kit/core'`         |
  | `declare module 'editable-kit' { interface NodeTypes … }` | `declare module '@editable-kit/core/types' { … }` |
  | `@editable-kit/cloudflare`                                | `@editable-kit/adapter-cloudflare`                |

  `editable-kit` stays on npm as a deprecated re-export of `@editable-kit/svelte`. Import from one
  name or the other, never both — two specifiers means two copies of the components.

  Module augmentation is the one thing re-exporting cannot forward: `declare module` has to name the
  module that _declares_ the interface, which is now `@editable-kit/core/types`.

  ### `@editable-kit/core`

  Framework-agnostic, depends on TipTap and nothing else. Holds the ProseMirror document types,
  `text()` / `paragraphs()` / `image()` / `imageAttrs()`, the per-variant TipTap extension sets and
  their lazy loader, `pickFile()`, the node/mark → element table the renderer walks, and
  `loadFieldEditor()` — the lifecycle that mounts TipTap **onto** an existing element rather than
  inside it, which is what makes switching to edit mode add no box.

  Reactivity is deliberately not in core. `EditableState` and `EditableContext` stay in
  `@editable-kit/svelte` as runes classes; another framework brings its own, rather than everyone
  paying for a signal abstraction.

  ### `@editable-kit/adapter-cloudflare`

  `assetRoutes` and `contentRoutes` are now web-standard `(Request, ctx) => Promise<Response>`
  handlers with no `@sveltejs/kit` dependency, so they run in a bare Worker, Hono, or SvelteKit
  alike. The route key comes from `ctx.params.key` when your framework parsed one, else the URL's
  last path segment; bindings reach your resolver through `ctx.env`.

  ```ts
  // src/routes/assets/[key]/+server.ts
  const asset = assetRoutes<App.Platform['env']>((_request, ctx) => ({ bucket: ctx.env!.BUCKET }));
  export const GET = (event) => asset.GET(event.request, fromSvelteKit(event));
  ```

  `error()` from SvelteKit is replaced by an exported `HttpError`, and `onContentChange` /
  `Authorize` / `deployHook` take `(request, ctx)` instead of a `RequestEvent`.
