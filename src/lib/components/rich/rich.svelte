<script lang="ts">
	import { editor } from '$lib/state/index.js';
	import type { EditorComponentProps } from '../editor/index.js';

	let { content, ...props }: EditorComponentProps = $props();
</script>

{#if editor.editing}
	{#await import('./rich-editor.svelte')}
		{@html content}
	{:then { default: RichEditor }}
		<RichEditor {content} {...props} />
	{/await}
{:else}
	{@html content}
{/if}
