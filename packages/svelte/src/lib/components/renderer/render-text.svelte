<script lang="ts" module>
	// Warn once per unknown type rather than once per mark
	const warned = new Set<string>();
</script>

<script lang="ts">
	import type { JSONContent, JSONMark } from '@editable-kit/core';
	import { markDefaults } from '@editable-kit/core';
	import type { MarkOverrideSnippets, SomeMarkSnippet } from './types.js';

	type Props = {
		/** A text node. TipTap types `text` as optional, so a node missing it renders empty. */
		node: JSONContent;
		marks?: MarkOverrideSnippets;
	};

	let { node, marks: markOverrides }: Props = $props();

	$effect(() => {
		for (const mark of node.marks ?? []) {
			if (markOverrides?.[mark.type] || mark.type in markDefaults) continue;
			if (warned.has(mark.type)) continue;
			warned.add(mark.type);
			console.warn(
				`editable-kit: no renderer for mark type "${mark.type}". Rendering its text unstyled — ` +
					'add a matching snippet to `overrides.marks` so view mode matches the editor.'
			);
		}
	});
</script>

<!-- Marks nest: each wraps the rendering of the marks after it. -->
{#snippet renderMarks(text: string, marks: JSONMark[], index: number)}
	{#if index >= marks.length}
		{text}
	{:else}
		{@const mark = marks[index]}
		{@const custom = markOverrides?.[mark.type] as SomeMarkSnippet | undefined}
		{@const spec = custom ? null : (markDefaults[mark.type]?.(mark) ?? null)}
		{#snippet rest()}
			{@render renderMarks(text, marks, index + 1)}
		{/snippet}
		{#if custom}
			{@render custom(mark, rest)}
		{:else if spec}
			<svelte:element this={spec.tag} {...spec.attrs}>{@render rest()}</svelte:element>
		{:else}
			<!-- Unknown mark, or one declining to render (a link with no href). -->
			{@render rest()}
		{/if}
	{/if}
{/snippet}

{@render renderMarks(node.text ?? '', node.marks ?? [], 0)}
