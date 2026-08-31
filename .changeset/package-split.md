---
'@editable-kit/adapter-cloudflare': major
'@editable-kit/svelte': major
'@editable-kit/core': major
---

Split the library into three packages so it can support more than one UI framework.

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
