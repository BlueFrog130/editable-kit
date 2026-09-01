import type { Snippet } from 'svelte';
import type { JSONContent, JSONMark, MarkTypes, NodeTypes } from '@editable-kit/core';

/**
 * Receives the node and a snippet that renders its children. Every override has this
 * shape; one for a node type this library does not know gets TipTap's own JSON type.
 */
export type NodeSnippet<N = JSONContent> = Snippet<[N, Snippet]>;
export type MarkSnippet<M = JSONMark> = Snippet<[M, Snippet]>;

/**
 * The payload is `any` on purpose: snippet parameters are checked contravariantly, so a
 * snippet typed for one concrete node would not satisfy an index signature typed for all
 * of them. The renderer looks overrides up by string, so this is the type it looks up.
 */
export type SomeNodeSnippet = Snippet<[any, Snippet]>;
export type SomeMarkSnippet = Snippet<[any, Snippet]>;

/**
 * One snippet per registered node type, typed with that node. Any other key is a node
 * type nothing has registered, and its snippet receives TipTap's raw `JSONContent` —
 * register it in [[NodeTypes]] to get it typed.
 *
 * `text` has no entry: a text node's rendering is its marks, so override those.
 */
export type NodeOverrideSnippets = {
	[K in Exclude<keyof NodeTypes, 'text'>]?: NodeSnippet<NodeTypes[K]>;
} & { [type: string]: SomeNodeSnippet | undefined };

/** One snippet per registered mark type. See [[MarkTypes]] to register your own. */
export type MarkOverrideSnippets = { [K in keyof MarkTypes]?: MarkSnippet<MarkTypes[K]> } & {
	[type: string]: SomeMarkSnippet | undefined;
};

export type NodeOverrides = {
	nodes?: NodeOverrideSnippets;
	marks?: MarkOverrideSnippets;
};
