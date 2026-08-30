<script lang="ts">
	import * as Editable from '$lib/index.js';
	import { paragraphs, text } from '$lib/index.js';
	import { Renderer } from '$lib/components/renderer/index.js';
	import type { ProseMirrorJSON } from '$lib/types/prosemirror.js';
	import Code from './code.svelte';
	import Example from './example.svelte';
	import { CORE_CONCEPTS } from './examples.js';
	import { Separator } from '../components/ui/separator/index.js';
	import DocToolbar from './doc-toolbar.svelte';

	let editing = $state(false);
	let data: { title: ProseMirrorJSON; body: ProseMirrorJSON } = $state({
		title: text('Click "Try editing" above'),
		body: paragraphs(
			'This is a live editor. Toggle editing to change this heading and paragraph, then save your changes.'
		)
	});
</script>

<!-- Header -->
<section class="mb-16">
	<p class="mb-4 text-xs font-medium tracking-[0.25em] text-muted-foreground uppercase">Overview</p>
	<h1 class="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">editable-kit</h1>
	<p class="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
		Inline editing for Svelte 5. Plain text, rich text via <a
			href="https://tiptap.dev/docs/editor"
			class="underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
			target="_blank"
			rel="noopener noreferrer">TipTap</a
		>, and images with cropping &mdash; without compromising performance, safety, or prerendering.
	</p>
</section>

<!-- Why -->
<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Why editable-kit?</h2>
	<p class="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
		Most content editing libraries assume your page exists to be an editor. They load heavy
		JavaScript up front, require a client-side runtime, and render content by injecting raw HTML
		into the DOM. That tradeoff makes sense for a full CMS, but not when you just want a heading, a
		paragraph, or an image to be editable in place.
	</p>
	<p class="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
		editable-kit takes a different approach. Your content is static by default. The editor only
		loads when a user actually starts editing, and disappears when they stop. The result is a page
		that is fast, prerenderable, and safe &mdash; with inline editing that feels native.
	</p>

	<div class="mt-8 grid gap-4 sm:grid-cols-3">
		<div class="rounded-lg border border-border p-4">
			<p class="text-sm font-medium">Zero JS by default</p>
			<p class="mt-1 text-xs leading-relaxed text-muted-foreground">
				<a
					href="https://tiptap.dev/docs/editor"
					class="underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
					target="_blank"
					rel="noopener noreferrer">TipTap</a
				>, the image cropper, and the toolbar are all lazily imported. Until a user toggles editing,
				none of that code is loaded. Your visitors get a static page with no editor overhead.
			</p>
		</div>
		<div class="rounded-lg border border-border p-4">
			<p class="text-sm font-medium">Fully prerenderable</p>
			<p class="mt-1 text-xs leading-relaxed text-muted-foreground">
				The included <code class="rounded bg-muted px-1.5 py-0.5 font-mono">Renderer</code>
				component converts
				<a
					href="https://tiptap.dev/docs/editor/core-concepts/schema"
					class="underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
					target="_blank"
					rel="noopener noreferrer">ProseMirror JSON</a
				> to real Svelte components at build time. Pages prerender to static HTML with no client-side
				rendering step required.
			</p>
		</div>
		<div class="rounded-lg border border-border p-4">
			<p class="text-sm font-medium">No {'{@html}'} tag</p>
			<p class="mt-1 text-xs leading-relaxed text-muted-foreground">
				The Renderer walks <a
					href="https://tiptap.dev/docs/editor/core-concepts/schema"
					class="underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
					target="_blank"
					rel="noopener noreferrer">ProseMirror JSON</a
				>
				and outputs native Svelte elements &mdash; no
				<code class="rounded bg-muted px-1.5 py-0.5 font-mono">{'{@html}'}</code>
				injection. Content is rendered through the framework, not around it, eliminating an entire class
				of XSS vulnerabilities.
			</p>
		</div>
	</div>
</section>

<Editable.Root bind:data {editing}>
	{#snippet children({ state: s, save })}
		<Example
			label="Try it out"
			bind:editing
			onsave={() => {
				save();
				editing = false;
			}}
		>
			{#if editing && s}
				<DocToolbar state={s} />
			{/if}
			<h2 class="font-serif text-2xl tracking-tight">
				<Editable.Text bind:value={data.title} />
			</h2>
			<div class="mt-2 text-muted-foreground"><Editable.Rich bind:value={data.body} /></div>
		</Example>
	{/snippet}
</Editable.Root>

<Separator class="my-12" />

<!-- Core Concepts -->
<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Core Concepts</h2>
	<p class="mt-3 text-muted-foreground">
		Two components form the editing context. <code
			class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">Root</code
		>
		manages global editing state.
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">Data</code> wraps a typed data object
		and exposes editor snippets.
	</p>

	<Code code={CORE_CONCEPTS} />

	<div class="mt-6 grid gap-4 sm:grid-cols-3">
		<div class="rounded-lg border border-border p-4">
			<p class="text-sm font-medium">Root</p>
			<p class="mt-1 text-xs text-muted-foreground">
				Provides <code class="font-mono">EditableContext</code>. Toggle editing mode, handle saves.
			</p>
		</div>
		<div class="rounded-lg border border-border p-4">
			<p class="text-sm font-medium">Data</p>
			<p class="mt-1 text-xs text-muted-foreground">
				Generic <code class="font-mono">{'<T>'}</code> wrapper. Exposes
				<code class="font-mono">text</code>,
				<code class="font-mono">multiline</code>,
				<code class="font-mono">rich</code>,
				<code class="font-mono">image</code> snippets.
			</p>
		</div>
		<div class="rounded-lg border border-border p-4">
			<p class="text-sm font-medium">Renderer</p>
			<p class="mt-1 text-xs text-muted-foreground">
				Renders <code class="font-mono">ProseMirrorJSON</code> to HTML without loading
				<a
					href="https://tiptap.dev/docs/editor"
					class="underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
					target="_blank"
					rel="noopener noreferrer">TipTap</a
				>.
			</p>
		</div>
	</div>
</section>
