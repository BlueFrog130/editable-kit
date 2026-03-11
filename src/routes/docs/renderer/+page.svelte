<script lang="ts">
	import * as Editable from '$lib/components/editable/index.js';
	import { Renderer } from '$lib/components/renderer/index.js';
	import type { ProseMirrorJSON } from '$lib/types/prosemirror.js';
	import { Separator } from '../../components/ui/separator/index.js';
	import Code from '../code.svelte';
	import Example from '../example.svelte';
	import {
		RENDERER_BASIC,
		RENDERER_OVERRIDES,
		RENDERER_NODE_SIGNATURES,
		RENDERER_MARK_SIGNATURES,
		RENDERER_EDITABLE_DATA
	} from '../examples.js';

	const sampleDoc: ProseMirrorJSON = {
		type: 'doc',
		content: [
			{
				type: 'heading',
				attrs: { level: 2 },
				content: [{ type: 'text', text: 'Hello from the Renderer' }]
			},
			{
				type: 'paragraph',
				content: [
					{ type: 'text', text: 'This content is rendered ' },
					{ type: 'text', text: 'without loading TipTap', marks: [{ type: 'bold' }] },
					{
						type: 'text',
						text: '. The Renderer component converts ProseMirrorJSON directly to HTML using Svelte components.'
					}
				]
			},
			{
				type: 'paragraph',
				content: [
					{ type: 'text', text: 'It supports ' },
					{ type: 'text', text: 'bold', marks: [{ type: 'bold' }] },
					{ type: 'text', text: ', ' },
					{ type: 'text', text: 'italic', marks: [{ type: 'italic' }] },
					{ type: 'text', text: ', ' },
					{ type: 'text', text: 'underline', marks: [{ type: 'underline' }] },
					{ type: 'text', text: ', ' },
					{ type: 'text', text: 'strikethrough', marks: [{ type: 'strike' }] },
					{ type: 'text', text: ', and ' },
					{
						type: 'text',
						text: 'links',
						marks: [{ type: 'link', attrs: { href: 'https://svelte.dev' } }]
					},
					{ type: 'text', text: '.' }
				]
			},
			{
				type: 'bulletList',
				content: [
					{
						type: 'listItem',
						content: [
							{
								type: 'paragraph',
								content: [{ type: 'text', text: 'Zero TipTap dependency at runtime' }]
							}
						]
					},
					{
						type: 'listItem',
						content: [
							{
								type: 'paragraph',
								content: [{ type: 'text', text: 'Perfect for SSR and static pages' }]
							}
						]
					},
					{
						type: 'listItem',
						content: [
							{
								type: 'paragraph',
								content: [{ type: 'text', text: 'Fully customizable via snippet overrides' }]
							}
						]
					}
				]
			}
		]
	};

	// Editable.Data demo state
	let editableEditing = $state(false);
	let editableSave: (() => Promise<unknown>) | undefined = $state();

	let editableData: { title: ProseMirrorJSON; body: ProseMirrorJSON } = $state({
		title: {
			type: 'doc',
			content: [{ type: 'text', text: 'Editable Post Title' }]
		},
		body: {
			type: 'doc',
			content: [
				{
					type: 'paragraph',
					content: [
						{ type: 'text', text: 'This rich text body uses ' },
						{ type: 'text', text: 'custom overrides', marks: [{ type: 'bold' }] },
						{
							type: 'text',
							text: ' that apply in both read-only and editing modes. Try editing to see the overrides persist. Visit '
						},
						{
							type: 'text',
							text: 'Svelte',
							marks: [{ type: 'link', attrs: { href: 'https://svelte.dev' } }]
						},
						{ type: 'text', text: ' for more.' }
					]
				}
			]
		}
	});

	const overrideDoc: ProseMirrorJSON = {
		type: 'doc',
		content: [
			{
				type: 'heading',
				attrs: { level: 2 },
				content: [{ type: 'text', text: 'Custom Rendered Heading' }]
			},
			{
				type: 'paragraph',
				content: [
					{ type: 'text', text: 'This paragraph has a ' },
					{
						type: 'text',
						text: 'custom styled link',
						marks: [{ type: 'link', attrs: { href: 'https://svelte.dev' } }]
					},
					{
						type: 'text',
						text: ' rendered with overrides. The heading above has an auto-generated id anchor.'
					}
				]
			}
		]
	};
</script>

<section class="mb-16">
	<p class="mb-4 text-xs font-medium tracking-[0.25em] text-muted-foreground uppercase">Display</p>
	<h1 class="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">Renderer</h1>
	<p class="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
		Render <a
			href="https://tiptap.dev/docs/editor/core-concepts/schema"
			class="underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
			target="_blank"
			rel="noopener noreferrer">ProseMirrorJSON</a
		>
		to HTML without loading
		<a
			href="https://tiptap.dev/docs/editor"
			class="underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
			target="_blank"
			rel="noopener noreferrer">TipTap</a
		>. Use for read-only views, SSR, or email templates.
	</p>
</section>

<Separator class="my-12" />

<!-- Renderer -->
<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Basic Usage</h2>
	<p class="mt-3 mb-6 text-muted-foreground">
		The Renderer takes a <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm"
			>ProseMirrorJSON</code
		>
		document and outputs HTML. No
		<a
			href="https://tiptap.dev/docs/editor"
			class="underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
			target="_blank"
			rel="noopener noreferrer">TipTap</a
		> is loaded — this is pure Svelte rendering.
	</p>

	<div class="my-6 overflow-hidden rounded-lg border border-border">
		<div class="border-b border-border bg-muted/30 px-4 py-2">
			<p class="text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
				Rendered Output
			</p>
		</div>
		<div class="p-6">
			<Renderer doc={sampleDoc} />
		</div>
	</div>

	<Code code={RENDERER_BASIC} />
</section>

<Separator class="my-12" />

<!-- Custom Overrides -->
<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Custom Overrides</h2>
	<p class="mt-3 mb-4 text-sm text-muted-foreground">
		Override how any node or mark is rendered using Svelte 5 snippets. The example below adds
		auto-generated id anchors to headings and custom link styling.
	</p>

	{#snippet heading(
		node: import('$lib/types/prosemirror.js').HeadingNode,
		children: import('svelte').Snippet
	)}
		<h2
			id={node.content?.[0]?.type === 'text'
				? node.content[0].text.toLowerCase().replaceAll(' ', '-')
				: undefined}
			class="font-serif text-xl tracking-tight text-foreground"
		>
			{@render children()}
		</h2>
	{/snippet}

	{#snippet link(
		mark: import('$lib/types/prosemirror.js').LinkMark,
		children: import('svelte').Snippet
	)}
		<a
			href={mark.attrs.href}
			class="font-medium text-blue-600 underline decoration-blue-600/30 underline-offset-2 hover:decoration-blue-600"
			target="_blank"
			rel="noopener noreferrer"
		>
			{@render children()}
		</a>
	{/snippet}

	<div class="my-6 overflow-hidden rounded-lg border border-border">
		<div class="border-b border-border bg-muted/30 px-4 py-2">
			<p class="text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
				With Overrides
			</p>
		</div>
		<div class="p-6">
			<Renderer doc={overrideDoc} overrides={{ nodes: { heading }, marks: { link } }} />
		</div>
	</div>

	<Code code={RENDERER_OVERRIDES} />

	<div class="mt-6 rounded-lg border border-border bg-muted/30 p-4">
		<p class="text-sm font-medium">Available Overrides</p>
		<div class="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
			<div>
				<p class="font-medium text-foreground">Nodes</p>
				<p class="font-mono">
					paragraph, heading, blockquote, bulletList, orderedList, listItem, image, hardBreak
				</p>
			</div>
			<div>
				<p class="font-medium text-foreground">Marks</p>
				<p class="font-mono">bold, italic, underline, strike, link</p>
			</div>
		</div>
	</div>
</section>

<Separator class="my-12" />

<!-- Overrides with Editable.Data -->
<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Overrides with Editable.Data</h2>
	<p class="mt-3 mb-4 text-sm text-muted-foreground">
		The <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">Editable.Data</code>
		component accepts the same
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">overrides</code> prop. When not
		editing, the component uses the Renderer internally — your overrides apply to both the read-only
		display and the loading state while TipTap initializes.
	</p>

	{#snippet editableHeading(
		node: import('$lib/types/prosemirror.js').HeadingNode,
		children: import('svelte').Snippet
	)}
		<h1 class="font-serif text-3xl tracking-tight text-foreground">
			{@render children()}
		</h1>
	{/snippet}

	{#snippet editableLink(
		mark: import('$lib/types/prosemirror.js').LinkMark,
		children: import('svelte').Snippet
	)}
		<a
			href={mark.attrs.href}
			class="font-medium text-emerald-600 underline decoration-emerald-600/30 underline-offset-2 hover:decoration-emerald-600"
			target="_blank"
			rel="noopener noreferrer"
		>
			{@render children()}
		</a>
	{/snippet}

	{#snippet editableBold(
		_mark: import('$lib/types/prosemirror.js').BoldMark,
		children: import('svelte').Snippet
	)}
		<strong class="font-semibold text-foreground">{@render children()}</strong>
	{/snippet}

	<Example
		label="Editable with Overrides"
		bind:editing={editableEditing}
		onsave={() => {
			editableSave?.();
			editableEditing = false;
		}}
	>
		<Editable.Root editing={editableEditing}>
			{#snippet children({ save: saveFn })}
				{((editableSave = saveFn), '')}
				<Editable.Data
					key="post"
					data={editableData}
					overrides={{
						nodes: { heading: editableHeading },
						marks: { link: editableLink, bold: editableBold }
					}}
				>
					{#snippet children({ text, rich })}
						<div class="space-y-4">
							{@render text('title', undefined, 'Post title')}
							{@render rich('body', undefined, 'Post body')}
						</div>
					{/snippet}
				</Editable.Data>
			{/snippet}
		</Editable.Root>
	</Example>

	<Code code={RENDERER_EDITABLE_DATA} />

	<div class="mt-4 rounded-lg border border-border bg-muted/30 p-4">
		<p class="text-sm font-medium">How it works</p>
		<ul class="mt-3 space-y-1.5 text-sm text-muted-foreground">
			<li>
				When <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">editing</code> is
				<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">false</code>, each editor
				field renders through the Renderer with your overrides
			</li>
			<li>
				When <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">editing</code> becomes
				<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">true</code>, TipTap loads
				and replaces the rendered output — overrides are shown during the loading state
			</li>
			<li>
				Define overrides once and pass them to <code
					class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">Editable.Data</code
				> — no need to use the Renderer directly
			</li>
		</ul>
	</div>
</section>

<Separator class="my-12" />

<!-- Node Override Signatures -->
<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Node Override Signatures</h2>
	<p class="mt-3 mb-4 text-sm text-muted-foreground">
		Each node override is a Svelte 5 snippet. Nodes that contain children (paragraphs, headings,
		lists, etc.) receive the node data and a <code
			class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">children</code
		>
		snippet you must render. Leaf nodes like
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">image</code>
		and <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">hardBreak</code> only receive
		the node data.
	</p>
	<p class="mb-6 text-sm text-muted-foreground">
		Pass node overrides via <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm"
			>overrides.nodes</code
		>. Any node without an override falls back to the default HTML element.
	</p>

	<Code code={RENDERER_NODE_SIGNATURES} />

	<div class="mt-4 rounded-lg border border-border bg-muted/30 p-4">
		<p class="text-sm font-medium">Node Types Reference</p>
		<div class="mt-3 space-y-2 text-sm text-muted-foreground">
			<div class="grid grid-cols-[8rem_1fr] gap-2">
				<code class="font-mono text-foreground">paragraph</code>
				<span>Block text container. Default: <code class="font-mono">&lt;p&gt;</code></span>
			</div>
			<div class="grid grid-cols-[8rem_1fr] gap-2">
				<code class="font-mono text-foreground">heading</code>
				<span
					>Has <code class="font-mono">attrs.level</code> (1-3). Default:
					<code class="font-mono">&lt;h1&gt;</code>-<code class="font-mono">&lt;h3&gt;</code
					></span
				>
			</div>
			<div class="grid grid-cols-[8rem_1fr] gap-2">
				<code class="font-mono text-foreground">blockquote</code>
				<span>Default: <code class="font-mono">&lt;blockquote&gt;</code></span>
			</div>
			<div class="grid grid-cols-[8rem_1fr] gap-2">
				<code class="font-mono text-foreground">bulletList</code>
				<span>Default: <code class="font-mono">&lt;ul&gt;</code></span>
			</div>
			<div class="grid grid-cols-[8rem_1fr] gap-2">
				<code class="font-mono text-foreground">orderedList</code>
				<span
					>Has optional <code class="font-mono">attrs.start</code>. Default:
					<code class="font-mono">&lt;ol&gt;</code></span
				>
			</div>
			<div class="grid grid-cols-[8rem_1fr] gap-2">
				<code class="font-mono text-foreground">listItem</code>
				<span>Default: <code class="font-mono">&lt;li&gt;</code></span>
			</div>
			<div class="grid grid-cols-[8rem_1fr] gap-2">
				<code class="font-mono text-foreground">image</code>
				<span
					>Leaf node. Has <code class="font-mono">attrs.src</code>,
					<code class="font-mono">alt</code>,
					<code class="font-mono">title</code>. Default:
					<code class="font-mono">&lt;img&gt;</code></span
				>
			</div>
			<div class="grid grid-cols-[8rem_1fr] gap-2">
				<code class="font-mono text-foreground">hardBreak</code>
				<span>Leaf node. Default: <code class="font-mono">&lt;br&gt;</code></span>
			</div>
		</div>
	</div>
</section>

<Separator class="my-12" />

<!-- Mark Override Signatures -->
<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Mark Override Signatures</h2>
	<p class="mt-3 mb-4 text-sm text-muted-foreground">
		Mark overrides customize how inline formatting is rendered. Each receives the mark data and a
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">children</code> snippet for the
		wrapped content. Marks can be nested (e.g. bold inside a link), so always render the children snippet.
	</p>
	<p class="mb-6 text-sm text-muted-foreground">
		Pass mark overrides via <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm"
			>overrides.marks</code
		>.
	</p>

	<Code code={RENDERER_MARK_SIGNATURES} />

	<div class="mt-4 rounded-lg border border-border bg-muted/30 p-4">
		<p class="text-sm font-medium">Mark Types Reference</p>
		<div class="mt-3 space-y-2 text-sm text-muted-foreground">
			<div class="grid grid-cols-[8rem_1fr] gap-2">
				<code class="font-mono text-foreground">bold</code>
				<span>No attrs. Default: <code class="font-mono">&lt;strong&gt;</code></span>
			</div>
			<div class="grid grid-cols-[8rem_1fr] gap-2">
				<code class="font-mono text-foreground">italic</code>
				<span>No attrs. Default: <code class="font-mono">&lt;em&gt;</code></span>
			</div>
			<div class="grid grid-cols-[8rem_1fr] gap-2">
				<code class="font-mono text-foreground">underline</code>
				<span>No attrs. Default: <code class="font-mono">&lt;u&gt;</code></span>
			</div>
			<div class="grid grid-cols-[8rem_1fr] gap-2">
				<code class="font-mono text-foreground">strike</code>
				<span>No attrs. Default: <code class="font-mono">&lt;s&gt;</code></span>
			</div>
			<div class="grid grid-cols-[8rem_1fr] gap-2">
				<code class="font-mono text-foreground">link</code>
				<span
					>Has <code class="font-mono">attrs.href</code>,
					<code class="font-mono">target?</code>,
					<code class="font-mono">rel?</code>,
					<code class="font-mono">class?</code>. Default:
					<code class="font-mono">&lt;a&gt;</code></span
				>
			</div>
		</div>
	</div>
</section>
