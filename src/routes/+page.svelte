<script lang="ts">
	import EditorContext from '$lib/components/editor/editor-context.svelte';
	import { editor } from '$lib/state/editor.svelte.js';
	import type { EditorSaveData, MaybePromise } from '$lib/types.js';

	const data = {
		title: 'Hello World',
		description: `<p> This is a test </p>`,
		content: `<p> This is a <strong>test</strong> also</p>`,
		image: {
			src: 'https://dummyimage.com/150',
			alt: 'tester'
		}
	};

	function handleSave(d: EditorSaveData<typeof data>): MaybePromise<void> {
		console.log(d);

		if (!d.image.content) return;

		console.log('Downloading image');

		const url = URL.createObjectURL(d.image.content);

		console.log({ url });

		// Download
		const a = document.createElement('a');
		a.href = url;
		a.download = 'image.webp';
		a.click();
	}
</script>

<div class="container mx-auto py-12">
	<input type="checkbox" bind:checked={editor.editing} /> Edit mode

	<EditorContext {data} onsave={handleSave}>
		{#snippet children({ plainText, multilinePlainText, rich, image })}
			<main>
				<h1>{@render plainText('title')}</h1>
				{@render multilinePlainText('description')}
				{@render rich('content')}
				<div class="w-80 h-80">
					{@render image('image', { maxWidth: 320, maxHeight: 320, quality: 0.8, aspect: 1 / 1 })}
				</div>
			</main>
		{/snippet}
	</EditorContext>
</div>
