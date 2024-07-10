<script lang="ts">
	import { toggleMark } from 'prosemirror-commands';
	import { editor, type ChildrenProps } from '$lib/index.js';
	import { markActive } from '$lib/editor/util.js';
	import type { EditorState } from 'prosemirror-state';

	const { children, type }: ChildrenProps & { type: keyof EditorState['schema']['marks'] } =
		$props();

	const markType = $derived(editor.state?.schema.marks[type]);

	const command = $derived(markType ? toggleMark(markType) : undefined);

	const active = $derived.by(() => {
		if (!editor.state?.schema || !markType) return false;
		return markActive(markType)(editor.state);
	});

	const disabled = $derived.by(() => {
		if (!editor.view?.state.schema || !command) return true;
		return !markType || !command(editor.view.state);
	});

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		if (!command || !editor.view?.state || !editor.state) return;
		command(editor.state, editor.view.dispatch, editor.view);
		editor.view.focus();
	}
</script>

<button
	onclick={handleClick}
	{disabled}
	class:active
	class="sm:mx-1 rounded-full p-2 disabled:opacity-30 [&.active]:bg-black/10"
>
	{@render children()}
</button>
