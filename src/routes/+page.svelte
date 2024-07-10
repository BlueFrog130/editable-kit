<script lang="ts">
	import { EditorToolbar } from '$lib/components/editor-toolbar/index.js';
	import { PlainText } from '$lib/components/plain-text/index.js';
	import { RichText } from '$lib/components/rich-text/index.js';
	import { editor } from '$lib/index.js';
	import { onMount } from 'svelte';

	let content = $state('Page content');
	let multilineContent = $state('Page content 2');

	let richContent = $state('Page content 3');
	let richMultilineContent = $state('Page content 4');

	onMount(() => {
		editor.isEditing = true;
	});
</script>

<EditorToolbar />

<div class="container mx-auto py-12">
	<input type="checkbox" bind:checked={editor.isEditing} /> Edit mode
	<button
		onclick={() => console.log({ content, multilineContent, richContent, richMultilineContent })}
		>log content</button
	>
	<div>
		<PlainText bind:content />
	</div>
	<div>
		<PlainText bind:content={multilineContent} multiline />
	</div>

	<div>
		<RichText bind:content={richContent} />
	</div>
	<div>
		<RichText bind:content={richMultilineContent} multiline />
	</div>
</div>
