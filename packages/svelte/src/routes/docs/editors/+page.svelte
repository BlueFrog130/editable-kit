<script lang="ts">
	import * as Editable from '$lib/index.js';
	import { image, paragraphs, text } from '$lib/index.js';
	import type { ProseMirrorJSON } from '$lib/index.js';
	import * as Tabs from '../../components/ui/tabs/index.js';
	import { Badge } from '../../components/ui/badge/index.js';
	import { Separator } from '../../components/ui/separator/index.js';
	import Code from '../code.svelte';
	import Example from '../example.svelte';
	import DocToolbar from '../doc-toolbar.svelte';
	import {
		EDITOR_PLAIN_TEXT,
		EDITOR_MULTILINE,
		EDITOR_RICH,
		EDITOR_IMAGE,
		EDITOR_MULTIPLE_DATA
	} from '../examples.js';

	// Shared editing state for the variant demos
	let plainEditing = $state(false);
	let multilineEditing = $state(false);
	let richEditing = $state(false);
	let imageEditing = $state(false);
	let multiEditing = $state(false);

	let plainData: { title: ProseMirrorJSON } = $state({ title: text('An Editable Heading') });

	let multilineData: { subtitle: ProseMirrorJSON } = $state({
		subtitle: paragraphs(
			'This is a multiline editor. It supports multiple paragraphs but no formatting marks.',
			'Press Enter to create a new paragraph.'
		)
	});

	let richData: { body: ProseMirrorJSON } = $state({
		body: {
			type: 'doc',
			content: [
				{
					type: 'paragraph',
					content: [
						{ type: 'text', text: 'This is a ' },
						{ type: 'text', text: 'rich text', marks: [{ type: 'bold' }] },
						{
							type: 'text',
							text: ' editor. Try adding bold, italic, headings, and more.'
						}
					]
				}
			]
		}
	});

	let imageData: { image: ProseMirrorJSON } = $state({
		image: image(
			'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=450&fit=crop',
			{ alt: 'Sunrise over mountain valley' }
		)
	});

	let heroData: { title: ProseMirrorJSON; image: ProseMirrorJSON } = $state({
		title: text('Hero Section'),
		image: image(
			'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=800&h=450&fit=crop',
			{ alt: 'Journal on a desk' }
		)
	});

	let notes: { title: ProseMirrorJSON; body: ProseMirrorJSON }[] = $state([
		{ title: text('First Note'), body: paragraphs('Content of the first note.') },
		{ title: text('Second Note'), body: paragraphs('Content of the second note.') }
	]);
</script>

<section class="mb-16">
	<p class="mb-4 text-xs font-medium tracking-[0.25em] text-muted-foreground uppercase">
		Components
	</p>
	<h1 class="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">Editors</h1>
	<p class="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
		Each editor variant maps to a different <a
			href="https://tiptap.dev/docs/editor/extensions"
			class="underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
			target="_blank"
			rel="noopener noreferrer">TipTap extension</a
		>
		set. All text editors output
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">ProseMirrorJSON</code>.
	</p>
</section>

<Separator class="my-12" />

<!-- Editor Variants -->
<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Editor Variants</h2>
	<p class="mt-3 mb-6 text-muted-foreground">
		Choose the variant that matches your content needs. Each example below is a live editor.
	</p>

	<Tabs.Root value="plain">
		<Tabs.List>
			<Tabs.Trigger value="plain">Plain Text</Tabs.Trigger>
			<Tabs.Trigger value="multiline">Multiline</Tabs.Trigger>
			<Tabs.Trigger value="rich">Rich Text</Tabs.Trigger>
			<Tabs.Trigger value="image">Image</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="plain" class="mt-4">
			<div class="mb-3 flex items-center gap-2">
				<Badge variant="secondary">Single-line</Badge>
				<span class="text-sm text-muted-foreground">Headings, names, titles</span>
			</div>

			<Editable.Root bind:data={plainData} editing={plainEditing}>
				{#snippet children({ save })}
					<Example
						bind:editing={plainEditing}
						onsave={() => {
							save();
							plainEditing = false;
						}}
					>
						<h2 class="font-serif text-2xl tracking-tight">
							<Editable.Text bind:value={plainData.title} />
						</h2>
					</Example>
				{/snippet}
			</Editable.Root>

			<Code code={EDITOR_PLAIN_TEXT} />
			<p class="mt-3 text-sm text-muted-foreground">
				Loads only <a
					href="https://tiptap.dev/docs/editor/extensions/nodes/document"
					class="font-mono underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
					target="_blank"
					rel="noopener noreferrer">Document</a
				>,
				<a
					href="https://tiptap.dev/docs/editor/extensions/nodes/text"
					class="font-mono underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
					target="_blank"
					rel="noopener noreferrer">Text</a
				>,
				<a
					href="https://tiptap.dev/docs/editor/extensions/functionality/history"
					class="font-mono underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
					target="_blank"
					rel="noopener noreferrer">History</a
				>, and
				<a
					href="https://tiptap.dev/docs/editor/extensions/functionality/placeholder"
					class="font-mono underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
					target="_blank"
					rel="noopener noreferrer">Placeholder</a
				>. No paragraph wrapping.
			</p>
		</Tabs.Content>

		<Tabs.Content value="multiline" class="mt-4">
			<div class="mb-3 flex items-center gap-2">
				<Badge variant="secondary">Paragraphs</Badge>
				<span class="text-sm text-muted-foreground">Subtitles, descriptions, bios</span>
			</div>

			<Editable.Root bind:data={multilineData} editing={multilineEditing}>
				{#snippet children({ save })}
					<Example
						bind:editing={multilineEditing}
						onsave={() => {
							save();
							multilineEditing = false;
						}}
					>
						<div class="text-muted-foreground">
							<Editable.Multiline bind:value={multilineData.subtitle} />
						</div>
					</Example>
				{/snippet}
			</Editable.Root>

			<Code code={EDITOR_MULTILINE} />
			<p class="mt-3 text-sm text-muted-foreground">
				Adds <a
					href="https://tiptap.dev/docs/editor/extensions/nodes/paragraph"
					class="font-mono underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
					target="_blank"
					rel="noopener noreferrer">Paragraph</a
				> to the plain set. Supports multiple paragraphs, no formatting marks.
			</p>
		</Tabs.Content>

		<Tabs.Content value="rich" class="mt-4">
			<div class="mb-3 flex items-center gap-2">
				<Badge variant="secondary">Full Editor</Badge>
				<span class="text-sm text-muted-foreground">Articles, blog posts, long-form</span>
			</div>

			<Editable.Root bind:data={richData} editing={richEditing}>
				{#snippet children({ state: s, save })}
					<Example
						bind:editing={richEditing}
						onsave={() => {
							save();
							richEditing = false;
						}}
					>
						{#if richEditing && s}
							<DocToolbar state={s} />
						{/if}
						<div class="text-muted-foreground">
							<Editable.Rich bind:value={richData.body} />
						</div>
					</Example>
				{/snippet}
			</Editable.Root>

			<Code code={EDITOR_RICH} />
			<p class="mt-3 text-sm text-muted-foreground">
				<a
					href="https://tiptap.dev/docs/editor/extensions/marks/bold"
					class="underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
					target="_blank"
					rel="noopener noreferrer">Bold</a
				>,
				<a
					href="https://tiptap.dev/docs/editor/extensions/marks/italic"
					class="underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
					target="_blank"
					rel="noopener noreferrer">Italic</a
				>,
				<a
					href="https://tiptap.dev/docs/editor/extensions/marks/underline"
					class="underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
					target="_blank"
					rel="noopener noreferrer">Underline</a
				>,
				<a
					href="https://tiptap.dev/docs/editor/extensions/marks/strike"
					class="underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
					target="_blank"
					rel="noopener noreferrer">Strike</a
				>,
				<a
					href="https://tiptap.dev/docs/editor/extensions/nodes/heading"
					class="underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
					target="_blank"
					rel="noopener noreferrer">Headings</a
				>
				(1-3),
				<a
					href="https://tiptap.dev/docs/editor/extensions/nodes/bullet-list"
					class="underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
					target="_blank"
					rel="noopener noreferrer">Lists</a
				>,
				<a
					href="https://tiptap.dev/docs/editor/extensions/nodes/blockquote"
					class="underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
					target="_blank"
					rel="noopener noreferrer">Blockquote</a
				>,
				<a
					href="https://tiptap.dev/docs/editor/extensions/marks/link"
					class="underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
					target="_blank"
					rel="noopener noreferrer">Links</a
				>,
				<a
					href="https://tiptap.dev/docs/editor/extensions/nodes/image"
					class="underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
					target="_blank"
					rel="noopener noreferrer">Images</a
				>, and
				<a
					href="https://tiptap.dev/docs/editor/extensions/functionality/history"
					class="underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
					target="_blank"
					rel="noopener noreferrer">History</a
				>.
			</p>
		</Tabs.Content>

		<Tabs.Content value="image" class="mt-4">
			<div class="mb-3 flex items-center gap-2">
				<Badge variant="secondary">Bring your own upload</Badge>
				<span class="text-sm text-muted-foreground">Hero images, avatars, thumbnails</span>
			</div>

			<Editable.Root bind:data={imageData} editing={imageEditing}>
				{#snippet children({ state: s, save })}
					<Example
						bind:editing={imageEditing}
						onsave={() => {
							save();
							imageEditing = false;
						}}
					>
						{#if imageEditing && s}
							<DocToolbar state={s} />
						{/if}
						<div class="aspect-video overflow-hidden rounded-lg">
							<Editable.Image bind:value={imageData.image} />
						</div>
					</Example>
				{/snippet}
			</Editable.Root>

			<Code code={EDITOR_IMAGE} />
			<p class="mt-3 text-sm text-muted-foreground">
				The document holds a single <code class="font-mono">image</code> node, and its
				<code class="font-mono">src</code> is whatever URL you put there — no picker, no cropper, no
				format conversion. Focusing the field selects the node, so a toolbar button can swap it with
				<code class="font-mono">setImage</code>. Size the field with your own CSS; an empty one
				renders a dashed placeholder.
			</p>
		</Tabs.Content>
	</Tabs.Root>
</section>

<Separator class="my-12" />

<!-- Multiple Data Sections -->
<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Many Fields, One Root</h2>
	<p class="mt-3 mb-6 text-muted-foreground">
		There is no per-section wrapper to nest. Put every field under one
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">Root</code>, bind each one at the
		property it edits, and arrays are an ordinary
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">{'{#each}'}</code>.
	</p>

	<Editable.Root editing={multiEditing}>
		{#snippet children({ state: s, save })}
			<Example
				bind:editing={multiEditing}
				onsave={() => {
					save();
					multiEditing = false;
				}}
			>
				{#if multiEditing && s}
					<DocToolbar state={s} />
				{/if}
				<h2 class="font-serif text-2xl tracking-tight">
					<Editable.Text bind:value={heroData.title} />
				</h2>
				<div class="mt-3 aspect-video overflow-hidden rounded-lg">
					<Editable.Image bind:value={heroData.image} />
				</div>

				<div class="mt-6 grid gap-4 sm:grid-cols-2">
					{#each notes as note (note)}
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

	<Code code={EDITOR_MULTIPLE_DATA} />
</section>
