<script lang="ts">
	import * as Editable from '$lib/components/editable/index.js';
	import type { ProseMirrorJSON } from '$lib/types/prosemirror.js';
	import type { EditableState } from '$lib/components/editable/editable-state.svelte.js';
	import { Separator } from '../../components/ui/separator/index.js';
	import Code from '../code.svelte';
	import Example from '../example.svelte';
	import DocToolbar from '../doc-toolbar.svelte';
	import { ARRAY_BASIC, ARRAY_ADD_REMOVE, API_EACH_COMPONENT } from '../examples.js';

	type Note = { title: ProseMirrorJSON; body: ProseMirrorJSON };

	// Basic demo
	let basicEditing = $state(false);
	let basicSave: (() => Promise<unknown>) | undefined = $state();
	let basicState: EditableState | undefined = $state();

	let basicNotes: Note[] = $state([
		{
			title: { type: 'doc', content: [{ type: 'text', text: 'First Note' }] },
			body: {
				type: 'doc',
				content: [
					{
						type: 'paragraph',
						content: [{ type: 'text', text: 'Content of the first note.' }]
					}
				]
			}
		},
		{
			title: { type: 'doc', content: [{ type: 'text', text: 'Second Note' }] },
			body: {
				type: 'doc',
				content: [
					{
						type: 'paragraph',
						content: [{ type: 'text', text: 'Content of the second note.' }]
					}
				]
			}
		}
	]);

	// Add/remove demo
	let addRemoveEditing = $state(false);
	let addRemoveSave: (() => Promise<unknown>) | undefined = $state();
	let addRemoveState: EditableState | undefined = $state();

	let addRemoveNotes: Note[] = $state([
		{
			title: { type: 'doc', content: [{ type: 'text', text: 'Shopping List' }] },
			body: {
				type: 'doc',
				content: [
					{
						type: 'paragraph',
						content: [{ type: 'text', text: 'Eggs, milk, bread' }]
					}
				]
			}
		},
		{
			title: { type: 'doc', content: [{ type: 'text', text: 'Ideas' }] },
			body: {
				type: 'doc',
				content: [
					{
						type: 'paragraph',
						content: [{ type: 'text', text: 'Learn Svelte 5 runes' }]
					}
				]
			}
		}
	]);

	function addNote() {
		addRemoveNotes = [
			...addRemoveNotes,
			{
				title: { type: 'doc', content: [{ type: 'text', text: 'New Note' }] },
				body: {
					type: 'doc',
					content: [
						{
							type: 'paragraph',
							content: [{ type: 'text', text: '' }]
						}
					]
				}
			}
		];
	}

	function removeNote(index: number) {
		addRemoveNotes = addRemoveNotes.filter((_, i) => i !== index);
	}
</script>

<section class="mb-16">
	<p class="mb-4 text-xs font-medium tracking-[0.25em] text-muted-foreground uppercase">Guide</p>
	<h1 class="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">Arrays & Lists</h1>
	<p class="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
		Manage collections of editable items with
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">Editable.Each</code> — type-safe array
		editing with automatic indexing.
	</p>
</section>

<Separator class="my-12" />

<!-- Basic Usage -->
<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Basic Usage</h2>
	<p class="mt-3 mb-6 text-muted-foreground">
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">Editable.Each</code> iterates
		over an array and provides editor snippets for each item. Each item gets its own set of
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">text</code>,
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">multiline</code>,
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">rich</code>, and
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">image</code> snippets, automatically
		scoped to the correct index.
	</p>

	<Example
		bind:editing={basicEditing}
		onsave={() => {
			basicSave?.();
			basicEditing = false;
		}}
	>
		<Editable.Root editing={basicEditing}>
			{#snippet children({ state: s, save: saveFn })}
				{((basicSave = saveFn), (basicState = s), '')}
				{#if basicEditing && basicState}
					<DocToolbar state={basicState} />
				{/if}
				<div class="grid gap-4 sm:grid-cols-2">
					<Editable.Each
						key="notes"
						data={basicNotes}
						onsave={(items) => {
							items.forEach((item, i) => {
								if (item.title.type === 'text') basicNotes[i].title = item.title.content;
								if (item.body.type === 'text') basicNotes[i].body = item.body.content;
							});
						}}
					>
						{#snippet each(item, index, { text, multiline })}
							<div class="rounded-lg border border-border p-4">
								<h3 class="font-medium">{@render text('title')}</h3>
								<div class="mt-1 text-sm text-muted-foreground">
									{@render multiline('body')}
								</div>
							</div>
						{/snippet}
					</Editable.Each>
				</div>
			{/snippet}
		</Editable.Root>
	</Example>

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

	<Example
		bind:editing={addRemoveEditing}
		onsave={() => {
			addRemoveSave?.();
			addRemoveEditing = false;
		}}
	>
		<Editable.Root editing={addRemoveEditing}>
			{#snippet children({ state: s, save: saveFn })}
				{((addRemoveSave = saveFn), (addRemoveState = s), '')}
				{#if addRemoveEditing && addRemoveState}
					<DocToolbar state={addRemoveState} />
				{/if}
				<div class="grid gap-4 sm:grid-cols-2">
					<Editable.Each
						key="addremove-notes"
						data={addRemoveNotes}
						onsave={(items) => {
							items.forEach((item, i) => {
								if (item.title.type === 'text') addRemoveNotes[i].title = item.title.content;
								if (item.body.type === 'text') addRemoveNotes[i].body = item.body.content;
							});
						}}
					>
						{#snippet each(item, index, { text, multiline })}
							<div class="relative rounded-lg border border-border p-4">
								{#if addRemoveEditing}
									<button
										onclick={() => removeNote(index)}
										class="absolute top-2 right-2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
									>
										&times;
									</button>
								{/if}
								<h3 class="font-medium">{@render text('title')}</h3>
								<div class="mt-1 text-sm text-muted-foreground">
									{@render multiline('body')}
								</div>
							</div>
						{/snippet}
					</Editable.Each>
					{#if addRemoveEditing}
						<button
							onclick={addNote}
							class="flex items-center justify-center rounded-lg border-2 border-dashed border-border p-4 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
						>
							+ Add Note
						</button>
					{/if}
				</div>
			{/snippet}
		</Editable.Root>
	</Example>

	<Code code={ARRAY_ADD_REMOVE} />
</section>

<Separator class="my-12" />

<!-- Save Handling -->
<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Save Handling</h2>
	<p class="mt-3 mb-6 text-muted-foreground">
		The <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">onsave</code> callback on
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">Editable.Each</code> receives an
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">EditorSaveData&lt;T&gt;[]</code>
		array — one entry per item, in the same order as the input
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">data</code> array. Each entry
		contains the editor content for every field on that item, using the same
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">EditorContent</code>
		discriminated union as
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">Editable.Data</code>.
	</p>

	<Code code={API_EACH_COMPONENT} />

	<p class="mt-4 text-sm text-muted-foreground">
		Use <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">forEach</code> to iterate the
		save array and update your local state. Check
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">item.field.type</code> to narrow the
		content type before accessing the value.
	</p>
</section>

<Separator class="my-12" />

<!-- Type Safety -->
<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Type Safety</h2>
	<p class="mt-3 mb-6 text-muted-foreground">
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">Editable.Each</code> infers
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">JSONKeys&lt;T&gt;</code> and
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">ImageKeys&lt;T&gt;</code>
		the same way as
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">Editable.Data</code>. The snippet
		selectors are type-checked against the item type, so invalid property names are caught at
		compile time.
	</p>
	<p class="text-muted-foreground">
		For example, given
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm"
			>Note = &#123; title: ProseMirrorJSON; body: ProseMirrorJSON &#125;</code
		>, calling
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">text('title')</code> and
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">multiline('body')</code> are
		valid, but
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">image('title')</code> would be a
		compile error since
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">ProseMirrorJSON</code> does not
		extend
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">ImageState</code>.
	</p>
</section>
