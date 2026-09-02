<script lang="ts">
	import { resolve } from '$app/paths';
	import { Separator } from '@routes/components/ui/separator/index.js';
	import Code from '../../code.svelte';
	import {
		EXT_EXTEND,
		EXT_IMAGE_UPLOAD,
		EXT_OPTIONS,
		EXT_RENDER_DEFAULTS,
		EXT_REPLACE,
		EXT_VARIANTS
	} from '../examples.js';

	const variants = [
		{
			id: 'plain',
			schema: 'text*',
			set: 'Document, Text, History, Placeholder',
			desc: 'One line of unformatted text. No paragraph, so no Enter.'
		},
		{
			id: 'multiline',
			schema: 'paragraph+',
			set: 'plain + Paragraph',
			desc: 'Several paragraphs, still unformatted.'
		},
		{
			id: 'rich',
			schema: 'block+',
			set: 'multiline + Bold, Italic, Underline, Strike, Link, Heading (1-3), BulletList, OrderedList, ListItem, Blockquote, HardBreak',
			desc: 'Text only — images are one extension away, on purpose.'
		},
		{
			id: 'image',
			schema: 'image?',
			set: 'Document, Text, EkImage, History',
			desc: 'A single image node. Optional, so an unpicked field is still valid.'
		}
	];
</script>

<section class="mb-16">
	<p class="mb-4 text-xs font-medium tracking-[0.25em] text-muted-foreground uppercase">Core</p>
	<h1 class="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">Extensions</h1>
	<p class="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
		Four variants, each with its own lazily-loaded TipTap extension set &mdash; replaceable or
		extendable per field.
	</p>
</section>

<Separator class="my-12" />

<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">The variants</h2>
	<p class="mt-3 mb-6 text-muted-foreground">
		A variant is a schema plus the extensions that make it editable. Each set lives in its own
		module and is imported the first time a field of that variant is focused, then cached &mdash; a
		page that never enters edit mode ships none of it.
	</p>

	<div class="overflow-hidden rounded-lg border border-border">
		<table class="w-full text-left text-sm">
			<thead class="border-b border-border bg-muted/30">
				<tr>
					<th class="px-4 py-2 text-[10px] font-medium tracking-[0.2em] uppercase">Variant</th>
					<th class="px-4 py-2 text-[10px] font-medium tracking-[0.2em] uppercase">Doc content</th>
					<th class="px-4 py-2 text-[10px] font-medium tracking-[0.2em] uppercase">Extensions</th>
				</tr>
			</thead>
			<tbody>
				{#each variants as v (v.id)}
					<tr class="border-b border-border align-top last:border-0">
						<td class="px-4 py-3 font-mono text-xs whitespace-nowrap">'{v.id}'</td>
						<td class="px-4 py-3 font-mono text-xs whitespace-nowrap">{v.schema}</td>
						<td class="px-4 py-3 text-muted-foreground">
							<span class="text-xs">{v.set}</span>
							<p class="mt-1 text-xs opacity-75">{v.desc}</p>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<Code lang="typescript" code={EXT_VARIANTS} />
</section>

<Separator class="my-12" />

<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Replacing the defaults</h2>
	<p class="mt-3 mb-6 text-muted-foreground">
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">options.extensions</code>
		replaces a variant's set outright &mdash; the variant then only decides caret behaviour. Pass a
		<em>promise</em> rather than an array and your extensions load in parallel with TipTap itself instead
		of queueing behind it.
	</p>

	<Code lang="typescript" code={EXT_REPLACE} />
</section>

<Separator class="my-12" />

<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Building on them</h2>
	<p class="mt-3 mb-6 text-muted-foreground">
		Since replacing is outright, adding to a set means asking for the defaults yourself.
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">defaultExtensions(variant)</code>
		returns the same cached promise the field would have used, so a
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">Promise.all</code> costs nothing extra.
	</p>

	<Code lang="typescript" code={EXT_EXTEND} />

	<p class="mt-4 text-sm leading-relaxed text-muted-foreground">
		Changing only the placeholder needs none of this &mdash;
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">options.placeholder</code>
		reconfigures the one in the set and leaves the rest alone. (The cached defaults are never mutated;
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">configure()</code> returns a copy.)
	</p>

	<Code lang="typescript" code={EXT_OPTIONS} />
</section>

<Separator class="my-12" />

<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Images</h2>
	<p class="mt-3 mb-6 text-muted-foreground">
		The <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">'image'</code> variant uses
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">EkImage</code>, TipTap's Image
		extension with the attributes the renderer emits. Getting a file into it is your flow to build:
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">pickFile()</code> opens the
		dialog, your upload returns a URL, and
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">setImage</code> commits it.
		Nothing in the library calls an
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">UploadHandler</code> for you.
	</p>

	<Code lang="typescript" code={EXT_IMAGE_UPLOAD} />

	<p class="mt-4 text-sm leading-relaxed text-muted-foreground">
		Rich fields carry no image support by default. Adding it means adding
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">EkImage</code> plus TipTap's
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">Dropcursor</code> and
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">Gapcursor</code>, which are what
		make a block image navigable with the keyboard.
	</p>
</section>

<Separator class="my-12" />

<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Rendering what you added</h2>
	<p class="mt-3 mb-6 text-muted-foreground">
		An extension only affects edit mode. For view mode, a node or mark that maps cleanly to one
		element is one entry in
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">nodeDefaults</code> /
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">markDefaults</code>; anything
		else is an override in your framework's renderer. Register the type too &mdash; see
		<a
			href={resolve('/docs/core/documents')}
			class="underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
			>Documents</a
		>.
	</p>

	<Code lang="typescript" code={EXT_RENDER_DEFAULTS} />
</section>
