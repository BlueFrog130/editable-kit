<script lang="ts">
	import { editor } from '$lib/index.js';
	import type { PlainTextEditorProps } from './index.js';

	let { content, ...props }: PlainTextEditorProps = $props();
</script>

{#if editor.isEditing}
	{#await import('./plain-text-editor.svelte')}
		{@html content}
	{:then PlainTextEditor}
		<PlainTextEditor.default {content} {...props} />
	{/await}
{:else}
	{@html content}
{/if}
