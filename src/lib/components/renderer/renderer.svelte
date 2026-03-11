<script lang="ts">
	import type { ProseMirrorJSON } from '$lib/types/prosemirror.js';
	import type { NodeOverrides } from './types.js';
	import RenderNode from './render-node.svelte';

	type Props = {
		doc: ProseMirrorJSON;
		overrides?: NodeOverrides;
	};

	let { doc, overrides }: Props = $props();
</script>

{#each doc.content ?? [] as node}
	<RenderNode {node} {overrides} />
{/each}
