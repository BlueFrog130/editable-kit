<script lang="ts">
	import * as Tabs from '../../components/ui/tabs/index.js';
	import { Separator } from '../../components/ui/separator/index.js';
	import Code from '../code.svelte';
	import Demo from './demo.svelte';
	import {
		EXT_PLACEHOLDER,
		EXT_EXTEND_DEFAULTS,
		EXT_REPLACE_ALL,
		EXT_CUSTOM,
		EXT_STATIC_IMPORT,
		EXT_DYNAMIC_IMPORT,
		EXT_CODE_BLOCK,
		EXT_HIGHLIGHT,
		EXT_BOLD_ONLY,
		EXT_AUGMENT_TYPES,
		EXT_AUGMENT_USE,
		EXT_COMPOSED_DEMO
	} from '../examples.js';
</script>

<section class="mb-16">
	<p class="mb-4 text-xs font-medium tracking-[0.25em] text-muted-foreground uppercase">
		Customization
	</p>
	<h1 class="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">Extensions</h1>
	<p class="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
		Swap, extend, or replace the default <a
			href="https://tiptap.dev/docs/editor/extensions"
			class="underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
			target="_blank"
			rel="noopener noreferrer">TipTap extension</a
		> set for any text editor.
	</p>
</section>

<Separator class="my-12" />

<!-- Default Extensions -->
<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Default Extensions</h2>
	<p class="mt-3 mb-6 text-muted-foreground">
		Each editor variant ships with a curated set of <a
			href="https://tiptap.dev/docs/editor/extensions"
			class="underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
			target="_blank"
			rel="noopener noreferrer">TipTap extensions</a
		>. The <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">text</code> snippet uses
		the plain set, <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">multiline</code>
		adds paragraph support, and
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">rich</code> includes the full formatting
		suite.
	</p>

	<Tabs.Root value="plain">
		<Tabs.List>
			<Tabs.Trigger value="plain">Plain Text</Tabs.Trigger>
			<Tabs.Trigger value="multiline">Multiline</Tabs.Trigger>
			<Tabs.Trigger value="rich">Rich Text</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="plain" class="mt-4">
			<p class="mb-4 text-sm text-muted-foreground">
				The minimal set for single-line input. The <a
					href="https://tiptap.dev/docs/editor/extensions/nodes/document"
					class="underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
					target="_blank"
					rel="noopener noreferrer">Document</a
				>
				schema is narrowed to
				<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">text*</code> so Enter is ignored
				and content stays on one line.
			</p>
			<div class="space-y-2">
				<div class="flex items-start gap-3 rounded-md border border-border px-3 py-2.5">
					<a
						href="https://tiptap.dev/docs/editor/extensions/nodes/document"
						class="shrink-0 font-mono text-sm font-medium underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
						target="_blank"
						rel="noopener noreferrer">Document</a
					>
					<span class="text-sm text-muted-foreground"
						>Top-level node. Schema set to <code class="font-mono text-xs">text*</code> to forbid paragraphs.</span
					>
				</div>
				<div class="flex items-start gap-3 rounded-md border border-border px-3 py-2.5">
					<a
						href="https://tiptap.dev/docs/editor/extensions/nodes/text"
						class="shrink-0 font-mono text-sm font-medium underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
						target="_blank"
						rel="noopener noreferrer">Text</a
					>
					<span class="text-sm text-muted-foreground"
						>The inline text node. Required by every editor.</span
					>
				</div>
				<div class="flex items-start gap-3 rounded-md border border-border px-3 py-2.5">
					<a
						href="https://tiptap.dev/docs/editor/extensions/functionality/history"
						class="shrink-0 font-mono text-sm font-medium underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
						target="_blank"
						rel="noopener noreferrer">History</a
					>
					<span class="text-sm text-muted-foreground"
						>Undo / redo support via <kbd
							class="rounded border border-border bg-muted px-1 py-0.5 text-xs">Ctrl+Z</kbd
						>.</span
					>
				</div>
				<div class="flex items-start gap-3 rounded-md border border-border px-3 py-2.5">
					<a
						href="https://tiptap.dev/docs/editor/extensions/functionality/placeholder"
						class="shrink-0 font-mono text-sm font-medium underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
						target="_blank"
						rel="noopener noreferrer">Placeholder</a
					>
					<span class="text-sm text-muted-foreground"
						>Shows ghost text when the editor is empty.</span
					>
				</div>
			</div>
		</Tabs.Content>

		<Tabs.Content value="multiline" class="mt-4">
			<p class="mb-4 text-sm text-muted-foreground">
				Extends the plain set with <a
					href="https://tiptap.dev/docs/editor/extensions/nodes/paragraph"
					class="underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
					target="_blank"
					rel="noopener noreferrer">Paragraph</a
				>. The Document schema becomes
				<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">paragraph+</code> so Enter creates
				new paragraphs, but no formatting marks are available.
			</p>
			<div class="space-y-2">
				<div class="flex items-start gap-3 rounded-md border border-border px-3 py-2.5">
					<a
						href="https://tiptap.dev/docs/editor/extensions/nodes/document"
						class="shrink-0 font-mono text-sm font-medium underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
						target="_blank"
						rel="noopener noreferrer">Document</a
					>
					<span class="text-sm text-muted-foreground"
						>Schema set to <code class="font-mono text-xs">paragraph+</code> &mdash; requires at least
						one paragraph.</span
					>
				</div>
				<div class="flex items-start gap-3 rounded-md border border-border px-3 py-2.5">
					<a
						href="https://tiptap.dev/docs/editor/extensions/nodes/paragraph"
						class="shrink-0 font-mono text-sm font-medium underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
						target="_blank"
						rel="noopener noreferrer">Paragraph</a
					>
					<span class="text-sm text-muted-foreground"
						>Block-level text container. Enables multi-paragraph content.</span
					>
				</div>
				<div class="flex items-start gap-3 rounded-md border border-border px-3 py-2.5">
					<a
						href="https://tiptap.dev/docs/editor/extensions/nodes/text"
						class="shrink-0 font-mono text-sm font-medium underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
						target="_blank"
						rel="noopener noreferrer">Text</a
					>
					<span class="text-sm text-muted-foreground">The inline text node.</span>
				</div>
				<div class="flex items-start gap-3 rounded-md border border-border px-3 py-2.5">
					<a
						href="https://tiptap.dev/docs/editor/extensions/functionality/history"
						class="shrink-0 font-mono text-sm font-medium underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
						target="_blank"
						rel="noopener noreferrer">History</a
					>
					<span class="text-sm text-muted-foreground">Undo / redo.</span>
				</div>
				<div class="flex items-start gap-3 rounded-md border border-border px-3 py-2.5">
					<a
						href="https://tiptap.dev/docs/editor/extensions/functionality/placeholder"
						class="shrink-0 font-mono text-sm font-medium underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
						target="_blank"
						rel="noopener noreferrer">Placeholder</a
					>
					<span class="text-sm text-muted-foreground">Ghost text when empty.</span>
				</div>
			</div>
		</Tabs.Content>

		<Tabs.Content value="rich" class="mt-4">
			<p class="mb-4 text-sm text-muted-foreground">
				The full editing suite. Includes everything from multiline plus marks, block types, lists,
				and media.
			</p>
			<div class="space-y-1">
				<p class="mb-2 text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
					Structure
				</p>
				<div class="space-y-2">
					<div class="flex items-start gap-3 rounded-md border border-border px-3 py-2.5">
						<a
							href="https://tiptap.dev/docs/editor/extensions/nodes/document"
							class="shrink-0 font-mono text-sm font-medium underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
							target="_blank"
							rel="noopener noreferrer">Document</a
						>
						<span class="text-sm text-muted-foreground">Top-level node with default schema.</span>
					</div>
					<div class="flex items-start gap-3 rounded-md border border-border px-3 py-2.5">
						<a
							href="https://tiptap.dev/docs/editor/extensions/nodes/paragraph"
							class="shrink-0 font-mono text-sm font-medium underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
							target="_blank"
							rel="noopener noreferrer">Paragraph</a
						>
						<span class="text-sm text-muted-foreground">Block-level text container.</span>
					</div>
					<div class="flex items-start gap-3 rounded-md border border-border px-3 py-2.5">
						<a
							href="https://tiptap.dev/docs/editor/extensions/nodes/text"
							class="shrink-0 font-mono text-sm font-medium underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
							target="_blank"
							rel="noopener noreferrer">Text</a
						>
						<span class="text-sm text-muted-foreground">Inline text node.</span>
					</div>
					<div class="flex items-start gap-3 rounded-md border border-border px-3 py-2.5">
						<a
							href="https://tiptap.dev/docs/editor/extensions/nodes/hard-break"
							class="shrink-0 font-mono text-sm font-medium underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
							target="_blank"
							rel="noopener noreferrer">HardBreak</a
						>
						<span class="text-sm text-muted-foreground"
							>Line break within a paragraph via <kbd
								class="rounded border border-border bg-muted px-1 py-0.5 text-xs">Shift+Enter</kbd
							>.</span
						>
					</div>
				</div>

				<p
					class="mt-4 mb-2 text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase"
				>
					Marks
				</p>
				<div class="space-y-2">
					<div class="flex items-start gap-3 rounded-md border border-border px-3 py-2.5">
						<a
							href="https://tiptap.dev/docs/editor/extensions/marks/bold"
							class="shrink-0 font-mono text-sm font-medium underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
							target="_blank"
							rel="noopener noreferrer">Bold</a
						>
						<span class="text-sm text-muted-foreground"
							><kbd class="rounded border border-border bg-muted px-1 py-0.5 text-xs">Ctrl+B</kbd
							></span
						>
					</div>
					<div class="flex items-start gap-3 rounded-md border border-border px-3 py-2.5">
						<a
							href="https://tiptap.dev/docs/editor/extensions/marks/italic"
							class="shrink-0 font-mono text-sm font-medium underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
							target="_blank"
							rel="noopener noreferrer">Italic</a
						>
						<span class="text-sm text-muted-foreground"
							><kbd class="rounded border border-border bg-muted px-1 py-0.5 text-xs">Ctrl+I</kbd
							></span
						>
					</div>
					<div class="flex items-start gap-3 rounded-md border border-border px-3 py-2.5">
						<a
							href="https://tiptap.dev/docs/editor/extensions/marks/underline"
							class="shrink-0 font-mono text-sm font-medium underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
							target="_blank"
							rel="noopener noreferrer">Underline</a
						>
						<span class="text-sm text-muted-foreground"
							><kbd class="rounded border border-border bg-muted px-1 py-0.5 text-xs">Ctrl+U</kbd
							></span
						>
					</div>
					<div class="flex items-start gap-3 rounded-md border border-border px-3 py-2.5">
						<a
							href="https://tiptap.dev/docs/editor/extensions/marks/strike"
							class="shrink-0 font-mono text-sm font-medium underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
							target="_blank"
							rel="noopener noreferrer">Strike</a
						>
						<span class="text-sm text-muted-foreground">Strikethrough text.</span>
					</div>
					<div class="flex items-start gap-3 rounded-md border border-border px-3 py-2.5">
						<a
							href="https://tiptap.dev/docs/editor/extensions/marks/link"
							class="shrink-0 font-mono text-sm font-medium underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
							target="_blank"
							rel="noopener noreferrer">Link</a
						>
						<span class="text-sm text-muted-foreground"
							>Hyperlinks. Configured with <code class="font-mono text-xs">autolink</code> and
							<code class="font-mono text-xs">linkOnPaste</code>; click-to-open disabled in edit
							mode.</span
						>
					</div>
				</div>

				<p
					class="mt-4 mb-2 text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase"
				>
					Block types
				</p>
				<div class="space-y-2">
					<div class="flex items-start gap-3 rounded-md border border-border px-3 py-2.5">
						<a
							href="https://tiptap.dev/docs/editor/extensions/nodes/heading"
							class="shrink-0 font-mono text-sm font-medium underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
							target="_blank"
							rel="noopener noreferrer">Heading</a
						>
						<span class="text-sm text-muted-foreground">Levels 1&ndash;3.</span>
					</div>
					<div class="flex items-start gap-3 rounded-md border border-border px-3 py-2.5">
						<a
							href="https://tiptap.dev/docs/editor/extensions/nodes/blockquote"
							class="shrink-0 font-mono text-sm font-medium underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
							target="_blank"
							rel="noopener noreferrer">Blockquote</a
						>
						<span class="text-sm text-muted-foreground">Quoted blocks.</span>
					</div>
					<div class="flex items-start gap-3 rounded-md border border-border px-3 py-2.5">
						<a
							href="https://tiptap.dev/docs/editor/extensions/nodes/bullet-list"
							class="shrink-0 font-mono text-sm font-medium underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
							target="_blank"
							rel="noopener noreferrer">BulletList</a
						>
						<span class="text-sm text-muted-foreground">Unordered lists.</span>
					</div>
					<div class="flex items-start gap-3 rounded-md border border-border px-3 py-2.5">
						<a
							href="https://tiptap.dev/docs/editor/extensions/nodes/ordered-list"
							class="shrink-0 font-mono text-sm font-medium underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
							target="_blank"
							rel="noopener noreferrer">OrderedList</a
						>
						<span class="text-sm text-muted-foreground">Numbered lists.</span>
					</div>
					<div class="flex items-start gap-3 rounded-md border border-border px-3 py-2.5">
						<a
							href="https://tiptap.dev/docs/editor/extensions/nodes/list-item"
							class="shrink-0 font-mono text-sm font-medium underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
							target="_blank"
							rel="noopener noreferrer">ListItem</a
						>
						<span class="text-sm text-muted-foreground"
							>Individual list entry. Required by both list types.</span
						>
					</div>
					<div class="flex items-start gap-3 rounded-md border border-border px-3 py-2.5">
						<a
							href="https://tiptap.dev/docs/editor/extensions/nodes/image"
							class="shrink-0 font-mono text-sm font-medium underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
							target="_blank"
							rel="noopener noreferrer">Image</a
						>
						<span class="text-sm text-muted-foreground"
							>Inline images within rich text content.</span
						>
					</div>
				</div>

				<p
					class="mt-4 mb-2 text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase"
				>
					Behavior
				</p>
				<div class="space-y-2">
					<div class="flex items-start gap-3 rounded-md border border-border px-3 py-2.5">
						<a
							href="https://tiptap.dev/docs/editor/extensions/functionality/history"
							class="shrink-0 font-mono text-sm font-medium underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
							target="_blank"
							rel="noopener noreferrer">History</a
						>
						<span class="text-sm text-muted-foreground">Undo / redo.</span>
					</div>
					<div class="flex items-start gap-3 rounded-md border border-border px-3 py-2.5">
						<a
							href="https://tiptap.dev/docs/editor/extensions/functionality/dropcursor"
							class="shrink-0 font-mono text-sm font-medium underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
							target="_blank"
							rel="noopener noreferrer">Dropcursor</a
						>
						<span class="text-sm text-muted-foreground"
							>Visual indicator when dragging content between blocks.</span
						>
					</div>
					<div class="flex items-start gap-3 rounded-md border border-border px-3 py-2.5">
						<a
							href="https://tiptap.dev/docs/editor/extensions/functionality/gapcursor"
							class="shrink-0 font-mono text-sm font-medium underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
							target="_blank"
							rel="noopener noreferrer">Gapcursor</a
						>
						<span class="text-sm text-muted-foreground"
							>Allows cursor placement in positions that are normally inaccessible (e.g. after an
							image).</span
						>
					</div>
					<div class="flex items-start gap-3 rounded-md border border-border px-3 py-2.5">
						<a
							href="https://tiptap.dev/docs/editor/extensions/functionality/placeholder"
							class="shrink-0 font-mono text-sm font-medium underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
							target="_blank"
							rel="noopener noreferrer">Placeholder</a
						>
						<span class="text-sm text-muted-foreground">Ghost text when empty.</span>
					</div>
				</div>
			</div>
		</Tabs.Content>
	</Tabs.Root>
</section>

<Separator class="my-12" />

<!-- Custom Extensions -->
<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">
		Custom <a
			href="https://tiptap.dev/docs/editor/extensions/custom-extensions"
			class="underline decoration-foreground/30 underline-offset-2 transition-colors hover:decoration-foreground"
			target="_blank"
			rel="noopener noreferrer">TipTap Extensions</a
		>
	</h2>
	<p class="mt-3 mb-6 text-muted-foreground">
		Every text snippet accepts a <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm"
			>TextEditorOptions</code
		>
		object as its second argument. Use it to swap, extend, or replace the default extension set.
	</p>

	<Tabs.Root value="placeholder">
		<Tabs.List>
			<Tabs.Trigger value="placeholder">Placeholder</Tabs.Trigger>
			<Tabs.Trigger value="extend">Extend Defaults</Tabs.Trigger>
			<Tabs.Trigger value="replace">Replace All</Tabs.Trigger>
			<Tabs.Trigger value="advanced">Custom Extension</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="placeholder" class="mt-4">
			<p class="mb-3 text-sm text-muted-foreground">
				Override placeholder text without touching extensions.
			</p>
			<Code code={EXT_PLACEHOLDER} />
		</Tabs.Content>

		<Tabs.Content value="extend" class="mt-4">
			<p class="mb-3 text-sm text-muted-foreground">
				Receive the defaults array and append your own extensions.
			</p>
			<Code code={EXT_EXTEND_DEFAULTS} />
		</Tabs.Content>

		<Tabs.Content value="replace" class="mt-4">
			<p class="mb-3 text-sm text-muted-foreground">
				Return a completely new array to replace every default extension.
			</p>
			<Code code={EXT_REPLACE_ALL} />
		</Tabs.Content>

		<Tabs.Content value="advanced" class="mt-4">
			<p class="mb-3 text-sm text-muted-foreground">
				Extend a built-in extension with custom attributes or keyboard shortcuts.
			</p>
			<Code code={EXT_CUSTOM} />
		</Tabs.Content>
	</Tabs.Root>

	<div class="mt-6 rounded-lg border border-border bg-muted/30 p-4">
		<p class="text-sm font-medium">TextEditorOptions</p>
		<div class="mt-3 space-y-2 font-mono text-sm text-muted-foreground">
			<p>
				<span class="text-foreground">extensions?</span>: (defaults: Extensions) =&gt; Extensions |
				Promise&lt;Extensions&gt;
			</p>
			<p><span class="text-foreground">placeholder?</span>: string</p>
			<p>
				<span class="text-foreground">oncreate?</span>: (editor:
				<a
					href="https://tiptap.dev/docs/editor/api/editor"
					class="underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
					target="_blank"
					rel="noopener noreferrer">Editor</a
				>) =&gt; void
			</p>
			<p>
				<span class="text-foreground">ondestroy?</span>: (editor:
				<a
					href="https://tiptap.dev/docs/editor/api/editor"
					class="underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
					target="_blank"
					rel="noopener noreferrer">Editor</a
				> | null) =&gt; void
			</p>
			<p>
				<span class="text-foreground">editorProps?</span>:
				<a
					href="https://tiptap.dev/docs/editor/api/editor#editor-props"
					class="underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
					target="_blank"
					rel="noopener noreferrer">EditorProps</a
				>
			</p>
		</div>
	</div>
</section>

<Separator class="my-12" />

<!-- Keeping the Bundle Small -->
<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Typing Your Own Nodes and Marks</h2>
	<p class="mt-3 text-sm leading-relaxed text-muted-foreground">
		An extension you add puts node and mark types in the document that this library has never heard
		of. They render — an unknown node renders its children, and you can hand it a snippet through
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono">overrides</code> — but the snippet
		receives TipTap's loose
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono">JSONContent</code>. Register the type and
		it receives yours instead.
	</p>

	<p class="mt-6 mb-3 text-sm text-muted-foreground">
		Augment <code class="rounded bg-muted px-1.5 py-0.5 font-mono">editable-kit/types</code>, the
		module that declares the two registries:
	</p>
	<Code code={EXT_AUGMENT_TYPES} />

	<p class="mt-6 mb-3 text-sm text-muted-foreground">
		Every override snippet for that key is now typed with your node, and
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono">PMNode</code> — so every
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono">content</code> array, and any document you
		hand-author — includes it.
	</p>
	<Code code={EXT_AUGMENT_USE} />

	<div class="mt-6 rounded-lg border border-border bg-muted/30 p-4">
		<p class="text-sm font-medium">Two rules</p>
		<ul class="mt-3 space-y-2 text-sm text-muted-foreground">
			<li>
				Key the entry by the extension's <code class="font-mono">name</code> — that is what TipTap writes
				into the document, and what the renderer looks up.
			</li>
			<li>
				Declare the node as a <code class="font-mono">type</code>, not an
				<code class="font-mono">interface</code>, so it stays assignable to TipTap's
				<code class="font-mono">JSONContent</code>.
			</li>
		</ul>
	</div>

	<p class="mt-6 text-sm leading-relaxed text-muted-foreground">
		Registering a type does not render it. For a node that maps cleanly to one element, add an entry
		to <code class="rounded bg-muted px-1.5 py-0.5 font-mono">nodeDefaults</code> or
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono">markDefaults</code>; for anything else,
		pass a snippet in <code class="rounded bg-muted px-1.5 py-0.5 font-mono">overrides</code>.
	</p>
</section>

<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Keeping the Bundle Small</h2>
	<p class="mt-3 mb-4 text-muted-foreground">
		editable-kit lazy-loads all TipTap code &mdash; nothing is fetched until a user toggles editing
		on. Custom extensions should follow the same pattern. If you import them statically at the top
		of your file, they get bundled into the page's initial JavaScript and load on every visit, even
		for users who never edit.
	</p>
	<p class="mb-6 text-muted-foreground">
		The <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">extensions</code> callback
		can be <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">async</code>, so you can
		use dynamic <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">import()</code> to keep
		custom extensions in the same lazy chunk as the editor. They'll only be fetched when the editor actually
		mounts.
	</p>

	<div class="grid gap-4 md:grid-cols-2">
		<div>
			<div class="mb-2 flex items-center gap-2">
				<span
					class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500/10 text-xs font-medium text-red-500"
					>✗</span
				>
				<span class="text-sm font-medium">Static import</span>
			</div>
			<Code code={EXT_STATIC_IMPORT} />
			<p class="mt-2 text-xs text-muted-foreground">
				Extensions are bundled into the page and loaded immediately, even for read-only visitors.
			</p>
		</div>
		<div>
			<div class="mb-2 flex items-center gap-2">
				<span
					class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-500/10 text-xs font-medium text-green-500"
					>✓</span
				>
				<span class="text-sm font-medium">Dynamic import</span>
			</div>
			<Code code={EXT_DYNAMIC_IMPORT} />
			<p class="mt-2 text-xs text-muted-foreground">
				Extensions are code-split into a separate chunk and only fetched when the editor mounts.
			</p>
		</div>
	</div>

	<div class="mt-6 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
		<p class="text-sm">
			<span class="font-medium">Why this matters.</span>
			<span class="text-muted-foreground">
				TipTap extensions depend on ProseMirror, which is a sizeable dependency tree. A single
				static <code class="font-mono text-xs">import</code> can pull in tens of kilobytes that your read-only
				visitors will download but never use. Dynamic imports keep the editing code behind the same lazy
				boundary that editable-kit already maintains for its own defaults.
			</span>
		</p>
	</div>
</section>

<Separator class="my-12" />

<!-- Three extensions at once -->
<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Three Extensions at Once</h2>
	<p class="mt-3 mb-6 text-muted-foreground">
		A rich field with <a
			href="https://tiptap.dev/docs/editor/extensions/functionality/drag-handle"
			class="underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
			target="_blank"
			rel="noopener noreferrer">DragHandle</a
		>,
		<a
			href="https://tiptap.dev/docs/editor/extensions/functionality/filehandler"
			class="underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
			target="_blank"
			rel="noopener noreferrer">FileHandler</a
		>
		for dropped images, and
		<a
			href="https://tiptap.dev/docs/editor/extensions/nodes/code-block"
			class="underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
			target="_blank"
			rel="noopener noreferrer">CodeBlock</a
		> — all three added in one async callback. Toggle editing, then drag a block by the handle on its
		left or drop an image file onto the editor.
	</p>

	<Demo />

	<div class="my-6 rounded-lg border border-border bg-muted/20 p-4">
		<p class="text-sm">
			<span class="font-medium">Highlighting takes two halves, one per mode.</span>
			<span class="text-muted-foreground">
				View mode never mounts TipTap, so an editor extension cannot reach it — that half is the
				<code class="font-mono text-xs">codeBlock</code> snippet in
				<code class="font-mono text-xs">overrides</code>. Edit mode is TipTap's, so that half is
				<code class="font-mono text-xs">CodeBlockShiki</code>. Point both at the same theme and the
				block looks identical whether or not you have clicked into it — and Shiki still ships only
				inside the lazy editor chunk.
			</span>
		</p>
	</div>

	<Code code={EXT_COMPOSED_DEMO} />
</section>

<Separator class="my-12" />

<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">More Examples</h2>
	<p class="mt-3 mb-6 text-muted-foreground">
		Common extension recipes. All examples use dynamic imports to keep the editing code lazy-loaded.
	</p>

	<Tabs.Root value="codeblock">
		<Tabs.List>
			<Tabs.Trigger value="codeblock">Code Blocks</Tabs.Trigger>
			<Tabs.Trigger value="highlight">Highlight</Tabs.Trigger>
			<Tabs.Trigger value="restrict">Restricting Marks</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="codeblock" class="mt-4">
			<p class="mb-3 text-sm text-muted-foreground">
				Add fenced code blocks with the official
				<a
					href="https://tiptap.dev/docs/editor/extensions/nodes/code-block"
					class="underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
					target="_blank"
					rel="noopener noreferrer">CodeBlock</a
				> extension.
			</p>
			<Code code={EXT_CODE_BLOCK} />
		</Tabs.Content>

		<Tabs.Content value="highlight" class="mt-4">
			<p class="mb-3 text-sm text-muted-foreground">
				Add text highlighting with the
				<a
					href="https://tiptap.dev/docs/editor/extensions/marks/highlight"
					class="underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
					target="_blank"
					rel="noopener noreferrer">Highlight</a
				> extension. Supports multiple colors.
			</p>
			<Code code={EXT_HIGHLIGHT} />
		</Tabs.Content>

		<Tabs.Content value="restrict" class="mt-4">
			<p class="mb-3 text-sm text-muted-foreground">
				Filter the defaults array to allow only specific formatting. Useful for restricted editing
				contexts.
			</p>
			<Code code={EXT_BOLD_ONLY} />
		</Tabs.Content>
	</Tabs.Root>
</section>
