<script lang="ts">
	import { importEditor, type EditorContentProps } from '../editor/index.js';

	let {
		content = $bindable(),
		editor = $bindable(),
		editing,
		...props
	}: EditorContentProps = $props();
</script>

{#snippet html()}
	{@html content}
{/snippet}

{#if editing}
	{#await importEditor()}
		{@render html()}
	{:then [{ Editor: Tiptap }, { default: Editor }, { multiline }]}
		<Editor bind:this={editor} tiptap={Tiptap} bind:content extensions={multiline} {...props} />
	{/await}
{:else}
	{@render html()}
{/if}
