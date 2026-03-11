<script lang="ts">
	import * as Editable from '$lib/components/editable/index.js';
	import type { ProseMirrorJSON } from '$lib/types/prosemirror.js';
	import type { EditableState } from '$lib/components/editable/editable-state.svelte.js';
	import { Separator } from '../../components/ui/separator/index.js';
	import Code from '../code.svelte';
	import Example from '../example.svelte';
	import DocToolbar from '../doc-toolbar.svelte';
	import {
		PATTERN_IMAGE_UPLOAD,
		PATTERN_BACKEND_SAVE,
		PATTERN_LOCALSTORAGE,
		PATTERN_ERROR_HANDLING
	} from '../examples.js';

	let backendEditing = $state(false);
	let backendSaved = $state(false);
	let backendState: EditableState | undefined = $state();
	let backendSaveFn: (() => Promise<unknown>) | undefined = $state();

	let backendData: { title: ProseMirrorJSON; body: ProseMirrorJSON } = $state({
		title: { type: 'doc', content: [{ type: 'text', text: 'My Blog Post' }] },
		body: {
			type: 'doc',
			content: [
				{
					type: 'paragraph',
					content: [
						{
							type: 'text',
							text: 'Edit this content, then save to see it persist in localStorage.'
						}
					]
				}
			]
		}
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
		When a user crops or replaces an image, the save handler receives a
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">Blob</code>. Upload it to your
		server and get a URL back. The flow is always blob &rarr; upload &rarr; URL.
	</p>

	<Code code={PATTERN_IMAGE_UPLOAD} lang="ts" />

	<div class="mt-6 rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
		<p class="text-sm">
			<span class="font-medium">Note.</span>
			<span class="text-muted-foreground">
				The image editor exports WebP via OffscreenCanvas. The blob in
				<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">image-blob</code> is ready to upload
				directly — no additional processing needed.
			</span>
		</p>
	</div>
</section>

<Separator class="my-12" />

<!-- Backend Integration -->
<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Backend Integration</h2>
	<p class="mt-3 mb-6 text-muted-foreground">
		A full save handler that transforms
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">SaveResult</code> into an API call.
		The pattern below handles text, unchanged images, and newly cropped images in a single pass.
	</p>

	<Example
		label="localStorage Demo"
		bind:editing={backendEditing}
		onsave={() => {
			backendSaveFn?.();
		}}
	>
		<Editable.Root
			editing={backendEditing}
			onsave={async (allData) => {
				for (const [key, fields] of allData) {
					const section: Record<string, unknown> = {};
					for (const [name, content] of Object.entries(fields)) {
						if (content.type === 'text') {
							section[name] = content.content;
							if (name === 'title') backendData.title = content.content;
							if (name === 'body') backendData.body = content.content;
						}
					}
					localStorage.setItem('patterns-demo', JSON.stringify(section));
				}
				backendEditing = false;
				backendSaved = true;
				setTimeout(() => (backendSaved = false), 2000);
			}}
		>
			{#snippet children({ state: s, save: saveFn })}
				{((backendSaveFn = saveFn), (backendState = s), '')}
				{#if backendEditing && backendState}
					<DocToolbar state={backendState} />
				{/if}
				<Editable.Data key="post" data={backendData}>
					{#snippet children({ text, rich })}
						<h2 class="font-serif text-2xl tracking-tight">
							{@render text('title')}
						</h2>
						<div class="mt-2 text-muted-foreground">{@render rich('body')}</div>
					{/snippet}
				</Editable.Data>
			{/snippet}
		</Editable.Root>
		{#if backendSaved}
			<div class="mt-3 rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-600">
				Saved to localStorage!
			</div>
		{/if}
	</Example>

	<Code code={PATTERN_BACKEND_SAVE} />
</section>

<Separator class="my-12" />

<!-- localStorage Persistence -->
<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">localStorage Persistence</h2>
	<p class="mt-3 mb-6 text-muted-foreground">
		A helper pattern for client-side persistence. Useful for prototyping and demos — the live
		example above uses this approach. For images, convert blobs to data URLs before storing.
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
