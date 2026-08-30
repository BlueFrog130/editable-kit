<script lang="ts" module>
	import type { NodeOverrides } from './types.js';

	/** Later overrides win, per node/mark type — so a field can replace one snippet
		without discarding the set `Root` configured. */
	export function mergeOverrides(
		base: NodeOverrides | undefined,
		own: NodeOverrides | undefined
	): NodeOverrides | undefined {
		if (!base) return own;
		if (!own) return base;
		return {
			nodes: { ...base.nodes, ...own.nodes },
			marks: { ...base.marks, ...own.marks }
		};
	}
</script>

<script lang="ts">
	import type { JSONContent } from '$lib/types/prosemirror.js';
	import { getEditableContext } from '../editable/editable-context.svelte.js';
	import RenderNode from './render-node.svelte';

	type Props = {
		/** Any TipTap document — `ProseMirrorJSON` is one, as is a doc using your own extensions. */
		doc: JSONContent;
		/** Merged over the surrounding `Editable.Root`'s overrides, when there is one. */
		overrides?: NodeOverrides;
	};

	let { doc, overrides }: Props = $props();

	const ctx = getEditableContext();
	const resolved = $derived(mergeOverrides(ctx?.overrides, overrides));
</script>

{#each doc?.content ?? [] as node}
	<RenderNode {node} overrides={resolved} />
{/each}
