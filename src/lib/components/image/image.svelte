<script lang="ts">
	import type { ImageProps } from './index.js';

	let {
		src = $bindable(),
		alt = $bindable(),
		editor = $bindable(),
		editing,
		...props
	}: ImageProps = $props();
</script>

{#snippet img()}
	<img class="w-full h-full" {src} {alt} />
{/snippet}

{#if editing}
	{#await Promise.all([import('./image-editor.svelte'), import('$lib/components/editable/editable-state.svelte.js')])}
		{@render img()}
	{:then [{ default: ImageEditor }]}
		<ImageEditor bind:this={editor} {src} {...props} />
	{/await}
{:else}
	{@render img()}
{/if}
