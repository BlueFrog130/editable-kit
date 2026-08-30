<script lang="ts">
	import { Root } from 'editable-kit';
	import { saveToApi, uploadToApi } from '@editable-kit/cloudflare/client';
	import { HOME_KEY, type HomeContent } from '$lib/content';
	import Home from '../home.svelte';

	let { data }: { data: { content: HomeContent; token: string } } = $props();

	let editing = $state(false);
	const saveContent = $derived(saveToApi({ baseUrl: '/api', token: data.token }));
	const upload = $derived(uploadToApi({ baseUrl: '/api', token: data.token }));
</script>

<!-- Admin: dynamic, edits the record inline and saves through the content API. -->
<Root bind:data={data.content} {editing} {upload} onsave={(saved) => saveContent(HOME_KEY, saved)}>
	{#snippet children({ save, saveStatus })}
		<div style="display:flex; gap:.5rem; align-items:center; margin-bottom:1rem">
			{#if editing}
				<button
					onclick={async () => {
						await save();
						editing = false;
					}}>Save</button
				>
				<button onclick={() => (editing = false)}>Cancel</button>
			{:else}
				<button onclick={() => (editing = true)}>Edit</button>
			{/if}
			<span style="color:#888">{saveStatus}</span>
		</div>

		<Home bind:content={data.content} />
	{/snippet}
</Root>
