<script lang="ts">
	import { toggleMark, wrapIn } from 'prosemirror-commands';
	import { editor, type ChildrenProps } from '$lib/index.js';
	import { createLink } from '$lib/editor/commands.js';

	const { children, node }: ChildrenProps & { node: string } = $props();

	const disabled = $derived.by(() => {
		if (!editor.state || !editor.view) return true;
		return !createLink(editor.state);
	});

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		if (!editor.state || !editor.view) return;
		let url = prompt('Enter the URL', 'https://example.com');
		if (!url) return;
		toggleMark(editor.state.schema.marks.link, { href: url })(editor.state, editor.view.dispatch);
		editor.view.focus();
	}
</script>

<button onclick={handleClick} {disabled} class="sm:mx-1 rounded-full p-2 disabled:opacity-30">
	{@html children()}
</button>
