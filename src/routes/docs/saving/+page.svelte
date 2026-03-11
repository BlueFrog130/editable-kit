<script lang="ts">
	import * as Editable from '$lib/components/editable/index.js';
	import type { SaveResult } from '$lib/components/editable/types.js';
	import type { ProseMirrorJSON } from '$lib/types/prosemirror.js';
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
		title: {
			type: 'doc',
			content: [{ type: 'text', text: 'Edit me then save' }]
		},
		body: {
			type: 'doc',
			content: [
				{
					type: 'paragraph',
					content: [
						{
							type: 'text',
							text: 'Change this text, then hit save to see the data structure your onsave handler receives.'
						}
					]
				}
			]
		}
	});

	async function handleSave(allData: SaveResult) {
		const result: Record<string, unknown> = {};
		for (const [key, fields] of allData) {
			const section: Record<string, unknown> = {};
			for (const [name, content] of Object.entries(fields)) {
				if (content.type === 'text') {
					section[name] = { type: 'text', content: content.content };
					// Also update local data
					if (name === 'title') data.title = content.content;
					if (name === 'body') data.body = content.content;
				} else if (content.type === 'image-src') {
					section[name] = { type: 'image-src', src: content.src, alt: content.alt };
				} else if (content.type === 'image-blob') {
					section[name] = { type: 'image-blob', hasBlob: true, alt: content.alt };
				}
			}
			result[key] = section;
		}
		saveOutput = JSON.stringify(result, null, 2);
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
		When the user saves, <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">Root</code>
		collects content from every registered
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">Data</code>
		component and passes a
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">Map</code> to your
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">onsave</code> handler. Try the live
		example to see the output.
	</p>

	<Example label="Save Output Demo" bind:editing>
		<Editable.Root {editing} onsave={handleSave}>
			{#snippet children({ state: s })}
				{((savingState = s), '')}
				{#if editing && savingState}
					<DocToolbar state={savingState} />
				{/if}
				<Editable.Data key="demo" {data}>
					{#snippet children({ text, rich })}
						<h2 class="font-serif text-2xl tracking-tight">
							{@render text('title')}
						</h2>
						<div class="mt-2 text-muted-foreground">{@render rich('body')}</div>
					{/snippet}
				</Editable.Data>
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
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">Data</code> is generic over your
		data shape. The snippet selectors are type-checked —
		<code class="font-mono">text('title')</code> only compiles if
		<code class="font-mono">title</code>
		is a <code class="font-mono">ProseMirrorJSON</code> field,
		<code class="font-mono">image('cover')</code> only if
		<code class="font-mono">cover</code> is an <code class="font-mono">ImageState</code>.
	</p>

	<Code code={TYPE_SAFETY} />
</section>
