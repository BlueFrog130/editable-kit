<script lang="ts">
	import { setBlockType } from 'prosemirror-commands';
	import { editor, type ChildrenProps } from '$lib/index.js';
	import { blockTypeActive } from '$lib/editor/util.js';

	const { children }: ChildrenProps = $props();

	const disabled = $derived.by(() => {
		if (!editor.state?.schema) return true;
		return (
			!setBlockType(editor.state.schema.nodes.heading)(editor.state) &&
			!setBlockType(editor.state.schema.nodes.paragraph)(editor.state)
		);
	});

	const active = $derived.by(() => {
		if (!editor.state?.schema) return false;
		return blockTypeActive(editor.state.schema.nodes.heading, { level: 1 })(editor.state);
	});

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		if (!editor.state?.schema) return;
		if (active) {
			setBlockType(editor.state.schema.nodes.paragraph)(editor.state, editor.view?.dispatch);
		} else {
			setBlockType(editor.state.schema.nodes.heading, { level: 1 })(
				editor.state,
				editor.view?.dispatch
			);
		}
		editor.view?.focus();
	}
</script>

<button onclick={handleClick} {disabled} class="sm:mx-1 rounded-full p-2 disabled:opacity-30">
	{@render children()}
</button>
