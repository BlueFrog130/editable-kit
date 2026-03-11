<script lang="ts">
	import type { PMNode } from '$lib/types/prosemirror.js';
	import type { NodeOverrides } from './types.js';
	import RenderNode from './render-node.svelte';
	import RenderText from './render-text.svelte';

	type Props = {
		node: PMNode;
		overrides?: NodeOverrides;
	};

	let { node, overrides }: Props = $props();
</script>

{#if node.type === 'text'}
	<RenderText {node} marks={overrides?.marks} />
{:else if node.type === 'hardBreak'}
	{#if overrides?.nodes?.hardBreak}
		{@render overrides.nodes.hardBreak(node)}
	{:else}
		<br />
	{/if}
{:else if node.type === 'image'}
	{#if overrides?.nodes?.image}
		{@render overrides.nodes.image(node)}
	{:else}
		<img src={node.attrs.src} alt={node.attrs.alt ?? ''} title={node.attrs.title} />
	{/if}
{:else if node.type === 'paragraph'}
	{#snippet paragraphChildren()}
		{#each node.content ?? [] as child}
			<RenderNode node={child} {overrides} />
		{/each}
	{/snippet}
	{#if overrides?.nodes?.paragraph}
		{@render overrides.nodes.paragraph(node, paragraphChildren)}
	{:else}
		<p>{@render paragraphChildren()}</p>
	{/if}
{:else if node.type === 'heading'}
	{#snippet headingChildren()}
		{#each node.content ?? [] as child}
			<RenderNode node={child} {overrides} />
		{/each}
	{/snippet}
	{#if overrides?.nodes?.heading}
		{@render overrides.nodes.heading(node, headingChildren)}
	{:else}
		<svelte:element this={`h${node.attrs.level}`}>{@render headingChildren()}</svelte:element>
	{/if}
{:else if node.type === 'blockquote'}
	{#snippet blockquoteChildren()}
		{#each node.content ?? [] as child}
			<RenderNode node={child} {overrides} />
		{/each}
	{/snippet}
	{#if overrides?.nodes?.blockquote}
		{@render overrides.nodes.blockquote(node, blockquoteChildren)}
	{:else}
		<blockquote>{@render blockquoteChildren()}</blockquote>
	{/if}
{:else if node.type === 'bulletList'}
	{#snippet bulletListChildren()}
		{#each node.content ?? [] as child}
			<RenderNode node={child} {overrides} />
		{/each}
	{/snippet}
	{#if overrides?.nodes?.bulletList}
		{@render overrides.nodes.bulletList(node, bulletListChildren)}
	{:else}
		<ul>{@render bulletListChildren()}</ul>
	{/if}
{:else if node.type === 'orderedList'}
	{#snippet orderedListChildren()}
		{#each node.content ?? [] as child}
			<RenderNode node={child} {overrides} />
		{/each}
	{/snippet}
	{#if overrides?.nodes?.orderedList}
		{@render overrides.nodes.orderedList(node, orderedListChildren)}
	{:else}
		<ol start={node.attrs?.start}>{@render orderedListChildren()}</ol>
	{/if}
{:else if node.type === 'listItem'}
	{#snippet listItemChildren()}
		{#each node.content ?? [] as child}
			<RenderNode node={child} {overrides} />
		{/each}
	{/snippet}
	{#if overrides?.nodes?.listItem}
		{@render overrides.nodes.listItem(node, listItemChildren)}
	{:else}
		<li>{@render listItemChildren()}</li>
	{/if}
{/if}
