# editable-kit (monorepo)

Inline editing — plain text, rich text (TipTap), and images. The editor mounts onto the element
that already rendered your content, so edit mode adds no box.

## Packages

| Path                          | Package                            | Description                                                                                             |
| ----------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `packages/core`               | `@editable-kit/core`               | Framework-agnostic: document types, TipTap extension sets, the field editor lifecycle. No UI framework. |
| `packages/svelte`             | `@editable-kit/svelte`             | The Svelte 5 components + the docs/demo site (GitHub Pages). Re-exports all of core.                    |
| `packages/editable-kit`       | `editable-kit`                     | Deprecated. Re-exports `@editable-kit/svelte` so existing installs keep working.                        |
| `examples/basic-auth`         | `basic-auth`                       | Example app — session auth, local disk storage.                                                         |
| `examples/cloudflare`         | `cloudflare-example`               | Example app — Workers, content and images in R2.                                                        |

Everything framework-agnostic lives in `core`; only `svelte` depends on a UI framework. The graph
is a line:

```
@editable-kit/core ──> @editable-kit/svelte
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

## Releasing

Changesets, unchanged by the split. `core` and `svelte` are `linked` in `.changeset/config.json`, so
they always carry the same version.

```bash
pnpm changeset      # describe the change, pick the packages
git commit && push  # merge to main
```

The Release workflow opens a "Version Packages" PR. Merging it runs `pnpm release`
(`build:packages && changeset publish`), which publishes whatever versions are not yet on npm and
pushes the git tags.

Two mechanisms do work at pack time, so what you publish is not what sits in the repo:

- `publishConfig.exports` in `core` swaps the source-resolved `exports` for compiled `dist`.
  Consumers never receive TypeScript.
- `workspace:^` and `catalog:` are replaced with real semver ranges.

Verify either with `pnpm pack` in the package directory and reading the `package.json` inside the
tarball — that is exactly what npm would receive.

### First release only

The scoped packages have never been published, so this run needs a few things the steady
state does not:

1. **npm auth.** `.github/workflows/publish.yml` sets `id-token: write` and a `publish`
   environment but passes no `NODE_AUTH_TOKEN`, which means it is set up for npm
   [trusted publishing](https://docs.npmjs.com/trusted-publishers) rather than a token. Trusted
   publishing is configured **per package on npmjs.com and the package has to exist first**, so
   either publish each package once by hand, or add an `NPM_TOKEN` secret and
   `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}` to that step for the first run.
2. **Scope access.** `"access": "public"` is already set in the changesets config, which is what
   keeps scoped packages from defaulting to private.
3. **The deprecated shim is not published by CI.** `editable-kit` is in the changesets `ignore`
   list, and `ignore` skips publishing, not just versioning. Publish it once by hand, after
   `@editable-kit/svelte` is on npm so its `workspace:^` range resolves to a real version:

   ```bash
   pnpm --filter editable-kit publish --access public
   npm deprecate editable-kit "renamed to @editable-kit/svelte"
   ```

   It stays at 1.0.0 and depends on `@editable-kit/svelte@^1.0.0`, so it keeps working across the
   whole 1.x line without being republished. It will not follow a 2.0 — retire it then.

## Commands (run from repo root)

- `pnpm dev` — run the docs/demo app (from `packages/svelte`)
- `pnpm build` — build every package (topological)
- `pnpm build:site` — build the static docs site (what GitHub Pages deploys)
- `pnpm package` — package the Svelte library only
- `pnpm check` — type-check every package and example
- `pnpm test` — run every package's tests
- `pnpm lint` / `pnpm format` — oxlint + oxfmt across the workspace

`core` resolves to TypeScript source inside the workspace, so editing it hot-reloads into
`pnpm dev` with no build step; `publishConfig.exports` swaps in compiled `dist` when pnpm packs, so
consumers never receive TypeScript. Apps consuming it from the workspace need `ssr.noExternal` and
`server.fs.allow` in their Vite config — see the examples.

Package manager is **pnpm**. Every `@tiptap/*` version is pinned once in the `catalog:` block of
`pnpm-workspace.yaml` — a split peer resolution gives you two copies of `@tiptap/core`, and TipTap's
command augmentations only land on one of them.

See `packages/svelte/README.md` for library usage.
