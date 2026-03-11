<script lang="ts">
	import { Renderer } from '$lib/components/renderer/index.js';
	import type { ProseMirrorJSON } from '$lib/types/prosemirror.js';
	import { Separator } from '../../components/ui/separator/index.js';
	import Code from '../code.svelte';
	import { RENDERER_BASIC, RENDERER_OVERRIDES } from '../examples.js';

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
