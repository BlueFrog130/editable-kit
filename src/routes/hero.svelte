<script lang="ts">
	import { resolve } from '$app/paths';
	import * as Editable from '$lib/components/editable/index.js';
	import type { HeroData } from '@routes/types.js';

	let { data }: { data: HeroData } = $props();
</script>

<Editable.Data key="hero" {data}>
	{#snippet children({ text, multiline, image })}
		<section class="relative overflow-hidden border-b border-border">
			<div
				class="pointer-events-none absolute inset-0 bg-linear-to-b from-secondary/50 via-transparent to-transparent"
			></div>
			<div class="relative mx-auto max-w-6xl px-6 pt-20 pb-20 sm:pt-28">
				<div class="mx-auto max-w-3xl text-center">
					<p
						class="mb-4 inline-block rounded-full border border-border bg-background px-4 py-1.5 text-xs font-medium tracking-[0.25em] text-muted-foreground uppercase shadow-xs group-data-editing:pointer-events-none group-data-editing:opacity-50"
					>
						editable-kit
					</p>
					<h1 class="font-serif text-4xl leading-tight tracking-tight sm:text-5xl lg:text-6xl">
						{@render text('title')}
					</h1>
					<div class="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
						{@render multiline('subtitle')}
					</div>
					<div
						class="mt-10 flex flex-col items-center justify-center gap-3 group-data-editing:pointer-events-none group-data-editing:opacity-50 sm:flex-row"
					>
						<a
							href={resolve('/docs')}
							class="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
						>
							View Documentation &rarr;
						</a>
						<a
							href={resolve('/docs/getting-started')}
							class="inline-flex h-11 items-center justify-center rounded-md border border-border bg-background px-8 text-sm font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground"
						>
							Get Started
						</a>
					</div>
				</div>

				<div class="relative mx-auto mt-16 max-w-5xl">
					<div
						class="absolute -inset-4 rounded-2xl bg-linear-to-b from-border/50 to-transparent opacity-60 blur-sm"
					></div>
					<div
						class="relative aspect-video overflow-hidden rounded-xl border border-border bg-card shadow-lg"
					>
						{@render image('image', {
							maxWidth: 1200,
							maxHeight: 675,
							quality: 0.85,
							aspect: 16 / 9
						})}
					</div>
				</div>
			</div>
		</section>
	{/snippet}
</Editable.Data>
