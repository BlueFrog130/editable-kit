<script lang="ts">
	import * as Editable from '$lib/index.js';
	import type { ProseMirrorJSON } from '$lib/index.js';
	import { Separator } from '../../components/ui/separator/index.js';
	import Code from '../code.svelte';
	import Example from '../example.svelte';
	import { TOOLBAR_BASIC, TOOLBAR_COMMAND_API } from '../examples.js';

	let editing = $state(false);

	let data: { body: ProseMirrorJSON } = $state({
		body: {
			type: 'doc',
			content: [
				{
					type: 'paragraph',
					content: [
						{ type: 'text', text: 'Select some text and use the ' },
						{ type: 'text', text: 'toolbar buttons', marks: [{ type: 'bold' }] },
						{
							type: 'text',
							text: ' above to toggle formatting. Try bold, italic, and underline.'
						}
					]
				}
			]
		}
	});
</script>

<section class="mb-16">
	<p class="mb-4 text-xs font-medium tracking-[0.25em] text-muted-foreground uppercase">Controls</p>
	<h1 class="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">Toolbar</h1>
	<p class="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
		Build reactive toolbar buttons that respond to editor state and cursor position. Commands use
		the TipTap <a
			href="https://tiptap.dev/docs/editor/api/commands"
			class="underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
			target="_blank"
			rel="noopener noreferrer">command API</a
		>.
	</p>
</section>

<Separator class="my-12" />

<!-- Building a Toolbar -->
<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Building a Toolbar</h2>
	<p class="mt-3 mb-6 text-muted-foreground">
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">Root</code> exposes an
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">EditableState</code>
		object that tracks the active editor. Use it to build toolbar buttons that react to cursor position.
		Click into the editor below to see the toolbar appear.
	</p>

	<Editable.Root bind:data {editing}>
		{#snippet children({ state, save })}
			<Example
				bind:editing
				onsave={() => {
					save();
					editing = false;
				}}
			>
				{#if editing && state}
					{@const bold = state.command('bold', (e) => e.chain().focus().toggleBold().run())}
					{@const italic = state.command('italic', (e) => e.chain().focus().toggleItalic().run())}
					{@const underline = state.command('underline', (e) =>
						e.chain().focus().toggleUnderline().run()
					)}
					{@const strike = state.command('strike', (e) => e.chain().focus().toggleStrike().run())}
					<div
						class="mb-4 flex gap-1 rounded-md border border-border bg-muted/30 p-1"
						role="toolbar"
						aria-label="Text formatting"
					>
						<button
							class="rounded px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-30 {bold.isActive
								? 'bg-foreground text-background'
								: 'hover:bg-muted'}"
							disabled={!bold.has}
							onclick={bold.run}
							aria-label="Bold"
							aria-pressed={bold.isActive}
						>
							B
						</button>
						<button
							class="rounded px-2.5 py-1 text-xs font-medium italic transition-colors disabled:opacity-30 {italic.isActive
								? 'bg-foreground text-background'
								: 'hover:bg-muted'}"
							disabled={!italic.has}
							onclick={italic.run}
							aria-label="Italic"
							aria-pressed={italic.isActive}
						>
							I
						</button>
						<button
							class="rounded px-2.5 py-1 text-xs font-medium underline transition-colors disabled:opacity-30 {underline.isActive
								? 'bg-foreground text-background'
								: 'hover:bg-muted'}"
							disabled={!underline.has}
							onclick={underline.run}
							aria-label="Underline"
							aria-pressed={underline.isActive}
						>
							U
						</button>
						<button
							class="rounded px-2.5 py-1 text-xs font-medium line-through transition-colors disabled:opacity-30 {strike.isActive
								? 'bg-foreground text-background'
								: 'hover:bg-muted'}"
							disabled={!strike.has}
							onclick={strike.run}
							aria-label="Strikethrough"
							aria-pressed={strike.isActive}
						>
							S
						</button>
					</div>
				{/if}
				<div class="text-muted-foreground"><Editable.Rich bind:value={data.body} /></div>
			</Example>
		{/snippet}
	</Editable.Root>

	<Code code={TOOLBAR_BASIC} />
</section>

<Separator class="my-12" />

<!-- EditableState API -->
<section class="mb-16">
	<h3 class="font-serif text-2xl tracking-tight">EditableState API</h3>
	<div class="mt-6 space-y-3">
		<div class="rounded-lg border border-border p-4">
			<p class="font-mono text-sm">state.command(name, fn, attributes?)</p>
			<p class="mt-1 text-sm text-muted-foreground">
				Returns <code class="font-mono">{`{ isActive, has, run }`}</code> — a reactive object for a toolbar
				button.
			</p>
			<Code code={TOOLBAR_COMMAND_API} />
		</div>
		<div class="rounded-lg border border-border p-4">
			<p class="font-mono text-sm">state.isActive(name, attributes?)</p>
			<p class="mt-1 text-sm text-muted-foreground">
				Reactive check for whether a mark/node is active at the cursor.
			</p>
		</div>
		<div class="rounded-lg border border-border p-4">
			<p class="font-mono text-sm">state.has(extension)</p>
			<p class="mt-1 text-sm text-muted-foreground">
				Whether the extension exists in the active editor's schema.
			</p>
		</div>
		<div class="rounded-lg border border-border p-4">
			<p class="font-mono text-sm">state.run(fn)</p>
			<p class="mt-1 text-sm text-muted-foreground">
				Run a function against the active TipTap <a
					href="https://tiptap.dev/docs/editor/api/editor"
					class="font-mono underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
					target="_blank"
					rel="noopener noreferrer">Editor</a
				>
				instance. Returns <code class="font-mono">undefined</code> if no editor is active.
			</p>
		</div>
	</div>
</section>
