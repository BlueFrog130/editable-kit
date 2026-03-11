<script lang="ts">
	import type { ImageProps } from './index.js';

	let {
		src = $bindable(),
		alt = $bindable(),
		editor = $bindable(),
		editing,
		'aria-label': ariaLabel,
		class: className,
		...props
	}: ImageProps = $props();
</script>

{#snippet img()}
	<img data-ek-image {src} {alt} class={className} />
{/snippet}

{#if editing}
	{#await import('./image-editor.svelte')}
		{@render img()}
	{:then { default: ImageEditor }}
		<ImageEditor bind:this={editor} {src} {alt} aria-label={ariaLabel} {...props} />
	{/await}
{:else}
	{@render img()}
{/if}

<style>
	:global([data-ek-image]) {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
</style>
