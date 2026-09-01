# @editable-kit/core

Framework-agnostic core for [editable-kit](https://github.com/BlueFrog130/editable-kit). Depends on TipTap, not on any UI framework.

- `text()`, `paragraphs()`, `image()`, `imageAttrs()` — build and read field documents
- ProseMirror JSON types, augmentable via `@editable-kit/core/types`
- Per-variant TipTap extension sets, lazily loaded by `importEditor(variant)`
- `createFieldEditor()` / `destroyFieldEditor()` — mount TipTap **onto** an existing element, so switching to edit mode adds no box
- `nodeDefaults` / `markDefaults` — the node→element table a view-mode renderer walks
- `pickFile()`

If you are using Svelte, install [`@editable-kit/svelte`](../svelte) instead — it depends on this and re-exports all of it.

## Registering your own nodes and marks

```ts
declare module '@editable-kit/core/types' {
	interface NodeTypes {
		callout: { type: 'callout'; attrs: { tone: 'info' | 'warn' }; content?: PMNode[] };
	}
}
```
