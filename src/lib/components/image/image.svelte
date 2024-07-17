<script lang="ts">
	import type { ImageProps } from './index.js';
	import { editor } from '$lib/state/index.js';

	let { src = $bindable(), alt, maxHeight, maxWidth, ...props }: ImageProps = $props();

	// TODO: Remove the previewSrc stuff - Image Editor has a preview and the user should be prompted before trying to navigate away
	let previewSrc = $state('');
</script>

{#if editor.isEditing}
	{#await import('./image-editor.svelte')}
		<img src={previewSrc ?? src} {alt} />
	{:then ImageEditor}
		<ImageEditor.default bind:previewSrc bind:src />
	{/await}
{:else}
	<img width={maxWidth} height={maxHeight} src={previewSrc ?? src} {alt} />
{/if}
