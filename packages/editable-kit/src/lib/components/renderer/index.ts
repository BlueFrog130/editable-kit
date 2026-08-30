export { default as Renderer, mergeOverrides } from './renderer.svelte';
export { default as PlainText } from './plain-text.svelte';
export type {
	NodeOverrides,
	NodeOverrideSnippets,
	MarkOverrideSnippets,
	NodeSnippet,
	MarkSnippet,
	SomeNodeSnippet,
	SomeMarkSnippet
} from './types.js';
export {
	nodeDefaults,
	markDefaults,
	type ElementSpec,
	type NodeDefault,
	type MarkDefault
} from './defaults.js';
