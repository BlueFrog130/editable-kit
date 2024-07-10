<script lang="ts">
	import type { ImageProps } from './index.js';
	import { editor } from '$lib/state/index.js';
	import { svelte } from '@sveltejs/vite-plugin-svelte';
	import ImageEditor from './image-editor.svelte';

	let { src = $bindable(), alt, maxHeight, maxWidth, ...props }: ImageProps = $props();

	let previewSrc = $state('');
</script>

{#if editor.isEditing}
	{#await import('./image-editor.svelte')}
		<img src={previewSrc ?? src} {alt} />
	{:then ImageEditor}
		<ImageEditor.default bind:src bind:previewSrc {alt} {maxWidth} {maxHeight} {...props} />
	{/await}
{:else}
	<img width={maxWidth} height={maxHeight} {src} {alt} />
{/if}
