<script lang="ts">
	import type { ImageProps } from './index.js';
	import type { EditorComponent } from '../editor/index.js';

	let {
		editor = $bindable(),
		editing,
		src,
		alt,
		...props
	}: ImageProps & { editor: EditorComponent; editing: boolean } = $props();
</script>

{#snippet img()}
	<img class="w-full h-full" {src} {alt} />
{/snippet}

{#if editing}
	{#await Promise.all([import('./image-editor.svelte'), import('$lib/state/toolbar-state.svelte.js')])}
		{@render img()}
	{:then [{ default: ImageEditor }, { toolbarState }]}
		<ImageEditor
			bind:this={editor}
			{src}
			{...props}
			onfocus={({ replaceImage }) => {
				toolbarState.active = {
					type: 'image',
					editor: {
						replaceImage
					}
				};
			}}
		/>
	{/await}
{:else}
	{@render img()}
{/if}
