<script lang="ts">
	import type { Extensions, Editor } from '@tiptap/core';
	import type { Snippet } from 'svelte';
	import {
		doc,
		paragraphs,
		codeBlock,
		image,
		defaultExtensions,
		type JSONContent
	} from '$lib/index.js';
	import * as Editable from '$lib/index.js';
	import { highlight } from '../highlight.js';
	import Example from '../example.svelte';

	let editing = $state(false);

	let content = $state(
		doc(
			paragraphs(
				'Hover a block to grab its drag handle, drop an image file anywhere in this editor, or edit the code below — Shiki keeps highlighting it as you type.'
			),
			codeBlock(
				"const post = { body: paragraphs('Edit me') };\nconsole.log(post.body.type); // 'doc'",
				'typescript'
			),
			image('https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=450&fit=crop', {
				alt: 'Sunrise over mountain valley'
			})
		)
	);

	// Dynamic imports keep every extension in the editor's lazy chunk — EkImage
	// included, which is why the kit is imported here a second time. The rich defaults
	// are just another entry in the same Promise.all, so they load in parallel with
	// TipTap and everything else rather than queueing behind it.
	async function load(): Promise<Extensions> {
		const [
			defaults,
			{ EkImage },
			{ Dropcursor },
			{ Gapcursor },
			{ CodeBlockShiki },
			{ DragHandle },
			{ FileHandler }
		] = await Promise.all([
			defaultExtensions('rich'),
			import('$lib/index.js'),
			import('@tiptap/extension-dropcursor'),
			import('@tiptap/extension-gapcursor'),
			import('tiptap-extension-code-block-shiki'),
			import('@tiptap/extension-drag-handle'),
			import('@tiptap/extension-file-handler')
		]);

		return [
			// Whatever this returns IS the list, so ask for the defaults too.
			...defaults,
			// The rich defaults are text only; these three are what make images work.
			EkImage,
			Dropcursor,
			Gapcursor,
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

	// Built only once `editing` flips, so read-only visitors fetch none of it.
	const extensions = $derived(editing ? load() : undefined);

	// ponytail: object URLs, so the demo needs no server. Real apps upload the file in
	// the toolbar and insert the URL it resolves to.
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
</script>

<!-- View mode never mounts TipTap, so the editor's Shiki extension cannot reach it.
	 This snippet is the view-mode half — same highlighter, same theme. -->
{#snippet codeBlockNode(node: JSONContent, _children: Snippet)}
	{@const code = Editable.textContent(node)}
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
			bind:value={content}
			{editing}
			options={{ extensions }}
			overrides={{ nodes: { codeBlockNode } }}
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
