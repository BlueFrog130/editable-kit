<script lang="ts">
	import { editor } from '$lib/state/index.js';
	import type { EditorComponentProps } from '../editor/index.js';

	let { content = $bindable(), ...props }: EditorComponentProps = $props();
</script>

{#if editor.editing}
	{#await import('./multiline-plain-text-editor.svelte')}
		{@html content}
	{:then { default: MultilinePlainTextEditor }}
		<MultilinePlainTextEditor {content} {...props} />
	{/await}
{:else}
	{@html content}
{/if}
