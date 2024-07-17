<script lang="ts">
	import { toggleMark, wrapIn } from 'prosemirror-commands';
	import { createLink } from '$lib/editor/commands.js';
	import type { EditorView } from 'prosemirror-view';
	import type { EditorState } from 'prosemirror-state';
	import Link from 'lucide-svelte/icons/link';
	import type { EditorToolProps } from './index.js';

	const { node, view, state }: { node: string } & EditorToolProps = $props();

	const disabled = $derived.by(() => {
		if (!state || !view) return true;
		return !createLink(state);
	});

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		if (!state || !view) return;
		let url = prompt('Enter the URL', 'https://example.com');
		if (!url) return;
		toggleMark(state.schema.marks.link, { href: url })(state, view.dispatch);
		view.focus();
	}
</script>

<button onclick={handleClick} {disabled} class="sm:mx-1 rounded-full p-2 disabled:opacity-30">
	<Link class="h-3 w-3 sm:h-4 sm:w-4" />
</button>
