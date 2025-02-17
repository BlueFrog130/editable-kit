<script lang="ts">
	import type { ImageProps } from './index.js';
	import { editor as editorState } from '$lib/state/index.js';
	import type { EditorComponent } from '../editor/index.js';

	let {
		editor = $bindable(),
		src,
		alt,
		...props
	}: ImageProps & { editor: EditorComponent } = $props();
</script>

{#snippet img()}
	<img class="w-full h-full" {src} {alt} />
{/snippet}

{#if editorState.editing}
	{#await import('./image-editor.svelte')}
		{@render img()}
	{:then { default: ImageEditor }}
		<ImageEditor bind:this={editor} {src} {...props} />
	{/await}
{:else}
	{@render img()}
{/if}
