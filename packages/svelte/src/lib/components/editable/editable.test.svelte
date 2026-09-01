<script lang="ts">
	import type { Editor } from '@tiptap/core';
	import type { ProseMirrorJSON } from '@editable-kit/core';
	import Root from './editable.svelte';
	import Text from '../editors/plain-text.svelte';

	type Data = { title: ProseMirrorJSON };

	type Api = {
		save: () => Promise<void>;
		reset: () => void;
		dirty: boolean;
	};

	let {
		data = $bindable(),
		editing = true,
		onsave,
		oncreate,
		onapi
	}: {
		data: Data;
		editing?: boolean;
		onsave?: (data: Data) => void;
		oncreate?: (editor: Editor) => void;
		onapi?: (api: Api) => void;
	} = $props();
</script>

<Root bind:data {editing} {onsave}>
	{#snippet children(api)}
		<!-- Hand the toolbar API to the test; expression tags render undefined as nothing. -->
		{void onapi?.(api)}
		<Text bind:value={data.title} options={{ oncreate }} aria-label="Title" />
	{/snippet}
</Root>
