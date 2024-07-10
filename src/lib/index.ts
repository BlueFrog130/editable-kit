import type { Snippet } from 'svelte';

// Reexport your entry components here
export * from './state/index.js';

export type ChildrenProps = {
	children: Snippet;
};
