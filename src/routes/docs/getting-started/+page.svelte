<script lang="ts">
	import * as Editable from '$lib/components/editable/index.js';
	import type { ProseMirrorJSON } from '$lib/types/prosemirror.js';
	import type { ImageState } from '$lib/types.js';
	import Code from '../code.svelte';
	import Example from '../example.svelte';
	import { Separator } from '@routes/components/ui/separator/index.js';
	import DocToolbar from '../doc-toolbar.svelte';
	import type { EditableState } from '$lib/components/editable/editable-state.svelte.js';
	import { GETTING_STARTED } from '../examples.js';
	import * as Tabs from '@routes/components/ui/tabs/index.js';

	let editing = $state(false);
	let data: { title: ProseMirrorJSON; body: ProseMirrorJSON; image: ImageState } = $state({
		title: { type: 'doc', content: [{ type: 'text', text: 'Welcome to editable-kit' }] },
		body: {
			type: 'doc',
			content: [
				{
					type: 'paragraph',
					content: [
						{
							type: 'text',
							text: 'This is a complete working example. Toggle editing, change the text, and hit save. The content persists in component state.'
						}
					]
				}
			]
		},
		image: {
			src: 'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=800&h=450&fit=crop',
			alt: 'Open journal on a desk'
		}
	});

	let save: (() => Promise<unknown>) | undefined = $state();
</script>

<section class="mb-16">
	<p class="mb-4 text-xs font-medium tracking-[0.25em] text-muted-foreground uppercase">Setup</p>
	<h1 class="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">Getting Started</h1>
	<p class="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
		Install the package and set up your first editable page in minutes.
	</p>
</section>

<Separator class="my-12" />

<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Installation</h2>
	<p class="mt-3 text-muted-foreground">Install the package and its peer dependency.</p>
	<Tabs.Root value="pnpm" class="gap-0">
		<Tabs.List class="mb-0 h-7">
			<Tabs.Trigger value="pnpm" class="px-2 py-0.5 text-xs">pnpm</Tabs.Trigger>
			<Tabs.Trigger value="npm" class="px-2 py-0.5 text-xs">npm</Tabs.Trigger>
			<Tabs.Trigger value="yarn" class="px-2 py-0.5 text-xs">yarn</Tabs.Trigger>
			<Tabs.Trigger value="bun" class="px-2 py-0.5 text-xs">bun</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="pnpm">
			<Code lang="bash" code="pnpm add editable-kit svelte" />
		</Tabs.Content>
		<Tabs.Content value="npm">
			<Code lang="bash" code="npm install editable-kit svelte" />
		</Tabs.Content>
		<Tabs.Content value="yarn">
			<Code lang="bash" code="yarn add editable-kit svelte" />
		</Tabs.Content>
		<Tabs.Content value="bun">
			<Code lang="bash" code="bun add editable-kit svelte" />
		</Tabs.Content>
	</Tabs.Root>
</section>

<Separator class="my-12" />

<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Quick Start</h2>
	<p class="mt-3 mb-6 text-muted-foreground">
		A minimal example with a plain text editor, a rich text editor, and an image editor. Try the
		live version first, then see the code below.
	</p>

	<Example
		label="Quick Start Demo"
		bind:editing
		onsave={() => {
			save?.();
			editing = false;
		}}
	>
		<Editable.Root {editing}>
			{#snippet children({ state, save })}
				{#if editing && state}
					<DocToolbar {state} />
				{/if}
				<Editable.Data
					key="page"
					{data}
					onsave={(d) => {
						if (d.title.type === 'text') data.title = d.title.content;
						if (d.body.type === 'text') data.body = d.body.content;
					}}
				>
					{#snippet children({ text, rich, image })}
						<h2 class="font-serif text-2xl tracking-tight">
							{@render text('title')}
						</h2>
						<div class="mt-3 text-muted-foreground">{@render rich('body')}</div>
						<div class="mt-4 aspect-video overflow-hidden rounded-lg">
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

	<Code code={GETTING_STARTED} />
</section>
