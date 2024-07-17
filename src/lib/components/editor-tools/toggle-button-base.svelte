<script lang="ts">
	import { wrapIn } from 'prosemirror-commands';
	import type { ChildrenProps } from '$lib/index.js';
	import type { EditorToolProps } from './index.js';

	const { children, node, view, state }: ChildrenProps & { node: string } & EditorToolProps =
		$props();

	const disabled = $derived.by(() => {
		if (!state.schema) return true;
		return !wrapIn(state.schema.nodes[node])(state);
	});

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		if (!state?.schema) return;
		wrapIn(state.schema.nodes[node])(state, view?.dispatch);
		view?.focus();
	}
</script>

<button onclick={handleClick} {disabled} class="sm:mx-1 rounded-full p-2 disabled:opacity-30">
	{@render children()}
</button>
