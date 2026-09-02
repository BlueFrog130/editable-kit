<script lang="ts">
	import * as Editable from '$lib/index.js';
	import { text, paragraphs } from '$lib/index.js';
	import type { ProseMirrorJSON } from '$lib/index.js';
	import { Separator } from '@routes/components/ui/separator/index.js';
	import Code from '../../code.svelte';
	import Example from '../../example.svelte';
	import DocToolbar from '../../doc-toolbar.svelte';
	import { ARRAY_BASIC, ARRAY_ADD_REMOVE } from '../../examples.js';

	type Note = { title: ProseMirrorJSON; body: ProseMirrorJSON };

	// Basic demo
	let basicEditing = $state(false);

	let basicNotes: Note[] = $state([
		{ title: text('First Note'), body: paragraphs('Content of the first note.') },
		{ title: text('Second Note'), body: paragraphs('Content of the second note.') }
	]);

	// Add/remove demo
	let addRemoveEditing = $state(false);

	let addRemoveNotes: Note[] = $state([
		{ title: text('Shopping List'), body: paragraphs('Eggs, milk, bread') },
		{ title: text('Ideas'), body: paragraphs('Learn Svelte 5 runes') }
	]);

	function addNote() {
		addRemoveNotes = [...addRemoveNotes, { title: text('New Note'), body: paragraphs() }];
	}

	function removeNote(index: number) {
		addRemoveNotes = addRemoveNotes.filter((_, i) => i !== index);
	}
</script>

<section class="mb-16">
	<p class="mb-4 text-xs font-medium tracking-[0.25em] text-muted-foreground uppercase">Guide</p>
	<h1 class="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">Arrays & Lists</h1>
	<p class="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
		Collections need no special component. Loop with
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">{'{#each}'}</code> and bind each field
		at the item it edits.
	</p>
</section>

<Separator class="my-12" />

<!-- Basic Usage -->
<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Basic Usage</h2>
	<p class="mt-3 mb-6 text-muted-foreground">
		An ordinary <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">{'{#each}'}</code>
		block. Key it by item identity rather than index &mdash;
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">(note)</code>, not
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">(i)</code> &mdash; so reordering or
		removing a row keeps every editor pointed at its own item.
	</p>

	<Editable.Root bind:data={basicNotes} editing={basicEditing}>
		{#snippet children({ state: s, save })}
			<Example
				bind:editing={basicEditing}
				onsave={() => {
					save();
					basicEditing = false;
				}}
			>
				{#if basicEditing && s}
					<DocToolbar state={s} />
				{/if}
				<div class="grid gap-4 sm:grid-cols-2">
					{#each basicNotes as note (note)}
						<div class="rounded-lg border border-border p-4">
							<h3 class="font-medium"><Editable.Text bind:value={note.title} /></h3>
							<div class="mt-1 text-sm text-muted-foreground">
								<Editable.Multiline bind:value={note.body} />
							</div>
						</div>
					{/each}
				</div>
			</Example>
		{/snippet}
	</Editable.Root>

	<Code code={ARRAY_BASIC} />
</section>

<Separator class="my-12" />

<!-- Add & Remove -->
<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Add & Remove</h2>
	<p class="mt-3 mb-6 text-muted-foreground">
		Since <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">data</code> is a reactive array,
		you can add or remove items while editing. The editor components will mount and unmount automatically.
	</p>

	<Editable.Root bind:data={addRemoveNotes} editing={addRemoveEditing}>
		{#snippet children({ state: s, save })}
			<Example
				bind:editing={addRemoveEditing}
				onsave={() => {
					save();
					addRemoveEditing = false;
				}}
			>
				{#if addRemoveEditing && s}
					<DocToolbar state={s} />
				{/if}
				<div class="grid gap-4 sm:grid-cols-2">
					{#each addRemoveNotes as note, index (note)}
						<div class="relative rounded-lg border border-border p-4">
							{#if addRemoveEditing}
								<button
									onclick={() => removeNote(index)}
									class="absolute top-2 right-2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
								>
									&times;
								</button>
							{/if}
							<h3 class="font-medium"><Editable.Text bind:value={note.title} /></h3>
							<div class="mt-1 text-sm text-muted-foreground">
								<Editable.Multiline bind:value={note.body} />
							</div>
						</div>
					{/each}
					{#if addRemoveEditing}
						<button
							onclick={addNote}
							class="flex items-center justify-center rounded-lg border-2 border-dashed border-border p-4 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
						>
							+ Add Note
						</button>
					{/if}
				</div>
			</Example>
		{/snippet}
	</Editable.Root>

	<Code code={ARRAY_ADD_REMOVE} />
</section>

<Separator class="my-12" />

<!-- Save Handling -->
<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Save Handling</h2>
	<p class="mt-3 mb-6 text-muted-foreground">
		There is nothing array-specific to do. Edits land in the items themselves, so binding
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">Root</code> at the array is
		enough &mdash; <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">onsave</code>
		receives a plain snapshot of it, and
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">reset()</code> restores the rows you
		added, removed, or edited.
	</p>
</section>

<Separator class="my-12" />

<!-- Type Safety -->
<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Type Safety</h2>
	<p class="mt-3 mb-6 text-muted-foreground">
		The binding is the type check. There are no string selectors to get wrong, so nothing needs
		inferring &mdash; the compiler checks
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">bind:value</code> against the property
		you named.
	</p>
	<p class="text-muted-foreground">
		Given
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm"
			>Note = &#123; title: ProseMirrorJSON; body: ProseMirrorJSON &#125;</code
		>,
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm"
			>&lt;Editable.Text bind:value=&#123;note.title&#125; /&gt;</code
		>
		is valid, but
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm"
			>&lt;Editable.Image bind:value=&#123;note.title&#125; /&gt;</code
		>
		is a compile error, since
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">ProseMirrorJSON</code> is not an
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">ProseMirrorJSON</code>.
	</p>
</section>
