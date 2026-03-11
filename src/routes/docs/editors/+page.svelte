<script lang="ts">
	import * as Editable from '$lib/components/editable/index.js';
	import type { ProseMirrorJSON } from '$lib/types/prosemirror.js';
	import type { ImageState } from '$lib/types.js';
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
	import type { EditableState } from '$lib/components/editable/editable-state.svelte.js';

	// Shared editing state for the variant demos
	let plainEditing = $state(false);
	let multilineEditing = $state(false);
	let richEditing = $state(false);
	let imageEditing = $state(false);
	let multiEditing = $state(false);

	let plainSave: (() => Promise<unknown>) | undefined = $state();
	let multilineSave: (() => Promise<unknown>) | undefined = $state();
	let richSave: (() => Promise<unknown>) | undefined = $state();
	let imageSave: (() => Promise<unknown>) | undefined = $state();
	let multiSave: (() => Promise<unknown>) | undefined = $state();

	let richState: EditableState | undefined = $state();
	let imageState: EditableState | undefined = $state();
	let multiState: EditableState | undefined = $state();

	let plainData: { title: ProseMirrorJSON } = $state({
		title: { type: 'doc', content: [{ type: 'text', text: 'An Editable Heading' }] }
	});

	let multilineData: { subtitle: ProseMirrorJSON } = $state({
		subtitle: {
			type: 'doc',
			content: [
				{
					type: 'paragraph',
					content: [
						{
							type: 'text',
							text: 'This is a multiline editor. It supports multiple paragraphs but no formatting marks.'
						}
					]
				},
				{
					type: 'paragraph',
					content: [{ type: 'text', text: 'Press Enter to create a new paragraph.' }]
				}
			]
		}
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

	let imageData: { image: ImageState } = $state({
		image: {
			src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=450&fit=crop',
			alt: 'Sunrise over mountain valley'
		}
	});

	let heroData: { title: ProseMirrorJSON; image: ImageState } = $state({
		title: { type: 'doc', content: [{ type: 'text', text: 'Hero Section' }] },
		image: {
			src: 'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=800&h=450&fit=crop',
			alt: 'Journal on a desk'
		}
	});

	let notes: { title: ProseMirrorJSON; body: ProseMirrorJSON }[] = $state([
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

			<Example
				bind:editing={plainEditing}
				onsave={() => {
					plainSave?.();
					plainEditing = false;
				}}
			>
				<Editable.Root editing={plainEditing}>
					{#snippet children({ save: saveFn })}
						{((plainSave = saveFn), '')}
						<Editable.Data
							key="plain"
							data={plainData}
							onsave={(d) => {
								if (d.title.type === 'text') plainData.title = d.title.content;
							}}
						>
							{#snippet children({ text })}
								<h2 class="font-serif text-2xl tracking-tight">
									{@render text('title')}
								</h2>
							{/snippet}
						</Editable.Data>
					{/snippet}
				</Editable.Root>
			</Example>

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

			<Example
				bind:editing={multilineEditing}
				onsave={() => {
					multilineSave?.();
					multilineEditing = false;
				}}
			>
				<Editable.Root editing={multilineEditing}>
					{#snippet children({ save: saveFn })}
						{((multilineSave = saveFn), '')}
						<Editable.Data
							key="multiline"
							data={multilineData}
							onsave={(d) => {
								if (d.subtitle.type === 'text') multilineData.subtitle = d.subtitle.content;
							}}
						>
							{#snippet children({ multiline })}
								<div class="text-muted-foreground">
									{@render multiline('subtitle')}
								</div>
							{/snippet}
						</Editable.Data>
					{/snippet}
				</Editable.Root>
			</Example>

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

			<Example
				bind:editing={richEditing}
				onsave={() => {
					richSave?.();
					richEditing = false;
				}}
			>
				<Editable.Root editing={richEditing}>
					{#snippet children({ state: s, save: saveFn })}
						{((richSave = saveFn), (richState = s), '')}
						{#if richEditing && richState}
							<DocToolbar state={richState} />
						{/if}
						<Editable.Data
							key="rich"
							data={richData}
							onsave={(d) => {
								if (d.body.type === 'text') richData.body = d.body.content;
							}}
						>
							{#snippet children({ rich })}
								<div class="text-muted-foreground">
									{@render rich('body')}
								</div>
							{/snippet}
						</Editable.Data>
					{/snippet}
				</Editable.Root>
			</Example>

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
				<Badge variant="secondary">Pan & Zoom</Badge>
				<span class="text-sm text-muted-foreground">Hero images, avatars, thumbnails</span>
			</div>

			<Example
				bind:editing={imageEditing}
				onsave={() => {
					imageSave?.();
					imageEditing = false;
				}}
			>
				<Editable.Root editing={imageEditing}>
					{#snippet children({ state: s, save: saveFn })}
						{((imageSave = saveFn), (imageState = s), '')}
						{#if imageEditing && imageState}
							<DocToolbar state={imageState} />
						{/if}
						<Editable.Data key="img" data={imageData}>
							{#snippet children({ image })}
								<div class="aspect-video overflow-hidden rounded-lg">
									{@render image('image', {
										maxWidth: 800,
										maxHeight: 450,
										quality: 0.85,
										aspect: 16 / 9
									})}
								</div>
							{/snippet}
						</Editable.Data>
					{/snippet}
				</Editable.Root>
			</Example>

			<Code code={EDITOR_IMAGE} />
			<p class="mt-3 text-sm text-muted-foreground">
				Click to upload, drag to pan, scroll to zoom. Exports WebP via <code class="font-mono"
					>OffscreenCanvas</code
				>. Set <code class="font-mono">aspect</code> to constrain the crop ratio.
			</p>
		</Tabs.Content>
	</Tabs.Root>
</section>

<Separator class="my-12" />

<!-- Multiple Data Sections -->
<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Multiple Data Sections</h2>
	<p class="mt-3 mb-6 text-muted-foreground">
		Nest multiple <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">Data</code>
		components under a single
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">Root</code>. Each gets a unique
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">key</code> and appears in the save
		map.
	</p>

	<Example
		bind:editing={multiEditing}
		onsave={() => {
			multiSave?.();
			multiEditing = false;
		}}
	>
		<Editable.Root editing={multiEditing}>
			{#snippet children({ state: s, save: saveFn })}
				{((multiSave = saveFn), (multiState = s), '')}
				{#if multiEditing && multiState}
					<DocToolbar state={multiState} />
				{/if}
				<Editable.Data key="hero" data={heroData}>
					{#snippet children({ text, image })}
						<h2 class="font-serif text-2xl tracking-tight">
							{@render text('title')}
						</h2>
						<div class="mt-3 aspect-video overflow-hidden rounded-lg">
							{@render image('image', {
								maxWidth: 800,
								maxHeight: 450,
								quality: 0.85,
								aspect: 16 / 9
							})}
						</div>
					{/snippet}
				</Editable.Data>

				<div class="mt-6 grid gap-4 sm:grid-cols-2">
					{#each notes as note, i}
						<Editable.Data key={`notes-${i}`} data={note}>
							{#snippet children({ text, multiline })}
								<div class="rounded-lg border border-border p-4">
									<h3 class="font-medium">{@render text('title')}</h3>
									<div class="mt-1 text-sm text-muted-foreground">
										{@render multiline('body')}
									</div>
								</div>
							{/snippet}
						</Editable.Data>
					{/each}
				</div>
			{/snippet}
		</Editable.Root>
	</Example>

	<Code code={EDITOR_MULTIPLE_DATA} />
</section>
