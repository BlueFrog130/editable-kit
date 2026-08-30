<script lang="ts">
	import type { Extensions, Editor } from '@tiptap/core';
	import type { Snippet } from 'svelte';
	import * as Editable from '$lib/index.js';
	import type { JSONContent, ProseMirrorJSON } from '$lib/types/prosemirror.js';
	import { highlight } from '../highlight.js';
	import Example from '../example.svelte';

	let editing = $state(false);

	let doc: ProseMirrorJSON = $state({
		type: 'doc',
		content: [
			{
				type: 'paragraph',
				content: [
					{
						type: 'text',
						text: 'Hover a block to grab its drag handle, drop an image file anywhere in this editor, or edit the code below — Shiki keeps highlighting it as you type.'
					}
				]
			},
			{
				type: 'codeBlock',
				attrs: { language: 'typescript' },
				content: [
					{
						type: 'text',
						text: "const post = { body: paragraphs('Edit me') };\nconsole.log(post.body.type); // 'doc'"
					}
				]
			},
			...(Editable.image(
				'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=450&fit=crop',
				{ alt: 'Sunrise over mountain valley' }
			).content ?? [])
		]
	});

	// Dynamic imports keep all three extensions in the editor's lazy chunk.
	async function extensions(defaults: Extensions): Promise<Extensions> {
		const [{ CodeBlockShiki }, { DragHandle }, { FileHandler }] = await Promise.all([
			import('tiptap-extension-code-block-shiki'),
			import('@tiptap/extension-drag-handle'),
			import('@tiptap/extension-file-handler')
		]);

		return [
			...defaults,
			// Same theme the Renderer override uses, so the block does not change
			// appearance when you click into it.
			CodeBlockShiki.configure({ defaultTheme: 'github-light', defaultLanguage: 'typescript' }),
			DragHandle.configure({
				render: () => {
					const el = document.createElement('div');
					el.className = 'ek-drag-handle';
					return el;
				}
			}),
			FileHandler.configure({
				allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
				onDrop: (editor: Editor, files: File[], pos: number) => insert(editor, files, pos),
				onPaste: (editor: Editor, files: File[]) => insert(editor, files)
			})
		];
	}

	// ponytail: object URLs, so the demo needs no server. Real apps pass `upload` to the
	// field and insert the URL it resolves to.
	function insert(editor: Editor, files: File[], pos?: number) {
		const content = files.map((file) => ({
			type: 'image',
			attrs: { src: URL.createObjectURL(file), alt: file.name }
		}));
		editor
			.chain()
			.focus()
			.insertContentAt(pos ?? editor.state.selection.anchor, content)
			.run();
	}

	function codeOf(node: JSONContent) {
		return node.content?.map((child) => child.text ?? '').join('') ?? '';
	}
</script>

<!-- View mode never mounts TipTap, so the editor's Shiki extension cannot reach it.
	 This snippet is the view-mode half — same highlighter, same theme. -->
{#snippet codeBlock(node: JSONContent, _children: Snippet)}
	{@const code = codeOf(node)}
	{#await highlight(code, node.attrs?.language ?? 'typescript')}
		<pre class="ek-code"><code>{code}</code></pre>
	{:then html}
		{@html html}
	{:catch}
		<pre class="ek-code"><code>{code}</code></pre>
	{/await}
{/snippet}

<Example bind:editing label="Drag handle · image drop · Shiki code blocks">
	<div class="ek-demo prose prose-sm max-w-none pl-6">
		<Editable.Rich
			bind:value={doc}
			{editing}
			options={{ extensions }}
			overrides={{ nodes: { codeBlock } }}
		/>
	</div>
</Example>

<style>
	.ek-demo {
		/* floating-ui appends the handle here, absolutely positioned. */
		position: relative;
	}

	/* The handle is created with `document.createElement`, so it is outside this
	   component's scope. */
	.ek-demo :global(.ek-drag-handle) {
		width: 1rem;
		height: 1.5rem;
		margin-right: 0.25rem;
		border-radius: 0.25rem;
		background: radial-gradient(currentColor 1px, transparent 1px) 0 0 / 5px 5px;
		color: var(--color-muted-foreground);
		cursor: grab;
		opacity: 0.6;
	}

	.ek-demo :global(.ek-drag-handle:active) {
		cursor: grabbing;
	}

	/* Tailwind Typography paints `pre` dark. Shiki overrides that with an inline
	   background once it has tokenized, so without this the block flashes dark on
	   every mount — including the one that happens when you click in to edit. */
	.ek-demo :global(pre) {
		overflow-x: auto;
		border-radius: 0.5rem;
		border: 1px solid var(--color-border);
		background: var(--color-background);
		padding: 0.75rem 1rem;
		font-size: 13px;
		color: var(--color-foreground);
	}

	.ek-demo :global(img) {
		border-radius: 0.5rem;
	}
</style>
