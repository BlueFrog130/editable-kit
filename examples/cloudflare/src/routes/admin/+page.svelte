<script lang="ts">
	import { Root, pickFile } from '@editable-kit/svelte';
	import { saveToApi, uploadAsset } from '@editable-kit/adapter-cloudflare/client';
	import { HOME_KEY, type HomeContent } from '$lib/content';
	import Home from '../home.svelte';

	let { data }: { data: { content: HomeContent; version: number; token: string } } = $props();

	let editing = $state(false);
	// The version last written, if we have written one — otherwise whatever the load gave us.
	let saved: number | undefined = $state();
	const version = $derived(saved ?? data.version);
	let error: string | undefined = $state();
	const saveContent = $derived(saveToApi({ token: data.token }));
</script>

<!-- Admin: dynamic, edits the record inline and saves through the content API. -->
<Root
	bind:data={data.content}
	{editing}
	onsave={async (record) => {
		saved = await saveContent(HOME_KEY, record, version);
	}}
>
	{#snippet children({ state, save, saveStatus })}
		<div style="display:flex; gap:.5rem; align-items:center; margin-bottom:1rem">
			{#if editing}
				<button
					onclick={async () => {
						error = undefined;
						try {
							await save();
							editing = false;
						} catch (e) {
							error = e instanceof Error ? e.message : 'Save failed';
						}
					}}>Save</button
				>
				<button onclick={() => (editing = false)}>Cancel</button>

				<!-- The file is uploaded on pick, named by its own hash, and the field is pointed
					 at that path. Uploading is not a commitment: cancel, or replace it again, and
					 the sweeper collects whatever no saved record ended up referencing. Acts on
					 whichever field has focus, so click the hero (or into the body) first.
					 `state.editor` survives this button taking focus, which is why the click lands. -->
				<button
					disabled={!state?.has('image')}
					onclick={async () => {
						error = undefined;
						const file = await pickFile();
						if (!file) return;
						try {
							const src = await uploadAsset(file, { token: data.token });
							state?.run((e) => e.chain().focus().setImage({ src }).run());
						} catch (e) {
							error = e instanceof Error ? e.message : 'Upload failed';
						}
					}}>Replace image</button
				>
			{:else}
				<button onclick={() => (editing = true)}>Edit</button>
			{/if}
			<span style="color:#888">{saveStatus}</span>
			{#if error}<span style="color:#c00">{error}</span>{/if}
		</div>

		<Home bind:content={data.content} />
	{/snippet}
</Root>
