<script lang="ts">
	import * as Editable from '$lib/components/editable/index.js';
	import type { SaveResult } from '$lib/components/editable/types.js';
	import * as db from '@routes/db.js';
	import type { BlogPostData } from '@routes/types.js';
	import { applyFields } from '@routes/apply-fields.js';
	import Nav from '@routes/nav.svelte';
	import Footer from '@routes/footer.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	const id = $derived(page.params.id!);

	let post: BlogPostData | undefined = $derived(await db.loadBlogPost(id));
	let editing = $derived(page.url.searchParams.has('editing'));

	const editableData = $derived(
		post ? { title: post.title, body: post.body, image: post.image } : undefined
	);

	async function handleSave(allData: SaveResult) {
		if (!post) return;
		const updated = structuredClone($state.snapshot(post));
		const fields = allData.get('post');
		if (fields && !Array.isArray(fields)) {
			await applyFields(updated as unknown as Record<string, unknown>, fields);
		}
		await db.saveBlogPost(updated);
		post = updated;
		editing = false;

		if (page.url.searchParams.has('editing')) {
			const url = new URL(page.url);
			url.searchParams.delete('editing');
			goto(url, { replaceState: true });
		}
	}

	async function handleDelete() {
		if (!post) return;
		await db.deleteBlogPost(post.id);
		goto('/');
	}
</script>

{#if !post || !editableData}
	<div class="flex min-h-screen flex-col items-center justify-center">
		<p class="text-lg text-muted-foreground">Post not found.</p>
		<a href="/" class="mt-4 text-sm underline underline-offset-2 hover:text-foreground">
			Back to home
		</a>
	</div>
{:else}
	<Editable.Root {editing} onsave={handleSave}>
		{#snippet children({ state, save })}
			<Nav
				{editing}
				backHref="/"
				onedit={() => (editing = true)}
				onreset={() => (editing = false)}
				ondelete={handleDelete}
			/>

			{#if editing && state}
				{#await import('@routes/toolbar.svelte') then { default: Toolbar }}
					<Toolbar onsave={save} oncancel={() => (editing = false)} {state} />
				{/await}
			{/if}

			<main class="group" data-editing={editing ? '' : undefined}>
				<Editable.Data key="post" data={editableData}>
					{#snippet children({ text, rich, image })}
						<section class="border-b border-border">
							<div class="mx-auto max-w-5xl px-6 pt-12 pb-16">
								<div class="aspect-video overflow-hidden rounded-lg border border-border shadow-sm">
									{@render image('image', {
										maxWidth: 1200,
										maxHeight: 675,
										quality: 0.85,
										aspect: 16 / 9
									})}
								</div>
							</div>
						</section>

						<article class="mx-auto max-w-3xl px-6 py-16">
							<h1 class="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
								{@render text('title')}
							</h1>
							<div class="prose mt-8 max-w-none leading-relaxed text-muted-foreground prose-zinc">
								{@render rich('body')}
							</div>
						</article>
					{/snippet}
				</Editable.Data>
			</main>

			<Footer />
		{/snippet}
	</Editable.Root>
{/if}
