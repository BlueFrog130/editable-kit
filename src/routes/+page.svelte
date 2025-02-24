<script lang="ts">
	import * as Editable from '$lib/components/editable/index.js';
	import { Toolbar } from '$lib/components/toolbar/index.js';
	import type { EditorSaveData, MaybePromise } from '$lib/types.js';

	let editing = $state(false);

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
	<button onclick={() => (editing = true)}>Edit</button>

	<Editable.Root {editing}>
		<Editable.Data {data}>
			{#snippet children({ text: plainText, multiline: multilinePlainText, rich, image })}
				<main>
					<h1>{@render plainText([(d) => d.title, (d, v) => (d.title = v)])}</h1>
					{@render multilinePlainText([(d) => d.description, (d, v) => (d.description = v)])}
					{@render rich([(d) => d.content, (d, v) => (d.content = v)])}
					<div class="w-80 h-80">
						{@render image([(d) => d.image, (d, v) => {}], {
							maxWidth: 320,
							maxHeight: 320,
							quality: 0.8,
							aspect: 1 / 1
						})}
					</div>
				</main>
			{/snippet}
		</Editable.Data>
	</Editable.Root>
</div>
