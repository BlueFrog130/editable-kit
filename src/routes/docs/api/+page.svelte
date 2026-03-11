<script lang="ts">
	import { Badge } from '../../components/ui/badge/index.js';
	import { Separator } from '../../components/ui/separator/index.js';
	import Code from '../code.svelte';
	import {
		API_SAVE_RESULT,
		API_EDITOR_CONTENT,
		API_EDITABLE_STATE,
		API_EACH_COMPONENT,
		API_DATA_ONSAVE
	} from '../examples.js';
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
			</div>
			<div class="mt-4 space-y-2 text-sm">
				<div class="flex gap-4">
					<code class="w-32 shrink-0 font-mono text-foreground">editing</code>
					<span class="text-muted-foreground"
						><code class="font-mono">boolean</code> — Toggles editing mode for all nested editors.</span
					>
				</div>
				<div class="flex gap-4">
					<code class="w-32 shrink-0 font-mono text-foreground">onsave?</code>
					<span class="text-muted-foreground"
						><code class="font-mono"
							>(data: Map&lt;string, Record&lt;string, EditorContent&gt;&gt;) =&gt; void</code
						></span
					>
				</div>
				<div class="flex gap-4">
					<code class="w-32 shrink-0 font-mono text-foreground">children</code>
					<span class="text-muted-foreground"
						>Snippet receiving <code class="font-mono">{`{ state, save, get, editing }`}</code
						></span
					>
				</div>
			</div>
		</div>

		<!-- Data -->
		<div class="rounded-lg border border-border p-5">
			<div class="flex items-center gap-2">
				<h3 class="font-mono text-base font-medium">{'<'}Data{'>'}</h3>
				<Badge variant="outline">Component</Badge>
				<Badge variant="secondary">Generic</Badge>
			</div>
			<div class="mt-4 space-y-2 text-sm">
				<div class="flex gap-4">
					<code class="w-32 shrink-0 font-mono text-foreground">key</code>
					<span class="text-muted-foreground"
						><code class="font-mono">string</code> — Unique key for this data section in the save map.</span
					>
				</div>
				<div class="flex gap-4">
					<code class="w-32 shrink-0 font-mono text-foreground">data</code>
					<span class="text-muted-foreground"
						><code class="font-mono">T extends EditorData</code> — Your typed data object.</span
					>
				</div>
				<div class="flex gap-4">
					<code class="w-32 shrink-0 font-mono text-foreground">overrides?</code>
					<span class="text-muted-foreground"
						><code class="font-mono">NodeOverrides</code> — Custom render overrides for read mode.</span
					>
				</div>
				<div class="flex gap-4">
					<code class="w-32 shrink-0 font-mono text-foreground">children</code>
					<span class="text-muted-foreground"
						>Snippet receiving <code class="font-mono">{`{ text, multiline, rich, image }`}</code
						></span
					>
				</div>
			</div>
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
						><code class="font-mono">NodeOverrides</code> — Override any node or mark rendering.</span
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
					<code class="w-32 shrink-0 font-mono text-foreground">.isText</code>
					<span class="text-muted-foreground"
						><code class="font-mono">boolean</code> — Whether active editor is text.</span
					>
				</div>
				<div class="flex gap-4">
					<code class="w-32 shrink-0 font-mono text-foreground">.isImage</code>
					<span class="text-muted-foreground"
						><code class="font-mono">boolean</code> — Whether active editor is image.</span
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
		<!-- Each -->
		<div class="rounded-lg border border-border p-5">
			<div class="flex items-center gap-2">
				<h3 class="font-mono text-base font-medium">{'<'}Each{'>'}</h3>
				<Badge variant="outline">Component</Badge>
				<Badge variant="secondary">Generic</Badge>
			</div>
			<div class="mt-4 space-y-2 text-sm">
				<div class="flex gap-4">
					<code class="w-32 shrink-0 font-mono text-foreground">key</code>
					<span class="text-muted-foreground"
						><code class="font-mono">string</code> — Unique key for this array in the save map.</span
					>
				</div>
				<div class="flex gap-4">
					<code class="w-32 shrink-0 font-mono text-foreground">data</code>
					<span class="text-muted-foreground"
						><code class="font-mono">T[]</code> — Array of typed data objects.</span
					>
				</div>
				<div class="flex gap-4">
					<code class="w-32 shrink-0 font-mono text-foreground">overrides?</code>
					<span class="text-muted-foreground"
						><code class="font-mono">NodeOverrides</code> — Custom render overrides for read mode.</span
					>
				</div>
				<div class="flex gap-4">
					<code class="w-32 shrink-0 font-mono text-foreground">onsave?</code>
					<span class="text-muted-foreground"
						><code class="font-mono"
							>(data: EditorSaveData&lt;T&gt;[]) =&gt; MaybePromise&lt;void&gt;</code
						> — Per-section save callback.</span
					>
				</div>
				<div class="flex gap-4">
					<code class="w-32 shrink-0 font-mono text-foreground">each</code>
					<span class="text-muted-foreground"
						>Snippet receiving <code class="font-mono"
							>{`(item: T, index: number, { text, multiline, rich, image })`}</code
						></span
					>
				</div>
			</div>
			<div class="mt-4">
				<Code code={API_EACH_COMPONENT} />
			</div>
		</div>

		<!-- Standalone Editors -->
		<div class="rounded-lg border border-border p-5">
			<div class="flex items-center gap-2">
				<h3 class="font-mono text-base font-medium">Standalone Editors</h3>
				<Badge variant="outline">Components</Badge>
			</div>
			<p class="mt-3 text-sm text-muted-foreground">
				Import from <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm"
					>editable-kit/editors</code
				>. These work with or without
				<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">Root</code>.
			</p>
			<div class="mt-4 space-y-2 text-sm">
				<p class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
					PlainText / MultilineText / RichText
				</p>
				<div class="flex gap-4">
					<code class="w-32 shrink-0 font-mono text-foreground">value</code>
					<span class="text-muted-foreground"
						><code class="font-mono">ProseMirrorJSON</code> — Bindable document state.</span
					>
				</div>
				<div class="flex gap-4">
					<code class="w-32 shrink-0 font-mono text-foreground">editing</code>
					<span class="text-muted-foreground"
						><code class="font-mono">boolean</code> — Whether the editor is active.</span
					>
				</div>
				<div class="flex gap-4">
					<code class="w-32 shrink-0 font-mono text-foreground">key?</code>
					<span class="text-muted-foreground"
						><code class="font-mono">string</code> — Registers with Root when provided.</span
					>
				</div>
				<div class="flex gap-4">
					<code class="w-32 shrink-0 font-mono text-foreground">overrides?</code>
					<span class="text-muted-foreground"
						><code class="font-mono">NodeOverrides</code> — Custom render overrides for read mode.</span
					>
				</div>
				<div class="flex gap-4">
					<code class="w-32 shrink-0 font-mono text-foreground">options?</code>
					<span class="text-muted-foreground"
						><code class="font-mono">TextEditorOptions</code> — TipTap editor configuration (placeholder,
						extensions, etc.).</span
					>
				</div>
			</div>
			<div class="mt-4 space-y-2 text-sm">
				<p class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
					EditableImage
				</p>
				<div class="flex gap-4">
					<code class="w-32 shrink-0 font-mono text-foreground">value</code>
					<span class="text-muted-foreground"
						><code class="font-mono">ImageState</code> — Bindable image state (<code
							class="font-mono">{`{ src, alt }`}</code
						>).</span
					>
				</div>
				<div class="flex gap-4">
					<code class="w-32 shrink-0 font-mono text-foreground">editing</code>
					<span class="text-muted-foreground"
						><code class="font-mono">boolean</code> — Whether the editor is active.</span
					>
				</div>
				<div class="flex gap-4">
					<code class="w-32 shrink-0 font-mono text-foreground">key?</code>
					<span class="text-muted-foreground"
						><code class="font-mono">string</code> — Registers with Root when provided.</span
					>
				</div>
				<div class="flex gap-4">
					<code class="w-32 shrink-0 font-mono text-foreground">maxWidth?</code>
					<span class="text-muted-foreground"
						><code class="font-mono">number</code> — Max output width in pixels.</span
					>
				</div>
				<div class="flex gap-4">
					<code class="w-32 shrink-0 font-mono text-foreground">maxHeight?</code>
					<span class="text-muted-foreground"
						><code class="font-mono">number</code> — Max output height in pixels.</span
					>
				</div>
				<div class="flex gap-4">
					<code class="w-32 shrink-0 font-mono text-foreground">quality?</code>
					<span class="text-muted-foreground"
						><code class="font-mono">number</code> — WebP compression quality (0-1).</span
					>
				</div>
				<div class="flex gap-4">
					<code class="w-32 shrink-0 font-mono text-foreground">aspect?</code>
					<span class="text-muted-foreground"
						><code class="font-mono">number</code> — Fixed aspect ratio for cropping.</span
					>
				</div>
			</div>
		</div>
	</div>
</section>

<Separator class="my-12" />

<!-- Save Payload -->
<section class="mb-16">
	<p class="mb-4 text-xs font-medium tracking-[0.25em] text-muted-foreground uppercase">Types</p>
	<h2 class="font-serif text-2xl tracking-tight">Save Payload</h2>
	<p class="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
		When you call <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">save()</code>, Root
		collects all editor content into a
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm"
			>Map&lt;string, Record&lt;string, EditorContent&gt;&gt;</code
		>. Each key in the Map matches a
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">Data</code> component's
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">key</code> prop, and each value is
		a record mapping field names to their content.
	</p>
	<Code code={API_SAVE_RESULT} />
</section>

<Separator class="my-12" />

<!-- EditorContent -->
<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">EditorContent</h2>
	<p class="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
		A discriminated union with three variants. Use the
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">type</code> field to narrow to the
		correct shape.
	</p>
	<Code code={API_EDITOR_CONTENT} lang="typescript" />
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
				<code class="w-48 shrink-0 font-mono text-foreground">.isText</code>
				<span class="text-muted-foreground"
					><code class="font-mono">boolean</code> — Whether active editor is a text editor (reactive).</span
				>
			</div>
			<div class="flex gap-4">
				<code class="w-48 shrink-0 font-mono text-foreground">.isImage</code>
				<span class="text-muted-foreground"
					><code class="font-mono">boolean</code> — Whether active editor is an image editor (reactive).</span
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
				<code class="w-48 shrink-0 font-mono text-foreground">.text(fn)</code>
				<span class="text-muted-foreground"
					><code class="font-mono">R | undefined</code> — Run function against active TipTap Editor.</span
				>
			</div>
			<div class="flex gap-4">
				<code class="w-48 shrink-0 font-mono text-foreground">.replaceImage()</code>
				<span class="text-muted-foreground"
					><code class="font-mono">void</code> — Open file picker for active image editor.</span
				>
			</div>
			<div class="flex gap-4">
				<code class="w-48 shrink-0 font-mono text-foreground">.setImageSrc(src)</code>
				<span class="text-muted-foreground"
					><code class="font-mono">void</code> — Set image source URL.</span
				>
			</div>
			<div class="flex gap-4">
				<code class="w-48 shrink-0 font-mono text-foreground">.getImageAlt()</code>
				<span class="text-muted-foreground"
					><code class="font-mono">string | undefined</code> — Get current alt text.</span
				>
			</div>
			<div class="flex gap-4">
				<code class="w-48 shrink-0 font-mono text-foreground">.setImageAlt(alt)</code>
				<span class="text-muted-foreground"
					><code class="font-mono">void</code> — Set alt text.</span
				>
			</div>
		</div>
	</div>
</section>

<Separator class="my-12" />

<!-- Per-Section Save -->
<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Per-Section Save</h2>
	<p class="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
		Data and Each components can define their own
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">onsave</code> callback. These fire
		with typed data for just that section, making it easy to handle saves without parsing the full Map.
	</p>
	<Code code={API_DATA_ONSAVE} />
</section>
