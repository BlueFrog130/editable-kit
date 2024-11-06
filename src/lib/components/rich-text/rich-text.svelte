<script lang="ts">
	import { editor } from '$lib/state/index.js';
	import type { RichTextEditorProps } from './index.js';

	let { content, ...props }: RichTextEditorProps = $props();
</script>

{#if editor.isEditing}
	{#await import('./rich-text-editor.svelte')}
		{@html content}
	{:then RichTextEditor}
		<RichTextEditor.default {content} {...props} />
	{/await}
{:else}
	{@html content}
{/if}
