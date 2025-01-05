<script lang="ts">
	import EditorContext from '$lib/components/editor/editor-context.svelte';
	import { Image } from '$lib/components/image/index.js';
	import Toolbar from '$lib/components/toolbar/toolbar.svelte';
	import { editor } from '$lib/state/editor.svelte.js';
	import type { EditorData, ImageKeys, StringKeys } from '$lib/types.js';
	import { onMount } from 'svelte';

	const data = {
		title: 'Hello World',
		description: `<p> This is a test </p>`,
		content: `<p> This is a <strong>test</strong> also</p>`,
		image: {
			src: 'https://via.placeholder.com/150',
			alt: 'tester'
		}
	};

	type Test = StringKeys<typeof data>;
	type Test2 = ImageKeys<typeof data>;

	onMount(() => {
		editor.editing = true;
	});
</script>

<div class="container mx-auto py-12">
	<Toolbar />

	<input type="checkbox" bind:checked={editor.editing} /> Edit mode

	<EditorContext {data}>
		{#snippet children({ plainText, multilinePlainText, rich, image })}
			{@render plainText('title')}
			{@render multilinePlainText('description')}
			{@render rich('content')}
			<div class="w-80 h-80">
				{@render image('image', { maxWidth: 320, maxHeight: 320, quality: 0.8, aspect: 1 / 1 })}
			</div>
		{/snippet}
	</EditorContext>
</div>
