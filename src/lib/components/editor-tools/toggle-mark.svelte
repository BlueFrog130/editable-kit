<script lang="ts">
	import { toggleMark } from 'prosemirror-commands';
	import { type ChildrenProps } from '$lib/index.js';
	import { markActive } from '$lib/editor/util.js';
	import type { EditorState } from 'prosemirror-state';
	import type { EditorView } from 'prosemirror-view';
	import type { EditorToolProps } from './index.js';

	const {
		children,
		type,
		view,
		state
	}: ChildrenProps &
		EditorToolProps & {
			type: keyof EditorState['schema']['marks'];
		} = $props();

	const markType = $derived(state?.schema.marks[type]);

	const command = $derived(markType ? toggleMark(markType) : undefined);

	const active = $derived.by(() => {
		if (!state?.schema || !markType) return false;
		return markActive(markType)(state);
	});

	const disabled = $derived.by(() => {
		if (!view?.state.schema || !command) return true;
		return !markType || !command(view.state);
	});

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		if (!command || !view?.state || !state) return;
		command(state, view.dispatch, view);
		view.focus();
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
