<script lang="ts">
	import { Separator } from '@routes/components/ui/separator/index.js';
	import Code from '../../code.svelte';
	import { DOC_AUGMENT, DOC_HELPERS, DOC_READING, DOC_TYPES } from '../examples.js';

	const helpers = [
		{ sig: 'text(value?)', desc: 'Bare inline text, no paragraph wrapper — a plain field.' },
		{ sig: 'paragraphs(...values)', desc: 'One paragraph per argument; none gives one empty one.' },
		{ sig: 'image(src?, attrs?)', desc: 'A document holding a single image node.' },
		{ sig: 'heading(level, value?)', desc: 'A heading node, level 1-6.' },
		{ sig: 'codeBlock(code?, language?)', desc: 'A code block node. Needs TipTap’s CodeBlock.' },
		{ sig: 'list(items, ordered?)', desc: 'A bullet or numbered list, one item per string.' },
		{ sig: 'doc(...parts)', desc: 'Composes nodes and documents into one document.' },
		{ sig: 'imageAttrs(doc)', desc: 'The image node’s attrs, or {} if nothing is picked.' },
		{ sig: 'textContent(node, sep?)', desc: 'Every text node concatenated, blocks separated.' }
	];
</script>

<section class="mb-16">
	<p class="mb-4 text-xs font-medium tracking-[0.25em] text-muted-foreground uppercase">Core</p>
	<h1 class="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">Documents</h1>
	<p class="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
		Every field &mdash; plain text, rich text, images &mdash; stores one
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-base">ProseMirrorJSON</code> document.
		These helpers build and read them.
	</p>
</section>

<Separator class="my-12" />

<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">One value type</h2>
	<p class="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
		There is exactly one shape, and it is TipTap's own: what
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">editor.getJSON()</code> returns
		is what you store. An image is not a
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">&#123; src, alt &#125;</code>
		pair &mdash; it is a document holding one
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">image</code> node. Nothing is projected
		in or out on the way to the editor, so nothing can drift.
	</p>

	<Code lang="typescript" code={DOC_TYPES} />
</section>

<Separator class="my-12" />

<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Building</h2>
	<p class="mt-3 mb-6 text-muted-foreground">
		Each variant has a matching helper for its empty and its seeded state. Empty means an empty
		document, not a node with an empty value &mdash; ProseMirror rejects an empty text node, and an
		image with no <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">src</code> would render
		as a broken image.
	</p>

	<Code lang="typescript" code={DOC_HELPERS} />

	<div class="mt-8 overflow-hidden rounded-lg border border-border">
		<table class="w-full text-left text-sm">
			<thead class="border-b border-border bg-muted/30">
				<tr>
					<th class="px-4 py-2 text-[10px] font-medium tracking-[0.2em] uppercase">Helper</th>
					<th class="px-4 py-2 text-[10px] font-medium tracking-[0.2em] uppercase">Returns</th>
				</tr>
			</thead>
			<tbody>
				{#each helpers as h (h.sig)}
					<tr class="border-b border-border last:border-0">
						<td class="px-4 py-2 font-mono text-xs whitespace-nowrap">{h.sig}</td>
						<td class="px-4 py-2 text-muted-foreground">{h.desc}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</section>

<Separator class="my-12" />

<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Reading</h2>
	<p class="mt-3 mb-6 text-muted-foreground">
		Two readers, for the two things you usually want out of a stored document outside of a field: an
		image's attributes, and plain text.
	</p>

	<Code lang="typescript" code={DOC_READING} />

	<p class="mt-4 text-sm leading-relaxed text-muted-foreground">
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">textContent()</code> walks JSON,
		which carries no schema, so it treats any non-text node as a block boundary — right for a hard
		break, close enough for an inline image. If you need real block detection, read
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-xs"
			>editor.state.doc.textBetween()</code
		> off a mounted field instead.
	</p>
</section>

<Separator class="my-12" />

<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Typing your own nodes and marks</h2>
	<p class="mt-3 mb-6 text-muted-foreground">
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">NodeTypes</code> and
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">MarkTypes</code> are interfaces
		you augment from
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">'@editable-kit/core/types'</code
		>. Adding an entry widens
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">PMNode</code>
		and <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">Mark</code>, and types the
		renderer override for it.
	</p>

	<Code lang="typescript" code={DOC_AUGMENT} />

	<p class="mt-4 text-sm leading-relaxed text-muted-foreground">
		Declare each entry as a <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-xs"
			>type</code
		>, not an
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">interface</code>, so it stays
		assignable to TipTap's
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">JSONContent</code>. A document
		containing nodes you never registered is still valid &mdash; the tables are for your types, not
		for validation.
	</p>
</section>
