<script lang="ts">
	import { resolve } from '$app/paths';
	import * as Editable from '$lib/index.js';
	import * as db from '@routes/db.js';
	import type { BlogPostData } from '@routes/types.js';
	import { uploadAsDataURL } from '@routes/apply-fields.js';
	import Nav from '@routes/nav.svelte';
	import Footer from '@routes/footer.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	let post: BlogPostData | undefined = $state(await db.loadBlogPost(page.params.id!));
	let editing = $derived(page.url.searchParams.has('editing'));

	// `Root` hands over a plain snapshot of the same object the fields wrote into.
	async function handleSave(saved: BlogPostData) {
		await db.saveBlogPost(saved);
		post = await db.loadBlogPost(saved.id);
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
		goto(resolve('/'));
	}
</script>

{#if !post}
	<div class="flex min-h-screen flex-col items-center justify-center">
		<p class="text-lg text-muted-foreground">Post not found.</p>
		<a href={resolve('/')} class="mt-4 text-sm underline underline-offset-2 hover:text-foreground">
			Back to home
		</a>
	</div>
{:else}
	<Editable.Root bind:data={post} {editing} upload={uploadAsDataURL} onsave={handleSave}>
		{#snippet children({ state, save, reset })}
			<Nav
				{editing}
				backHref={resolve('/')}
				onedit={() => (editing = true)}
				onreset={() => (editing = false)}
				ondelete={handleDelete}
			/>

			{#if editing && state}
				{#await import('@routes/toolbar.svelte') then { default: Toolbar }}
					<Toolbar
						onsave={save}
						oncancel={() => {
							reset();
							editing = false;
						}}
						{state}
					/>
				{/await}
			{/if}

			<main class="group" data-editing={editing ? '' : undefined}>
				<section class="border-b border-border">
					<div class="mx-auto max-w-5xl px-6 pt-12 pb-16">
						<div class="aspect-video overflow-hidden rounded-lg border border-border shadow-sm">
							<Editable.Image
								class="block size-full [&>img]:size-full [&>img]:object-cover"
								bind:value={post!.image}
							/>
						</div>
					</div>
				</section>

				<article class="mx-auto max-w-3xl px-6 py-16">
					<h1 class="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
						<Editable.Text bind:value={post!.title} />
					</h1>
					<div class="prose mt-8 max-w-none leading-relaxed text-muted-foreground prose-zinc">
						<Editable.Rich bind:value={post!.body} />
					</div>
				</article>
			</main>

			<Footer />
		{/snippet}
	</Editable.Root>
{/if}
