<p align="center">
  <h1 align="center">editable-kit</h1>
  <p align="center">
    Inline editing for your real pages — text, rich text, and images. No admin panel, no iframe, no layout shift.
  </p>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@editable-kit/svelte"><img src="https://img.shields.io/npm/v/%40editable-kit%2Fsvelte?color=%23f43f5e&label=npm" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/@editable-kit/svelte"><img src="https://img.shields.io/npm/dm/%40editable-kit%2Fsvelte?color=%2310b981" alt="monthly downloads"></a>
  <a href="https://www.npmjs.com/package/@editable-kit/svelte"><img src="https://img.shields.io/npm/dt/%40editable-kit%2Fsvelte?color=%2310b981&label=total%20downloads" alt="total downloads"></a>
  <a href="https://bundlephobia.com/package/@editable-kit/svelte"><img src="https://img.shields.io/bundlephobia/minzip/%40editable-kit%2Fsvelte?label=min%2Bgzip" alt="bundle size"></a>
  <a href="https://github.com/BlueFrog130/editable-kit/actions/workflows/ci.yml"><img src="https://github.com/BlueFrog130/editable-kit/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://github.com/BlueFrog130/editable-kit/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/%40editable-kit%2Fsvelte?color=%234f46e5" alt="license"></a>
  <a href="https://github.com/BlueFrog130/editable-kit/stargazers"><img src="https://img.shields.io/github/stars/BlueFrog130/editable-kit?style=flat&color=%23eab308" alt="GitHub stars"></a>
  <img src="https://img.shields.io/badge/svelte-5-ff3e00" alt="Svelte 5">
  <img src="https://img.shields.io/badge/types-TypeScript-3178c6" alt="TypeScript">
</p>

<p align="center">
  <a href="https://bluefrog130.github.io/editable-kit/"><strong>Live Demo</strong></a> ·
  <a href="https://bluefrog130.github.io/editable-kit/docs"><strong>Documentation</strong></a> ·
  <a href="https://www.npmjs.com/package/@editable-kit/svelte">npm</a>
</p>

---

Turn any page into an editable, CMS-like experience. Point a field at the property it edits —
`<Editable.Text bind:value={post.title} />` — and your users edit text, rich content, and images
right where they read them.

**It is not a CMS.** No content lake, no hosted backend, no GraphQL layer — you own the data and
the storage. And unlike visual editors that overlay your site in an iframe, the editor mounts onto
the very element that rendered your content, so the editable view and the published view are the
same DOM.

## Features

- **No layout shift** — TipTap mounts onto the already-rendered element; edit mode adds no box
- **Rich text** — full WYSIWYG powered by [TipTap](https://tiptap.dev/): headings, lists, links, marks
- **Plain text & images** — single-line, multiline, and image fields
- **Type-safe** — `bind:value` _is_ the type check; no string selectors to get wrong
- **Zero editor code in view mode** — TipTap loads only when a field is first focused
- **Bring your own toolbar** — reactive commands, your design
- **Bring your own backend** — `onsave` hands you a plain JSON snapshot; store it anywhere
- **Framework-agnostic core** — Svelte 5 today, more adapters to come

## Install

```bash
pnpm add @editable-kit/svelte
```

## Quick start

```svelte
<script lang="ts">
	import * as Editable from '@editable-kit/svelte';

	import type { ProseMirrorJSON } from '@editable-kit/svelte';

	type Page = { title: ProseMirrorJSON; body: ProseMirrorJSON; image: ProseMirrorJSON };

	let data: Page = $state({} as Page); // your data here
	let editing = $state(false);

	async function save(saved: Page) {
		await fetch('/api/page', { method: 'PUT', body: JSON.stringify(saved) });
		editing = false;
	}
</script>

<button onclick={() => (editing = !editing)}>{editing ? 'Cancel' : 'Edit'}</button>

<Editable.Root bind:data {editing} onsave={save}>
	{#snippet children({ save, dirty })}
		<h1><Editable.Text bind:value={data.title} /></h1>
		<Editable.Rich bind:value={data.body} />
		<Editable.Image bind:value={data.image} />

		{#if editing}<button onclick={save} disabled={!dirty}>Save</button>{/if}
	{/snippet}
</Editable.Root>
```

**[Read the docs →](https://bluefrog130.github.io/editable-kit/docs)**

## Packages

| Package                                                                      | Version                                                                                                                                    | Downloads                                                                                                                         |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| [`@editable-kit/svelte`](https://www.npmjs.com/package/@editable-kit/svelte) | [![npm](https://img.shields.io/npm/v/%40editable-kit%2Fsvelte?color=%23f43f5e&label=)](https://www.npmjs.com/package/@editable-kit/svelte) | [![downloads](https://img.shields.io/npm/dm/%40editable-kit%2Fsvelte?label=)](https://www.npmjs.com/package/@editable-kit/svelte) |
| [`@editable-kit/core`](https://www.npmjs.com/package/@editable-kit/core)     | [![npm](https://img.shields.io/npm/v/%40editable-kit%2Fcore?color=%23f43f5e&label=)](https://www.npmjs.com/package/@editable-kit/core)     | [![downloads](https://img.shields.io/npm/dm/%40editable-kit%2Fcore?label=)](https://www.npmjs.com/package/@editable-kit/core)     |

Svelte apps only need `@editable-kit/svelte` — it re-exports all of core.

## Examples

- [`examples/basic-auth`](examples/basic-auth) — session auth, local disk storage
- [`examples/cloudflare`](examples/cloudflare) — Workers, content and images in R2

## Contributing

Issues and PRs welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for the monorepo layout, commands,
and release process.

## License

[MIT](LICENSE)
