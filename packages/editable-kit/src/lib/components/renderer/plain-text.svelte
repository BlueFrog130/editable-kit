<script lang="ts">
	import type { JSONContent } from '$lib/types/prosemirror.js';

	let {
		doc,
		separator = ' '
	}: {
		doc: JSONContent | undefined;
		/** Placed between sibling nodes — `' '` keeps paragraphs from running together. */
		separator?: string;
	} = $props();
</script>

<!-- ponytail: the separator sits between siblings, so a node rendering nothing (an image)
	still contributes one. Only worth fixing if it ever shows. -->
<!-- ponytail: one line, no indentation — whitespace between the tags is output, and
	this renders into meta descriptions where a stray space is a bug. -->
{#snippet nodes(
	content: JSONContent[] | undefined
)}{#each content ?? [] as node, i (node)}{#if i > 0}{separator}{/if}{#if node.text}{node.text}{:else}{@render nodes(
				node.content
			)}{/if}{/each}{/snippet}

{@render nodes(doc?.content)}
