# editable-kit (monorepo)

Inline editing for Svelte 5 — plain text, rich text (TipTap), and images with cropping.

## Packages

| Path                    | Package                    | Description                                                                   |
| ----------------------- | -------------------------- | ----------------------------------------------------------------------------- |
| `packages/editable-kit` | `editable-kit`             | The published Svelte 5 component library + its docs/demo site (GitHub Pages). |
| `packages/cloudflare`   | `@editable-kit/cloudflare` | Default Cloudflare integrations (Workers, R2, …). Scaffold.                   |
| `examples/basic-auth`   | `basic-auth`               | Example app.                                                                  |

## Commands (run from repo root)

- `pnpm dev` — run the docs/demo app (from `packages/editable-kit`)
- `pnpm build` — build all packages (topological)
- `pnpm --filter editable-kit build:site` — build the static docs site (what GitHub Pages deploys)
- `pnpm package` — package the library only
- `pnpm check` — type-check all packages
- `pnpm test` — run library tests
- `pnpm lint` / `pnpm format` — Prettier across the workspace

Package manager is **pnpm**. See `packages/editable-kit/README.md` for library usage.
