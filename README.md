# editable-kit (monorepo)

Inline editing — plain text, rich text (TipTap), and images. The editor mounts onto the element
that already rendered your content, so edit mode adds no box.

## Packages

| Path                          | Package                            | Description                                                                                             |
| ----------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `packages/core`               | `@editable-kit/core`               | Framework-agnostic: document types, TipTap extension sets, the field editor lifecycle. No UI framework. |
| `packages/svelte`             | `@editable-kit/svelte`             | The Svelte 5 components + the docs/demo site (GitHub Pages). Re-exports all of core.                    |
| `packages/adapter-cloudflare` | `@editable-kit/adapter-cloudflare` | D1 content records, content-addressed R2 assets, web-standard `Request`/`Response` handlers.            |
| `packages/editable-kit`       | `editable-kit`                     | Deprecated. Re-exports `@editable-kit/svelte` so existing installs keep working.                        |
| `examples/basic-auth`         | `basic-auth`                       | Example app — session auth, local disk storage.                                                         |
| `examples/cloudflare`         | `cloudflare-example`               | Example app — Workers, D1, R2.                                                                          |

Everything framework-agnostic lives in `core`; only `svelte` depends on a UI framework, and
`adapter-cloudflare` depends on neither. The graph is a line:

```
@editable-kit/core ──> @editable-kit/svelte        @editable-kit/adapter-cloudflare
```

If you are building a Svelte app, install `@editable-kit/svelte` — it pulls core in and re-exports
it, so you never import core directly. The one exception is registering your own node and mark
types, which has to name the module that declares them:

```ts
declare module '@editable-kit/core/types' {
	interface NodeTypes {
		callout: { type: 'callout'; attrs: { tone: 'info' | 'warn' }; content?: PMNode[] };
	}
}
```

## Commands (run from repo root)

- `pnpm dev` — run the docs/demo app (from `packages/svelte`)
- `pnpm build` — build every package (topological)
- `pnpm build:site` — build the static docs site (what GitHub Pages deploys)
- `pnpm package` — package the Svelte library only
- `pnpm check` — type-check every package and example
- `pnpm test` — run every package's tests
- `pnpm lint` / `pnpm format` — oxlint + oxfmt across the workspace

`core` and `adapter-cloudflare` resolve to TypeScript source inside the workspace, so editing them
hot-reloads into `pnpm dev` with no build step; `publishConfig.exports` swaps in compiled `dist`
when pnpm packs, so consumers never receive TypeScript. Apps consuming them from the workspace need
`ssr.noExternal` and `server.fs.allow` in their Vite config — see the examples.

Package manager is **pnpm**. Every `@tiptap/*` version is pinned once in the `catalog:` block of
`pnpm-workspace.yaml` — a split peer resolution gives you two copies of `@tiptap/core`, and TipTap's
command augmentations only land on one of them.

See `packages/svelte/README.md` for library usage.
