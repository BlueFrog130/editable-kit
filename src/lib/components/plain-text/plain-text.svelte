<script lang="ts">
	import { editor as editorState } from '$lib/state/index.js';
	import type { EditorContentProps } from '../editor/index.js';

	let { editor = $bindable(), content, ...props }: EditorContentProps = $props();

	$inspect({ editor });
</script>

{#if editorState.editing}
	{#await Promise.all([import('../editor/editor.svelte'), import('@tiptap/core'), import('../editor/index.js')])}
		{@html content}
	{:then [{ default: Editor }, { Editor: Tiptap }, { plain }]}
		<div class="contents [&_.ProseMirror]:inline-block">
			<Editor
				bind:this={editor}
				tiptap={Tiptap}
				{content}
				extensions={plain}
				{...editorState.props}
				{...props}
			/>
		</div>
	{/await}
{:else}
	{@html content}
{/if}
