<script lang="ts">
	import * as Editable from '$lib/components/editable/index.js';
	import type { SaveResult } from '$lib/components/editable/types.js';
	import * as db from '@routes/db.js';
	import type { DemoSiteData } from '@routes/types.js';
	import { createDefaultBlogPost, createDefaultNote, DEFAULT_DATA } from '@routes/defaults.js';
	import { applyFields } from '@routes/apply-fields.js';
	import Nav from '@routes/nav.svelte';
	import Hero from '@routes/hero.svelte';
	import Notes from '@routes/notes.svelte';
	import Blog from '@routes/blog.svelte';
	import Footer from '@routes/footer.svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';

	let data: DemoSiteData = $state(DEFAULT_DATA);
	let editing = $state(false);

	$effect.pre(() => {
		if (browser) {
			db.load().then((d) => (data = d));
		}
	});

	async function handleSave(allData: SaveResult) {
		const updated = structuredClone($state.snapshot(data));
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const u = updated as any;
		for (const [key, fields] of allData) {
			if (Array.isArray(fields)) continue;
			const match = key.match(/^(\w+)-(\d+)$/);

			if (match) {
				const [, section, indexStr] = match;
				const index = parseInt(indexStr);
				if (u[section]?.[index]) {
					await applyFields(u[section][index], fields);
				}
			} else {
				if (u[key] && typeof u[key] === 'object') {
					await applyFields(u[key], fields);
				}
			}
		}

		await db.save(updated);
		data = updated;
		editing = false;
	}

	async function handleAddPost() {
		const post = createDefaultBlogPost();
		await db.saveBlogPost(post);
		data = await db.load();
		goto(`/blog/${post.id}?editing=1`);
	}

	function handlePageShow() {
		if (browser) {
			db.load().then((d) => (data = d));
		}
	}
</script>

<svelte:window onpageshow={handlePageShow} />

<Editable.Root {editing} onsave={handleSave}>
	{#snippet children({ state, save })}
		<Nav
			{editing}
			onedit={() => (editing = true)}
			onreset={async () => {
				data = await db.reset();
				editing = false;
			}}
		/>

		{#if editing && state}
			{#await import('@routes/toolbar.svelte') then { default: Toolbar }}
				<Toolbar onsave={save} oncancel={() => (editing = false)} {state} />
			{/await}
		{/if}

		<main class="group" data-editing={editing ? '' : undefined}>
			<Hero data={data.hero} />
			<Notes data={data.notes} {editing} />
			<Blog data={data.blog} {editing} onaddpost={handleAddPost} />
		</main>

		<Footer />
	{/snippet}
</Editable.Root>
