<script lang="ts">
	import { resolve } from '$app/paths';
	import { Renderer } from '$lib/components/renderer/index.js';
	import type { BlogPostData } from '@routes/types.js';
	import type { ProseMirrorJSON, PMNode } from '$lib/types/prosemirror.js';

	let {
		data,
		editing,
		onaddpost
	}: {
		data: BlogPostData[];
		editing: boolean;
		onaddpost: () => void;
	} = $props();

	function extractPlainText(doc: ProseMirrorJSON): string {
		const parts: string[] = [];
		function walk(nodes: PMNode[] | undefined) {
			if (!nodes) return;
			for (const node of nodes) {
				if (node.type === 'text') {
					parts.push(node.text);
				} else if ('content' in node && node.content) {
					walk(node.content as PMNode[]);
				}
			}
		}
		walk(doc.content);
		return parts.join(' ');
	}
</script>

<section class="py-24">
	<div class="mx-auto max-w-6xl px-6">
		<div class="mb-14 text-center">
			<p class="mb-3 text-xs font-medium tracking-[0.25em] text-muted-foreground uppercase">
				Guides
			</p>
			<h2 class="font-serif text-3xl tracking-tight sm:text-4xl">How It Works</h2>
			<p class="mx-auto mt-3 max-w-lg text-muted-foreground">
				Dive deeper into the architecture and patterns behind editable-kit.
			</p>
		</div>

		{#if data.length > 0}
			<a href={resolve('/blog/[id]', { id: data[0].id })} class="group/featured mb-8 block">
				<article
					class="grid overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md md:grid-cols-2"
				>
					<div class="aspect-8/5 overflow-hidden md:aspect-auto">
						<img
							src={data[0].image.src}
							alt={data[0].image.alt}
							class="h-full w-full object-cover transition-transform duration-500 group-hover/featured:scale-105"
						/>
					</div>
					<div class="flex flex-col justify-center p-8 md:p-10">
						<span
							class="mb-4 self-start rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
						>
							Featured
						</span>
						<h3
							class="font-serif text-2xl tracking-tight transition-colors group-hover/featured:text-muted-foreground sm:text-3xl"
						>
							<Renderer doc={data[0].title} />
						</h3>
						<p class="mt-3 line-clamp-3 leading-relaxed text-muted-foreground">
							{extractPlainText(data[0].body)}
						</p>
						<span
							class="mt-6 text-sm font-medium text-primary transition-colors group-hover/featured:underline"
						>
							Read more &rarr;
						</span>
					</div>
				</article>
			</a>
		{/if}

		{#if data.length > 1}
			<div class="grid gap-6 sm:grid-cols-2">
				{#each data.slice(1) as post, i (post.id)}
					<a href={resolve('/blog/[id]', { id: post.id })} class="group/card block">
						<article
							class="h-full overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
						>
							<div class="aspect-8/5 overflow-hidden">
								<img
									src={post.image.src}
									alt={post.image.alt}
									class="h-full w-full object-cover transition-transform duration-300 group-hover/card:scale-105"
								/>
							</div>
							<div class="p-6">
								<span
									class="mb-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground"
								>
									{i + 2}
								</span>
								<h3
									class="font-serif text-xl tracking-tight transition-colors group-hover/card:text-muted-foreground"
								>
									<Renderer doc={post.title} />
								</h3>
								<p class="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
									{extractPlainText(post.body)}
								</p>
							</div>
						</article>
					</a>
				{/each}

				{#if editing}
					<button
						class="flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-muted-foreground/25 text-muted-foreground/50 transition-colors hover:border-muted-foreground/50 hover:text-muted-foreground/80"
						onclick={onaddpost}
					>
						<span class="text-3xl font-light">+</span>
						<span class="text-sm font-medium">New Post</span>
					</button>
				{/if}
			</div>
		{/if}
	</div>
</section>
