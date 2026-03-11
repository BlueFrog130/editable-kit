<script lang="ts">
	import * as Editable from '$lib/components/editable/index.js';
	import { PlainText, RichText, MultilineText } from '$lib/components/editors/index.js';
	import type { ProseMirrorJSON } from '$lib/types/prosemirror.js';
	import type { EditableState } from '$lib/components/editable/editable-state.svelte.js';
	import { Separator } from '../../components/ui/separator/index.js';
	import Code from '../code.svelte';
	import Example from '../example.svelte';
	import DocToolbar from '../doc-toolbar.svelte';
	import {
		LOW_LEVEL_STANDALONE,
		LOW_LEVEL_WITH_ROOT,
		LOW_LEVEL_CUSTOM_LAYOUT,
		LOW_LEVEL_STANDALONE_FORM
	} from '../examples.js';

	let standaloneEditing = $state(false);
	let rootEditing = $state(false);
	let rootState: EditableState | undefined = $state();

	let standaloneTitle: ProseMirrorJSON = $state({
		type: 'doc',
		content: [{ type: 'text', text: 'Edit this title directly' }]
	});

	let standaloneBody: ProseMirrorJSON = $state({
		type: 'doc',
		content: [
			{
				type: 'paragraph',
				content: [
					{
						type: 'text',
						text: 'These editors work without Editable.Root — values bind directly to your variables.'
					}
				]
			}
		]
	});

	let rootTitle: ProseMirrorJSON = $state({
		type: 'doc',
		content: [{ type: 'text', text: 'Coordinated editing' }]
	});

	let rootBody: ProseMirrorJSON = $state({
		type: 'doc',
		content: [
			{
				type: 'paragraph',
				content: [
					{
						type: 'text',
						text: 'These editors register with Root via the key prop. The toolbar and save work automatically.'
					}
				]
			}
		]
	});

	let saveOutput = $state('');

	let layoutEditing = $state(false);
	let layoutTitle: ProseMirrorJSON = $state({
		type: 'doc',
		content: [{ type: 'text', text: 'Custom Layout Demo' }]
	});
	let layoutSidebar: ProseMirrorJSON = $state({
		type: 'doc',
		content: [
			{
				type: 'paragraph',
				content: [
					{
						type: 'text',
						text: 'This sidebar can be edited independently. Low-level editors let you place content anywhere.'
					}
				]
			}
		]
	});
	let layoutBody: ProseMirrorJSON = $state({
		type: 'doc',
		content: [
			{
				type: 'paragraph',
				content: [
					{
						type: 'text',
						text: 'The main content area. Both this and the sidebar are separate RichText editors registered with the same Root.'
					}
				]
			}
		]
	});

	let formName: ProseMirrorJSON = $state({
		type: 'doc',
		content: [{ type: 'text', text: '' }]
	});
	let formBio: ProseMirrorJSON = $state({
		type: 'doc',
		content: [
			{
				type: 'paragraph',
				content: [{ type: 'text', text: '' }]
			}
		]
	});
</script>

<section class="mb-16">
	<p class="mb-4 text-xs font-medium tracking-[0.25em] text-muted-foreground uppercase">Guide</p>
	<h1 class="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">Low-Level Editors</h1>
	<p class="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
		Use editor components directly when you need full control over data binding, styling, and
		layout.
	</p>
</section>

<Separator class="my-12" />

<!-- When to use -->
<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">When to Use</h2>
	<p class="mt-3 mb-4 text-muted-foreground">
		The high-level <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">Data</code>
		component works great for flat records. Use low-level editors when:
	</p>
	<ul class="space-y-2 text-muted-foreground">
		<li class="flex gap-2">
			<span class="text-foreground">&ndash;</span>
			Your data is nested or doesn't fit a flat record shape
		</li>
		<li class="flex gap-2">
			<span class="text-foreground">&ndash;</span>
			You need precise control over where editors appear in your markup
		</li>
		<li class="flex gap-2">
			<span class="text-foreground">&ndash;</span>
			You want to manage save timing yourself
		</li>
	</ul>
</section>

<Separator class="my-12" />

<!-- Standalone -->
<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Standalone Usage</h2>
	<p class="mt-3 mb-6 text-muted-foreground">
		Import editors from
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">editable-kit/editors</code>
		and bind values directly. No
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">Root</code> or
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">Data</code> wrapper needed. Values
		sync back on blur.
	</p>

	<Example label="Standalone Editors" bind:editing={standaloneEditing}>
		<h2 class="font-serif text-2xl tracking-tight">
			<PlainText bind:value={standaloneTitle} editing={standaloneEditing} />
		</h2>
		<div class="mt-2 text-muted-foreground">
			<RichText bind:value={standaloneBody} editing={standaloneEditing} />
		</div>
	</Example>

	<Code code={LOW_LEVEL_STANDALONE} />
</section>

<Separator class="my-12" />

<!-- With Root -->
<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">With Root</h2>
	<p class="mt-3 mb-6 text-muted-foreground">
		Add a <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">key</code> prop to register
		editors with
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">Editable.Root</code>. This
		enables coordinated saves and the floating toolbar — same as
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">Data</code>, but without the
		snippet pattern.
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
			editing={rootEditing}
			onsave={async (allData) => {
				const result: Record<string, unknown> = {};
				for (const [key, fields] of allData) {
					result[key] = fields;
				}
				saveOutput = JSON.stringify(result, null, 2);
				rootEditing = false;
			}}
		>
			{#snippet children({ state: s, save })}
				{((rootState = s), '')}
				{#if rootEditing && rootState}
					<DocToolbar state={rootState} />
				{/if}
				<h2 class="font-serif text-2xl tracking-tight">
					<PlainText bind:value={rootTitle} editing={rootEditing} key="title" />
				</h2>
				<div class="mt-2 text-muted-foreground">
					<RichText bind:value={rootBody} editing={rootEditing} key="body" />
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
		Both APIs use the same underlying editor components. Choose based on your data shape.
	</p>
	<div class="grid gap-4 sm:grid-cols-2">
		<div class="rounded-lg border border-border p-5">
			<p class="mb-3 font-mono text-sm font-medium">Data (High-Level)</p>
			<ul class="space-y-1.5 text-sm text-muted-foreground">
				<li>Type-safe field selectors</li>
				<li>Automatic save coordination</li>
				<li>Best for flat records</li>
			</ul>
		</div>
		<div class="rounded-lg border border-border p-5">
			<p class="mb-3 font-mono text-sm font-medium">Editors (Low-Level)</p>
			<ul class="space-y-1.5 text-sm text-muted-foreground">
				<li>Direct value binding</li>
				<li>Any data shape</li>
				<li>Full layout control</li>
			</ul>
		</div>
	</div>
</section>

<Separator class="my-12" />

<!-- Custom Layouts -->
<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Custom Layouts</h2>
	<p class="mt-3 mb-6 text-muted-foreground">
		Low-level editors can be placed anywhere in your markup. Wrap them in a single
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">Editable.Root</code> and each
		editor registers independently via its
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">key</code> prop — no matter where it
		sits in the DOM tree.
	</p>

	<Example label="Two-Column Layout" bind:editing={layoutEditing}>
		<Editable.Root editing={layoutEditing}>
			{#snippet children({ state: s })}
				{#if layoutEditing && s}
					<DocToolbar state={s} />
				{/if}
				<h2 class="font-serif text-2xl tracking-tight">
					<PlainText bind:value={layoutTitle} editing={layoutEditing} key="title" />
				</h2>
				<div class="mt-4 grid gap-6 sm:grid-cols-3">
					<aside class="rounded-lg border border-border bg-muted/20 p-4">
						<p
							class="mb-2 text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase"
						>
							Sidebar
						</p>
						<div class="text-sm text-muted-foreground">
							<RichText bind:value={layoutSidebar} editing={layoutEditing} key="sidebar" />
						</div>
					</aside>
					<main class="sm:col-span-2">
						<p
							class="mb-2 text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase"
						>
							Main Content
						</p>
						<div class="text-muted-foreground">
							<RichText bind:value={layoutBody} editing={layoutEditing} key="body" />
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
				<PlainText bind:value={formName} editing={true} options={{ placeholder: 'Your name' }} />
			</div>
		</label>
		<label class="mb-4 block">
			<span class="mb-1 block text-sm font-medium">Bio</span>
			<div class="rounded-md border border-border px-3 py-2">
				<MultilineText
					bind:value={formBio}
					editing={true}
					options={{ placeholder: 'Tell us about yourself' }}
				/>
			</div>
		</label>
	</Example>

	<Code code={LOW_LEVEL_STANDALONE_FORM} />
</section>
