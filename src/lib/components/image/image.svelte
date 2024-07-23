<script lang="ts">
	import type { ImageProps } from './index.js';
	import { editor } from '$lib/state/index.js';

	let { src = $bindable(), alt, maxHeight, maxWidth, quality, aspect }: ImageProps = $props();
</script>

{#if editor.isEditing}
	{#await import('./image-editor.svelte')}
		<img {src} {alt} />
	{:then ImageEditor}
		<ImageEditor.default bind:src {maxHeight} {maxWidth} {aspect} {quality} />
	{/await}
{:else}
	<img width={maxWidth} height={maxHeight} {src} {alt} />
{/if}
