<script lang="ts">
	import { setBlockType } from 'prosemirror-commands';
	import { blockTypeActive } from '$lib/editor/util.js';
	import Heading from 'lucide-svelte/icons/heading';
	import type { EditorToolProps } from './index.js';

	const { state, view }: EditorToolProps = $props();

	const disabled = $derived.by(() => {
		if (!state?.schema) return true;
		return (
			!setBlockType(state.schema.nodes.heading)(state) &&
			!setBlockType(state.schema.nodes.paragraph)(state)
		);
	});

	const active = $derived.by(() => {
		if (!state?.schema) return false;
		return blockTypeActive(state.schema.nodes.heading, { level: 1 })(state);
	});

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		if (!state?.schema) return;
		if (active) {
			setBlockType(state.schema.nodes.paragraph)(state, view?.dispatch);
		} else {
			setBlockType(state.schema.nodes.heading, { level: 1 })(state, view?.dispatch);
		}
		view?.focus();
	}
</script>

<button onclick={handleClick} {disabled} class="sm:mx-1 rounded-full p-2 disabled:opacity-30">
	<Heading class="h-3 w-3 sm:h-4 sm:w-4" />
</button>
