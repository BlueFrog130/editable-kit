<script lang="ts">
	import * as Editable from '$lib/index.js';
	import { createDefaultNote } from '@routes/defaults.js';
	import type { NoteCardData } from '@routes/types.js';

	let {
		data = $bindable(),
		editing
	}: {
		data: NoteCardData[];
		editing: boolean;
	} = $props();

	function addNote() {
		data.push(createDefaultNote());
	}

	function removeNote(index: number) {
		data = data.filter((_, i) => i !== index);
	}
</script>

<section class="bg-secondary/40 py-24">
	<div class="mx-auto max-w-6xl px-6">
		<div class="mb-14 text-center">
			<p class="mb-3 text-xs font-medium tracking-[0.25em] text-muted-foreground uppercase">Core</p>
			<h2 class="font-serif text-3xl tracking-tight sm:text-4xl">Features</h2>
			<p class="mx-auto mt-3 max-w-lg text-muted-foreground">
				Everything you need for inline editing, nothing you don't.
			</p>
		</div>

		<div class="grid gap-6 lg:grid-cols-3 lg:grid-rows-[auto_auto]">
			<!-- Plain `{#each}`: fields bind straight at the item. Keyed by identity so a
				 removed or reordered row cannot leave an editor pointed at the wrong note. -->
			{#each data as note, i (note)}
				<article
					class="group/card relative bg-background {i === 0 ? 'lg:col-span-2 lg:row-span-2' : ''}"
				>
					{#if editing}
						<button
							class="absolute -top-2 -right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-sm font-medium text-white shadow-md transition-transform hover:scale-110"
							onclick={() => removeNote(i)}
							data-ek-keep
						>
							&times;
						</button>
					{/if}

					{#if i === 0}
						<div
							class="grid h-full overflow-hidden rounded-xl border border-border shadow-sm transition-shadow hover:shadow-md lg:grid-cols-2"
						>
							<div class="aspect-8/5 overflow-hidden lg:aspect-auto">
								<Editable.Image
									class="block size-full [&>img]:size-full [&>img]:object-cover"
									bind:value={note.image}
								/>
							</div>
							<div class="flex flex-col justify-center p-8">
								<span
									class="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground"
								>
									1
								</span>
								<h3 class="font-serif text-2xl tracking-tight">
									<Editable.Text bind:value={note.title} />
								</h3>
								<div class="mt-3 text-sm leading-relaxed text-muted-foreground">
									<Editable.Multiline bind:value={note.body} />
								</div>
							</div>
						</div>
					{:else}
						<div
							class="overflow-hidden rounded-xl border border-border shadow-sm transition-shadow hover:shadow-md"
						>
							<div class="aspect-8/5 overflow-hidden">
								<Editable.Image bind:value={note.image} />
							</div>
							<div class="p-6">
								<span
									class="mb-3 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground"
								>
									{i + 1}
								</span>
								<h3 class="font-serif text-xl tracking-tight">
									<Editable.Text bind:value={note.title} />
								</h3>
								<div class="mt-2 text-sm leading-relaxed text-muted-foreground">
									<Editable.Multiline bind:value={note.body} />
								</div>
							</div>
						</div>
					{/if}
				</article>
			{/each}

			{#if editing}
				<button
					class="flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-muted-foreground/25 text-muted-foreground/50 transition-colors hover:border-muted-foreground/50 hover:text-muted-foreground/80"
					onclick={addNote}
					data-ek-keep
				>
					<span class="text-3xl font-light">+</span>
					<span class="text-sm font-medium">Add Feature</span>
				</button>
			{/if}
		</div>
	</div>
</section>
