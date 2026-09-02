<script lang="ts">
	import { Badge } from '@routes/components/ui/badge/index.js';
	import { Separator } from '@routes/components/ui/separator/index.js';
	import Code from '../../code.svelte';
	import {
		API_ROOT_SAVE,
		API_FIELD_VALUE,
		API_EDITABLE_STATE,
		API_DIRTY_RESET,
		API_DOC_HELPERS
	} from '../../examples.js';
</script>

<section class="mb-16">
	<p class="mb-4 text-xs font-medium tracking-[0.25em] text-muted-foreground uppercase">
		Reference
	</p>
	<h1 class="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">API Reference</h1>
	<p class="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
		Complete prop and method reference for all exported components and classes.
	</p>
</section>

<Separator class="my-12" />

<section class="mb-16">
	<div class="space-y-6">
		<!-- Root -->
		<div class="rounded-lg border border-border p-5">
			<div class="flex items-center gap-2">
				<h3 class="font-mono text-base font-medium">{'<'}Root{'>'}</h3>
				<Badge variant="outline">Component</Badge>
				<Badge variant="secondary">Generic</Badge>
			</div>
			<p class="mt-3 text-sm text-muted-foreground">
				Shared editing state for every field beneath it: one editing flag, one toolbar, one save,
				one reset.
			</p>
			<div class="mt-4 space-y-2 text-sm">
				<div class="flex gap-4">
					<code class="w-32 shrink-0 font-mono text-foreground">editing</code>
					<span class="text-muted-foreground"
						><code class="font-mono">boolean</code> — Toggles editing mode for all nested fields.</span
					>
				</div>
				<div class="flex gap-4">
					<code class="w-32 shrink-0 font-mono text-foreground">data?</code>
					<span class="text-muted-foreground"
						><code class="font-mono">T</code> — Bindable. Your content object. Supply it to get
						<code class="font-mono">reset()</code> and to have it handed to
						<code class="font-mono">onsave</code>.</span
					>
				</div>
				<div class="flex gap-4">
					<code class="w-32 shrink-0 font-mono text-foreground">overrides?</code>
					<span class="text-muted-foreground"
						><code class="font-mono">NodeOverrides</code> — Default render overrides for every field inside.
						Fields merge their own over these.</span
					>
				</div>
				<div class="flex gap-4">
					<code class="w-32 shrink-0 font-mono text-foreground">options?</code>
					<span class="text-muted-foreground"
						><code class="font-mono">TextEditorOptions</code> — Default editor options for every field
						inside — configure TipTap extensions once here. Fields merge their own over these.</span
					>
				</div>
				<div class="flex gap-4">
					<code class="w-32 shrink-0 font-mono text-foreground">onsave?</code>
					<span class="text-muted-foreground"
						><code class="font-mono">(data: T) =&gt; MaybePromise&lt;void&gt;</code> — Receives a
						plain snapshot of <code class="font-mono">data</code>.</span
					>
				</div>
				<div class="flex gap-4">
					<code class="w-32 shrink-0 font-mono text-foreground">children</code>
					<span class="text-muted-foreground"
						>Snippet receiving
						<code class="font-mono">{`{ state, save, reset, editing, saveStatus, dirty }`}</code
						></span
					>
				</div>
			</div>
		</div>

		<!-- Fields -->
		<div class="rounded-lg border border-border p-5">
			<div class="flex items-center gap-2">
				<h3 class="font-mono text-base font-medium">
					{'<'}Text{'>'}
					{'<'}Multiline{'>'}
					{'<'}Rich{'>'}
					{'<'}Image{'>'}
				</h3>
				<Badge variant="outline">Components</Badge>
			</div>
			<p class="mt-3 text-sm text-muted-foreground">
				The four field variants. Each binds directly at the property it edits and works with or
				without <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">Root</code>.
			</p>
			<div class="mt-4 space-y-2 text-sm">
				<div class="flex gap-4">
					<code class="w-32 shrink-0 font-mono text-foreground">value</code>
					<span class="text-muted-foreground"
						>Bindable. A <code class="font-mono">ProseMirrorJSON</code> document, for every variant
						including <code class="font-mono">Image</code>. Syncs on blur.</span
					>
				</div>
				<div class="flex gap-4">
					<code class="w-32 shrink-0 font-mono text-foreground">editing?</code>
					<span class="text-muted-foreground"
						><code class="font-mono">boolean</code> — Falls back to the surrounding
						<code class="font-mono">Root</code>.</span
					>
				</div>
				<div class="flex gap-4">
					<code class="w-32 shrink-0 font-mono text-foreground">options?</code>
					<span class="text-muted-foreground"
						><code class="font-mono">TextEditorOptions</code> — TipTap configuration: placeholder,
						extensions, <code class="font-mono">oncreate</code>,
						<code class="font-mono">editorProps</code>.</span
					>
				</div>
				<div class="flex gap-4">
					<code class="w-32 shrink-0 font-mono text-foreground">overrides?</code>
					<span class="text-muted-foreground"
						><code class="font-mono">NodeOverrides</code> — Merged over
						<code class="font-mono">Root</code>'s overrides, per node/mark type.</span
					>
				</div>
				<div class="flex gap-4">
					<code class="w-32 shrink-0 font-mono text-foreground">class?</code>
					<span class="text-muted-foreground"
						>Applied to <code class="font-mono">[data-ek-field]</code> — the same element in both modes.</span
					>
				</div>
			</div>
			<p class="mt-4 text-sm text-muted-foreground">
				<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">{'<'}Field{'>'}</code> is the
				same component with an explicit
				<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">variant</code> prop, for when the
				variant is chosen at runtime.
			</p>
		</div>

		<!-- Renderer -->
		<div class="rounded-lg border border-border p-5">
			<div class="flex items-center gap-2">
				<h3 class="font-mono text-base font-medium">{'<'}Renderer{'>'}</h3>
				<Badge variant="outline">Component</Badge>
			</div>
			<div class="mt-4 space-y-2 text-sm">
				<div class="flex gap-4">
					<code class="w-32 shrink-0 font-mono text-foreground">doc</code>
					<span class="text-muted-foreground"
						><code class="font-mono">ProseMirrorJSON</code> — The document to render.</span
					>
				</div>
				<div class="flex gap-4">
					<code class="w-32 shrink-0 font-mono text-foreground">overrides?</code>
					<span class="text-muted-foreground"
						><code class="font-mono">NodeOverrides</code> — Override any node or mark type, built-in
						or from an extension you added. Merged over <code class="font-mono">Root</code>'s
						overrides when inside one.</span
					>
				</div>
			</div>
		</div>

		<!-- EditableState -->
		<div class="rounded-lg border border-border p-5">
			<div class="flex items-center gap-2">
				<h3 class="font-mono text-base font-medium">EditableState</h3>
				<Badge variant="outline">Class</Badge>
			</div>
			<div class="mt-4 space-y-2 text-sm">
				<div class="flex gap-4">
					<code class="w-32 shrink-0 font-mono text-foreground">.active</code>
					<span class="text-muted-foreground"
						><code class="font-mono">Editable | undefined</code> — Currently focused editor.</span
					>
				</div>
				<div class="flex gap-4">
					<code class="w-32 shrink-0 font-mono text-foreground">.command()</code>
					<span class="text-muted-foreground">Create a reactive toolbar command object.</span>
				</div>
				<div class="flex gap-4">
					<code class="w-32 shrink-0 font-mono text-foreground">.text(fn)</code>
					<span class="text-muted-foreground"
						>Run a function against the active <a
							href="https://tiptap.dev/docs/editor/api/editor"
							class="underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
							target="_blank"
							rel="noopener noreferrer">TipTap Editor</a
						>.</span
					>
				</div>
			</div>
		</div>
	</div>
</section>

<Separator class="my-12" />

<!-- Saving -->
<section class="mb-16">
	<p class="mb-4 text-xs font-medium tracking-[0.25em] text-muted-foreground uppercase">
		Data Flow
	</p>
	<h2 class="font-serif text-2xl tracking-tight">Saving</h2>
	<p class="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
		There is no save payload type. Fields write into the object you bound, and
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">onsave</code>
		receives a plain snapshot of it.
	</p>
	<Code code={API_ROOT_SAVE} />

	<div class="mt-6 rounded-lg border border-border bg-muted/30 p-4">
		<p class="text-sm leading-relaxed text-muted-foreground">
			<strong class="text-foreground">Text fields sync on blur, not per keystroke.</strong> Reading
			your data while a field is focused gives its value as of the last blur — a deliberate trade so
			typing costs nothing. <code class="font-mono">save()</code> flushes the focused field before
			<code class="font-mono">onsave</code> runs, so what you persist is always current.
		</p>
	</div>
</section>

<Separator class="my-12" />

<!-- Field values -->
<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Field Values</h2>
	<p class="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
		Every variant reads and writes the same thing: a
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">ProseMirrorJSON</code> document.
		Images are a document holding one
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">image</code> node — TipTap's own shape
		— so nothing is projected in or out, and attributes the editor keeps (title, intrinsic width and height)
		survive a round trip instead of being flattened away.
	</p>
	<Code code={API_FIELD_VALUE} lang="typescript" />
</section>

<Separator class="my-12" />

<!-- Document helpers -->
<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Document Helpers</h2>
	<p class="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">text()</code> and
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">paragraphs()</code> build the two
		document shapes the fields expect, so adding an item to a list is a one-liner. Both handle the
		empty case correctly &mdash; a hand-written
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm"
			>&#123; type: 'text', text: '' &#125;</code
		>
		is rejected by ProseMirror, and only when the editor mounts.
	</p>
	<Code code={API_DOC_HELPERS} lang="typescript" />
</section>

<Separator class="my-12" />

<!-- Dirty & Reset -->
<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Dirty &amp; Reset</h2>
	<p class="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">dirty</code> compares values, not
		focus events, so a field that mounts and unmounts untouched does not flag the form.
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">reset()</code> restores the
		snapshot Root took when editing turned on. Both clear on a successful save; a failed save leaves
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">dirty</code> set so nothing is lost.
	</p>
	<Code code={API_DIRTY_RESET} />
</section>

<Separator class="my-12" />

<!-- EditableState in Depth -->
<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">EditableState in Depth</h2>
	<p class="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">EditableState</code> is the reactive
		class exposed by Root's children snippet. It tracks which editor is focused and provides methods for
		building toolbars and controlling editors programmatically. All properties are reactive via Svelte
		5 runes.
	</p>
	<Code code={API_EDITABLE_STATE} />

	<div class="mt-8">
		<h3 class="mb-4 font-mono text-base font-medium">Method Reference</h3>
		<div class="space-y-2 text-sm">
			<div class="flex gap-4">
				<code class="w-48 shrink-0 font-mono text-foreground">.active</code>
				<span class="text-muted-foreground"
					><code class="font-mono">Editable | undefined</code> — Currently focused editor instance.</span
				>
			</div>
			<div class="flex gap-4">
				<code class="w-48 shrink-0 font-mono text-foreground">.command(name, fn, attrs?)</code>
				<span class="text-muted-foreground"
					><code class="font-mono">EditableCommand</code> — Create a reactive toolbar command.
					Returns
					<code class="font-mono">{`{ isActive: boolean, has: boolean, run(): void }`}</code>.</span
				>
			</div>
			<div class="flex gap-4">
				<code class="w-48 shrink-0 font-mono text-foreground">.isActive(name, attrs?)</code>
				<span class="text-muted-foreground"
					><code class="font-mono">boolean</code> — Check if a mark/node is active (reactive).</span
				>
			</div>
			<div class="flex gap-4">
				<code class="w-48 shrink-0 font-mono text-foreground">.has(extension)</code>
				<span class="text-muted-foreground"
					><code class="font-mono">boolean</code> — Check if extension exists in active editor.</span
				>
			</div>
			<div class="flex gap-4">
				<code class="w-48 shrink-0 font-mono text-foreground">.run(fn)</code>
				<span class="text-muted-foreground"
					><code class="font-mono">R | undefined</code> — Run function against active TipTap Editor.</span
				>
			</div>
		</div>
	</div>
</section>
