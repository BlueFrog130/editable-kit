<script lang="ts">
	import * as Editable from '$lib/index.js';
	import * as db from '@routes/db.js';
	import type { DemoSiteData } from '@routes/types.js';
	import { createDefaultBlogPost, createDefaultNote, DEFAULT_DATA } from '@routes/defaults.js';
	import Nav from '@routes/nav.svelte';
	import Hero from '@routes/hero.svelte';
	import Notes from '@routes/notes.svelte';
	import Blog from '@routes/blog.svelte';
	import Footer from '@routes/footer.svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { building } from '$app/env';

	let data: DemoSiteData = $state(DEFAULT_DATA);
	let editing = $derived(building ? false : page.url.searchParams.get('editing') === '1');

	$effect.pre(() => {
		if (browser) {
			db.load().then((d) => (data = d));
		}
	});

	// `Root` hands over a plain snapshot of the same object the fields wrote into.
	async function handleSave(saved: DemoSiteData) {
		await db.save(saved);
		stopEdit();
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

	function edit() {
		const params = new URLSearchParams(page.url.searchParams);
		params.set('editing', '1');
		goto(`?${params}`);
	}

	function stopEdit() {
		const params = new URLSearchParams(page.url.searchParams);
		params.delete('editing');
		goto(`?${params}`);
	}
</script>

<svelte:window onpageshow={handlePageShow} />

<Editable.Root bind:data {editing} onsave={handleSave}>
	{#snippet children({ state, save, reset })}
		<Nav
			{editing}
			onedit={() => edit()}
			onreset={async () => {
				data = await db.reset();
				stopEdit();
			}}
		/>

		{#if editing && state}
			{#await import('@routes/toolbar.svelte') then { default: Toolbar }}
				<Toolbar
					onsave={save}
					oncancel={() => {
						reset();
						stopEdit();
					}}
					{state}
				/>
			{/await}
		{/if}

		<main
			class="group [:is(&[data-editing],&[data-editing]_*):has(:is([data-ek-field],[data-ek-keep]))>*:not(:has(:is([data-ek-field],[data-ek-keep])),[data-ek-field],[data-ek-keep])]:pointer-events-none [:is(&[data-editing],&[data-editing]_*):has(:is([data-ek-field],[data-ek-keep]))>*:not(:has(:is([data-ek-field],[data-ek-keep])),[data-ek-field],[data-ek-keep])]:opacity-50"
			data-editing={editing ? '' : undefined}
		>
			<Hero bind:data={data.hero} />
			<Notes bind:data={data.notes} {editing} />
			<Blog data={data.blog} {editing} onaddpost={handleAddPost} />
		</main>

		<Footer />
	{/snippet}
</Editable.Root>
