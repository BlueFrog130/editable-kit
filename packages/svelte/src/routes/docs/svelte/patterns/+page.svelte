<script lang="ts">
	import * as Editable from '$lib/index.js';
	import { paragraphs, text } from '$lib/index.js';
	import type { ProseMirrorJSON } from '$lib/index.js';
	import { Separator } from '@routes/components/ui/separator/index.js';
	import Code from '../../code.svelte';
	import Example from '../../example.svelte';
	import DocToolbar from '../../doc-toolbar.svelte';
	import {
		PATTERN_IMAGE_UPLOAD,
		PATTERN_BACKEND_SAVE,
		PATTERN_LOCALSTORAGE,
		PATTERN_ERROR_HANDLING
	} from '../../examples.js';

	let backendEditing = $state(false);
	let backendSaved = $state(false);

	let backendData: { title: ProseMirrorJSON; body: ProseMirrorJSON } = $state({
		title: text('My Blog Post'),
		body: paragraphs('Edit this content, then save to see it persist in localStorage.')
	});

	// Load from localStorage on mount
	$effect(() => {
		if (typeof window === 'undefined') return;
		const stored = localStorage.getItem('patterns-demo');
		if (stored) {
			const parsed = JSON.parse(stored);
			if (parsed.title) backendData.title = parsed.title;
			if (parsed.body) backendData.body = parsed.body;
		}
	});
</script>

<section class="mb-16">
	<p class="mb-4 text-xs font-medium tracking-[0.25em] text-muted-foreground uppercase">Guide</p>
	<h1 class="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">Patterns</h1>
	<p class="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
		Real-world integration patterns for saving, uploading, and persisting editable content.
	</p>
</section>

<Separator class="my-12" />

<!-- Image Upload -->
<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Image Upload</h2>
	<p class="mt-3 mb-6 text-muted-foreground">
		Nothing uploads for you. A toolbar button picks the file, your handler uploads it, and
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">setImage</code> points the node at
		the URL you get back. The flow is always file &rarr; upload &rarr; URL.
	</p>

	<Code code={PATTERN_IMAGE_UPLOAD} lang="ts" />

	<div class="mt-6 rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
		<p class="text-sm">
			<span class="font-medium">Note.</span>
			<span class="text-muted-foreground">
				The field hands your handler the original
				<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">File</code> untouched — no resizing,
				no re-encoding to WebP. Do that on the server, or at your CDN, if you want it.
			</span>
		</p>
	</div>
</section>

<Separator class="my-12" />

<!-- Backend Integration -->
<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Backend Integration</h2>
	<p class="mt-3 mb-6 text-muted-foreground">
		There is no payload to transform. Bind
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">Root</code> at your content
		object and <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">onsave</code> hands it to
		you, already flushed and ready to serialize.
	</p>

	<Editable.Root
		bind:data={backendData}
		editing={backendEditing}
		onsave={(saved) => {
			localStorage.setItem('patterns-demo', JSON.stringify(saved));
			backendEditing = false;
			backendSaved = true;
			setTimeout(() => (backendSaved = false), 2000);
		}}
	>
		{#snippet children({ state: s, save })}
			<Example label="localStorage Demo" bind:editing={backendEditing} onsave={save}>
				{#if backendEditing && s}
					<DocToolbar state={s} />
				{/if}
				<h2 class="font-serif text-2xl tracking-tight">
					<Editable.Text bind:value={backendData.title} />
				</h2>
				<div class="mt-2 text-muted-foreground">
					<Editable.Rich bind:value={backendData.body} />
				</div>
				{#if backendSaved}
					<div class="mt-3 rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-600">
						Saved to localStorage!
					</div>
				{/if}
			</Example>
		{/snippet}
	</Editable.Root>

	<Code code={PATTERN_BACKEND_SAVE} />
</section>

<Separator class="my-12" />

<!-- localStorage Persistence -->
<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">localStorage Persistence</h2>
	<p class="mt-3 mb-6 text-muted-foreground">
		A helper pattern for client-side persistence. Useful for prototyping and demos — the live
		example above uses this approach. Image documents hold only a URL, so they serialize with
		everything else; for a demo with no server, store a data URL as the
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">src</code>.
	</p>

	<Code code={PATTERN_LOCALSTORAGE} lang="ts" />
</section>

<Separator class="my-12" />

<!-- Error Handling -->
<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Error Handling</h2>
	<p class="mt-3 mb-6 text-muted-foreground">
		Keep the user in editing mode on failure so they can retry. Only set
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">editing = false</code> after the save
		succeeds.
	</p>

	<Code code={PATTERN_ERROR_HANDLING} lang="ts" />

	<div class="mt-6 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
		<p class="text-sm">
			<span class="font-medium">Important.</span>
			<span class="text-muted-foreground">
				Never exit editing mode before the save succeeds. If you set
				<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">editing = false</code> before the
				async operation completes, the user loses their work.
			</span>
		</p>
	</div>
</section>
