<script lang="ts">
	import type { ImageProps } from './index.js';
	import { editor } from '$lib/state/index.js';

	let { src, alt, ...props }: ImageProps = $props();
</script>

{#snippet img()}
	<img {src} {alt} />
{/snippet}

{#if editor.editing}
	{#await import('./image-editor.svelte')}
		{@render img()}
	{:then { default: ImageEditor }}
		<ImageEditor {src} {...props} />
	{/await}
{:else}
	{@render img()}
{/if}
