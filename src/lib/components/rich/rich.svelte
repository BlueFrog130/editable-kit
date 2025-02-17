<script lang="ts">
	import { editor as editorState } from '$lib/state/index.js';
	import type { EditorContentProps } from '../editor/index.js';

	let { editor = $bindable(), content, ...props }: EditorContentProps = $props();
</script>

{#if editorState.editing}
	{#await Promise.all([import('../editor/editor.svelte'), import('@tiptap/core'), import('../editor/index.js')])}
		{@html content}
	{:then [{ default: Editor }, { Editor: Tiptap }, { rich }]}
		<Editor
			bind:this={editor}
			tiptap={Tiptap}
			{content}
			extensions={rich}
			{...editorState.props}
			{...props}
		/>
	{/await}
{:else}
	{@html content}
{/if}
