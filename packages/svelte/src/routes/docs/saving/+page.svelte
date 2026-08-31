<script lang="ts">
	import * as Editable from '$lib/index.js';
	import type { ProseMirrorJSON } from '$lib/index.js';
	import { Separator } from '../../components/ui/separator/index.js';
	import Code from '../code.svelte';
	import Example from '../example.svelte';
	import DocToolbar from '../doc-toolbar.svelte';
	import { SAVE_HANDLER, TYPE_SAFETY } from '../examples.js';
	import type { EditableState } from '$lib/components/editable/editable-state.svelte.js';

	let editing = $state(false);
	let savingState: EditableState | undefined = $state();
	let saveOutput = $state('');

	let data: { title: ProseMirrorJSON; body: ProseMirrorJSON } = $state({
		title: Editable.text('Edit me then save'),
		body: Editable.paragraphs(
			'Change this text, then hit save to see the data structure your onsave handler receives.'
		)
	});

	// `onsave` gets a plain snapshot of the very object you bound — nothing to unpack.
	function handleSave(saved: typeof data) {
		saveOutput = JSON.stringify(saved, null, 2);
		editing = false;
	}
</script>

<section class="mb-16">
	<p class="mb-4 text-xs font-medium tracking-[0.25em] text-muted-foreground uppercase">
		Data Flow
	</p>
	<h1 class="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">Saving</h1>
	<p class="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
		Collect content from all editors and persist it to your backend.
	</p>
</section>

<Separator class="my-12" />

<!-- Save Handling -->
<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Handling Saves</h2>
	<p class="mt-3 mb-6 text-muted-foreground">
		Fields write straight into the object you bound, so saving is just persisting it.
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">Root</code> hands your
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">onsave</code> a plain snapshot of that
		same object &mdash; already flushed, ready to serialize. Try the live example to see the output.
	</p>

	<Example label="Save Output Demo" bind:editing>
		<Editable.Root bind:data {editing} onsave={handleSave}>
			{#snippet children({ state: s })}
				{((savingState = s), '')}
				{#if editing && savingState}
					<DocToolbar state={savingState} />
				{/if}
				<h2 class="font-serif text-2xl tracking-tight">
					<Editable.Text bind:value={data.title} />
				</h2>
				<div class="mt-2 text-muted-foreground"><Editable.Rich bind:value={data.body} /></div>
			{/snippet}
		</Editable.Root>
		{#if saveOutput}
			<div class="mt-4 rounded-lg border border-border bg-muted/50 p-4">
				<p class="mb-2 text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
					onsave received:
				</p>
				<pre
					class="overflow-x-auto font-mono text-xs leading-relaxed text-muted-foreground">{saveOutput}</pre>
			</div>
		{/if}
	</Example>

	<Code code={SAVE_HANDLER} />
</section>

<Separator class="my-12" />

<!-- Type Safety -->
<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Type Safety</h2>
	<p class="mt-3 mb-6 text-muted-foreground">
		The binding is the type check. Every field stores a
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">ProseMirrorJSON</code> document,
		images included, so there are no selectors to get wrong — and the
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">text()</code>,
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">paragraphs()</code> and
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">image()</code> helpers build each variant's
		shape for you.
	</p>

	<Code code={TYPE_SAFETY} />
</section>
