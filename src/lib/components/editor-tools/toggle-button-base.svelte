<script lang="ts">
	import { wrapIn } from 'prosemirror-commands';
	import { editor, type ChildrenProps } from '$lib/index.js';

	const { children, node }: ChildrenProps & { node: string } = $props();

	const disabled = $derived.by(() => {
		if (!editor.state?.schema) return true;
		return !wrapIn(editor.state.schema.nodes[node])(editor.state);
	});

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		if (!editor.state?.schema) return;
		wrapIn(editor.state.schema.nodes[node])(editor.state, editor.view?.dispatch);
		editor.view?.focus();
	}
</script>

<button onclick={handleClick} {disabled} class="sm:mx-1 rounded-full p-2 disabled:opacity-30">
	{@render children()}
</button>
