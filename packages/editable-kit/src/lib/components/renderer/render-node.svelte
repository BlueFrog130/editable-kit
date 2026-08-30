<script lang="ts" module>
	// Warn once per unknown type rather than once per node
	const warned = new Set<string>();
</script>

<script lang="ts">
	import type { JSONContent } from '$lib/types/prosemirror.js';
	import { nodeDefaults } from './defaults.js';
	import type { NodeOverrides, SomeNodeSnippet } from './types.js';
	import RenderNode from './render-node.svelte';
	import RenderText from './render-text.svelte';

	type Props = {
		node: JSONContent;
		overrides?: NodeOverrides;
	};

	let { node, overrides }: Props = $props();

	// TipTap types `type` as optional; a node without one renders as its children.
	const type = $derived(node.type ?? '');
	const custom = $derived(overrides?.nodes?.[type] as SomeNodeSnippet | undefined);
	const spec = $derived(custom ? null : (nodeDefaults[type]?.(node) ?? null));

	$effect(() => {
		if (custom || type === 'text' || type in nodeDefaults) return;
		if (warned.has(type)) return;
		warned.add(type);
		console.warn(
			`editable-kit: no renderer for node type "${type}". Rendering its children only — ` +
				'add a matching snippet to `overrides.nodes` so view mode matches the editor.'
		);
	});
</script>

{#if type === 'text'}
	<RenderText {node} marks={overrides?.marks} />
{:else}
	{#snippet children()}
		{#each node.content ?? [] as child}
			<RenderNode node={child} {overrides} />
		{/each}
	{/snippet}
	{#if custom}
		{@render custom(node, children)}
	{:else if !spec}
		<!-- Unknown type, or a node declining to render (an image with no src yet).
			 Children still render, so text is never dropped. -->
		{@render children()}
	{:else if spec.void}
		<svelte:element this={spec.tag} {...spec.attrs} />
	{:else}
		<svelte:element this={spec.tag} {...spec.attrs}>{@render children()}</svelte:element>
	{/if}
{/if}
