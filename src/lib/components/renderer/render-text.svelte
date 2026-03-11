<script lang="ts">
	import type { Mark, TextNode } from '$lib/types/prosemirror.js';
	import type { MarkOverrideSnippets } from './types.js';

	type Props = {
		node: TextNode;
		marks?: MarkOverrideSnippets;
	};

	let { node, marks: markOverrides }: Props = $props();
</script>

{#snippet renderMarks(text: string, marks: Mark[], index: number)}
	{#if index >= marks.length}
		{text}
	{:else}
		{@const mark = marks[index]}
		{#if mark.type === 'bold'}
			{#if markOverrides?.bold}
				{#snippet children()}
					{@render renderMarks(text, marks, index + 1)}
				{/snippet}
				{@render markOverrides.bold(mark, children)}
			{:else}
				<strong>{@render renderMarks(text, marks, index + 1)}</strong>
			{/if}
		{:else if mark.type === 'italic'}
			{#if markOverrides?.italic}
				{#snippet children()}
					{@render renderMarks(text, marks, index + 1)}
				{/snippet}
				{@render markOverrides.italic(mark, children)}
			{:else}
				<em>{@render renderMarks(text, marks, index + 1)}</em>
			{/if}
		{:else if mark.type === 'underline'}
			{#if markOverrides?.underline}
				{#snippet children()}
					{@render renderMarks(text, marks, index + 1)}
				{/snippet}
				{@render markOverrides.underline(mark, children)}
			{:else}
				<u>{@render renderMarks(text, marks, index + 1)}</u>
			{/if}
		{:else if mark.type === 'strike'}
			{#if markOverrides?.strike}
				{#snippet children()}
					{@render renderMarks(text, marks, index + 1)}
				{/snippet}
				{@render markOverrides.strike(mark, children)}
			{:else}
				<s>{@render renderMarks(text, marks, index + 1)}</s>
			{/if}
		{:else if mark.type === 'link'}
			{#if markOverrides?.link}
				{#snippet children()}
					{@render renderMarks(text, marks, index + 1)}
				{/snippet}
				{@render markOverrides.link(mark, children)}
			{:else}
				<a href={mark.attrs.href} target={mark.attrs.target} rel={mark.attrs.rel}
					>{@render renderMarks(text, marks, index + 1)}</a
				>
			{/if}
		{:else}
			{@render renderMarks(text, marks, index + 1)}
		{/if}
	{/if}
{/snippet}

{@render renderMarks(node.text, node.marks ?? [], 0)}
