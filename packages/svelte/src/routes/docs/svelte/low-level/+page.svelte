<script lang="ts">
	import * as Editable from '$lib/index.js';
	import type { ProseMirrorJSON } from '$lib/index.js';
	import type { EditableState } from '$lib/components/editable/editable-state.svelte.js';
	import { Separator } from '@routes/components/ui/separator/index.js';
	import Code from '../../code.svelte';
	import Example from '../../example.svelte';
	import DocToolbar from '../../doc-toolbar.svelte';
	import {
		LOW_LEVEL_STANDALONE,
		LOW_LEVEL_WITH_ROOT,
		LOW_LEVEL_CUSTOM_LAYOUT,
		LOW_LEVEL_STANDALONE_FORM
	} from '../../examples.js';

	let standaloneEditing = $state(false);
	let rootEditing = $state(false);
	let rootState: EditableState | undefined = $state();

	let standaloneTitle: ProseMirrorJSON = $state(Editable.text('Edit this title directly'));

	let standaloneBody: ProseMirrorJSON = $state(
		Editable.paragraphs(
			'These fields work without Editable.Root - values bind directly to your variables.'
		)
	);

	let rootPost: { title: ProseMirrorJSON; body: ProseMirrorJSON } = $state({
		title: Editable.text('Coordinated editing'),
		body: Editable.paragraphs(
			'These fields sit inside Root. The toolbar and save work with no wiring at all.'
		)
	});

	let saveOutput = $state('');

	let layoutEditing = $state(false);
	let layoutTitle: ProseMirrorJSON = $state(Editable.text('Custom Layout Demo'));
	let layoutSidebar: ProseMirrorJSON = $state(
		Editable.paragraphs(
			'This sidebar can be edited independently. Low-level editors let you place content anywhere.'
		)
	);
	let layoutBody: ProseMirrorJSON = $state(
		Editable.paragraphs(
			'The main content area. Both this and the sidebar are separate Rich fields under the same Root.'
		)
	);

	let formName: ProseMirrorJSON = $state(Editable.text());
	let formBio: ProseMirrorJSON = $state(Editable.paragraphs());
</script>

<section class="mb-16">
	<p class="mb-4 text-xs font-medium tracking-[0.25em] text-muted-foreground uppercase">Guide</p>
	<h1 class="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">Standalone Fields</h1>
	<p class="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
		Fields work on their own. Drop one anywhere, bind it to a value, and skip
		<code class="font-mono">Root</code> entirely.
	</p>
</section>

<Separator class="my-12" />

<!-- When to use -->
<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">When to Skip Root</h2>
	<p class="mt-3 mb-4 text-muted-foreground">
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">Root</code> adds shared editing
		state: one toolbar, one save, one reset, one
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">dirty</code> flag. Leave it out when:
	</p>
	<ul class="space-y-2 text-muted-foreground">
		<li class="flex gap-2">
			<span class="text-foreground">&ndash;</span>
			The field is a form input that is always editable
		</li>
		<li class="flex gap-2">
			<span class="text-foreground">&ndash;</span>
			You already own the save button and the editing flag
		</li>
		<li class="flex gap-2">
			<span class="text-foreground">&ndash;</span>
			There is nothing to coordinate &mdash; a single field on the page
		</li>
	</ul>
</section>

<Separator class="my-12" />

<!-- Standalone -->
<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Standalone Usage</h2>
	<p class="mt-3 mb-6 text-muted-foreground">
		Bind a field at the value it edits and pass
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">editing</code> yourself. No wrapper
		needed. Values sync back on blur.
	</p>

	<Example label="Standalone Editors" bind:editing={standaloneEditing}>
		<h2 class="font-serif text-2xl tracking-tight">
			<Editable.Text bind:value={standaloneTitle} editing={standaloneEditing} />
		</h2>
		<div class="mt-2 text-muted-foreground">
			<Editable.Rich bind:value={standaloneBody} editing={standaloneEditing} />
		</div>
	</Example>

	<Code code={LOW_LEVEL_STANDALONE} />
</section>

<Separator class="my-12" />

<!-- With Root -->
<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">With Root</h2>
	<p class="mt-3 mb-6 text-muted-foreground">
		Put the same fields inside
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">Editable.Root</code> and they
		pick up its editing flag, toolbar, and save &mdash; no registration, no keys. Bind
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">Root</code> at the object holding
		them to get <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">reset()</code> too.
	</p>

	<Example
		label="With Root"
		bind:editing={rootEditing}
		onsave={() => {
			const root = document.querySelector('[data-root-save]');
			if (root instanceof HTMLButtonElement) root.click();
		}}
	>
		<Editable.Root
			bind:data={rootPost}
			editing={rootEditing}
			onsave={(saved) => {
				saveOutput = JSON.stringify(saved, null, 2);
				rootEditing = false;
			}}
		>
			{#snippet children({ state: s, save })}
				{((rootState = s), '')}
				{#if rootEditing && rootState}
					<DocToolbar state={rootState} />
				{/if}
				<h2 class="font-serif text-2xl tracking-tight">
					<Editable.Text bind:value={rootPost.title} />
				</h2>
				<div class="mt-2 text-muted-foreground">
					<Editable.Rich bind:value={rootPost.body} />
				</div>
				<button data-root-save class="hidden" onclick={save} aria-label="Save"></button>
			{/snippet}
		</Editable.Root>
		{#if saveOutput}
			<div class="mt-4 rounded-lg border border-border bg-muted/50 p-4">
				<p class="mb-2 text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
					onsave received:
				</p>
				<pre
					class="overflow-x-auto font-mono text-xs leading-relaxed text-muted-foreground">{saveOutput}</pre>
			</div>
		{/if}
	</Example>

	<Code code={LOW_LEVEL_WITH_ROOT} />
</section>

<Separator class="my-12" />

<!-- Comparison -->
<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Comparison</h2>
	<p class="mt-3 mb-6 text-muted-foreground">
		Same field components either way. The only question is whether anything needs coordinating.
	</p>
	<div class="grid gap-4 sm:grid-cols-2">
		<div class="rounded-lg border border-border p-5">
			<p class="mb-3 font-mono text-sm font-medium">Bare field</p>
			<ul class="space-y-1.5 text-sm text-muted-foreground">
				<li>You pass editing</li>
				<li>You own saving</li>
				<li>No toolbar, no dirty flag</li>
			</ul>
		</div>
		<div class="rounded-lg border border-border p-5">
			<p class="mb-3 font-mono text-sm font-medium">Inside Root</p>
			<ul class="space-y-1.5 text-sm text-muted-foreground">
				<li>One editing flag for every field</li>
				<li>save(), reset(), dirty</li>
				<li>Shared toolbar state</li>
			</ul>
		</div>
	</div>
</section>

<Separator class="my-12" />

<!-- Custom Layouts -->
<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Custom Layouts</h2>
	<p class="mt-3 mb-6 text-muted-foreground">
		Fields go wherever the markup needs them. One
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">Editable.Root</code> anywhere above
		them is enough &mdash; nesting depth and DOM order do not matter.
	</p>

	<Example label="Two-Column Layout" bind:editing={layoutEditing}>
		<Editable.Root editing={layoutEditing}>
			{#snippet children({ state: s })}
				{#if layoutEditing && s}
					<DocToolbar state={s} />
				{/if}
				<h2 class="font-serif text-2xl tracking-tight">
					<Editable.Text bind:value={layoutTitle} editing={layoutEditing} />
				</h2>
				<div class="mt-4 grid gap-6 sm:grid-cols-3">
					<aside class="rounded-lg border border-border bg-muted/20 p-4">
						<p
							class="mb-2 text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase"
						>
							Sidebar
						</p>
						<div class="text-sm text-muted-foreground">
							<Editable.Rich bind:value={layoutSidebar} editing={layoutEditing} />
						</div>
					</aside>
					<main class="sm:col-span-2">
						<p
							class="mb-2 text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase"
						>
							Main Content
						</p>
						<div class="text-muted-foreground">
							<Editable.Rich bind:value={layoutBody} editing={layoutEditing} />
						</div>
					</main>
				</div>
			{/snippet}
		</Editable.Root>
	</Example>

	<Code code={LOW_LEVEL_CUSTOM_LAYOUT} />
</section>

<Separator class="my-12" />

<!-- As Form Inputs -->
<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">As Form Inputs</h2>
	<p class="mt-3 mb-6 text-muted-foreground">
		Without an
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">Editable.Root</code>, editors
		work as standalone rich form fields. Set
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">editing={'{true}'}</code> to keep
		them always editable and use
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">placeholder</code> for empty-state
		hints.
	</p>

	<Example label="Form Inputs" editing={true}>
		<label class="mb-4 block">
			<span class="mb-1 block text-sm font-medium">Name</span>
			<div class="rounded-md border border-border px-3 py-2">
				<Editable.Text
					bind:value={formName}
					editing={true}
					options={{ placeholder: 'Your name' }}
				/>
			</div>
		</label>
		<label class="mb-4 block">
			<span class="mb-1 block text-sm font-medium">Bio</span>
			<div class="rounded-md border border-border px-3 py-2">
				<Editable.Multiline
					bind:value={formBio}
					editing={true}
					options={{ placeholder: 'Tell us about yourself' }}
				/>
			</div>
		</label>
	</Example>

	<Code code={LOW_LEVEL_STANDALONE_FORM} />
</section>
