<script lang="ts">
	import { resolve } from '$app/paths';
	import { Separator } from '@routes/components/ui/separator/index.js';
	import Code from '../../code.svelte';
	import { FIELD_LIFECYCLE, FIELD_OPTIONS, FIELD_POINTER, FIELD_VANILLA } from '../examples.js';
</script>

<section class="mb-16">
	<p class="mb-4 text-xs font-medium tracking-[0.25em] text-muted-foreground uppercase">Core</p>
	<h1 class="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">Field Editor</h1>
	<p class="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
		The whole editing lifecycle: load TipTap, mount it <em>onto</em> an element you own, tear it down
		again.
	</p>
</section>

<Separator class="my-12" />

<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Mounting onto, not inside</h2>
	<p class="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
		A field renders one element in both modes. When editing starts, ProseMirror takes over
		<em>that same element</em> using its
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">&#123; mount: node &#125;</code>
		place rather than appending an editor next to it. That is the entire no-layout-shift design: editing
		adds no box, so nothing moves.
	</p>
	<p class="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
		The cost is ownership. ProseMirror destroys and replaces that element's children, so whatever
		framework rendered it must not touch it again &mdash; which is why the element you hand over
		should be a freshly created one, and why you discard it on teardown instead of reusing it.
	</p>
</section>

<Separator class="my-12" />

<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Load, then mount</h2>
	<p class="mt-3 mb-6 text-muted-foreground">
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">loadFieldEditor()</code> is async
		and returns a <strong>synchronous</strong>
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">mount(node)</code>. The split is
		load-bearing: re-creating the element before the
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">await</code> would leave the field
		half torn down for the length of a network fetch. Load first, re-create the element, then mount.
	</p>

	<Code lang="typescript" code={FIELD_LIFECYCLE} />

	<div class="mt-6 rounded-lg border border-border bg-muted/30 p-4">
		<p class="text-sm font-medium">Values arrive on blur</p>
		<p class="mt-1 text-sm leading-relaxed text-muted-foreground">
			<code class="font-mono text-xs">onchange</code> fires on blur, not per keystroke, and
			<code class="font-mono text-xs">destroyFieldEditor()</code> fires it once more with the final value.
			Reading your bound data while a field is focused therefore gives its last-blur value — flush the
			focused field before you persist.
		</p>
	</div>
</section>

<Separator class="my-12" />

<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Options</h2>
	<p class="mt-3 mb-6 text-muted-foreground">
		The same object goes to both
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">loadFieldEditor()</code> and
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">destroyFieldEditor()</code> &mdash;
		teardown needs the callbacks and the fallback content.
	</p>

	<Code lang="typescript" code={FIELD_OPTIONS} />

	<p class="mt-6 text-muted-foreground">
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">options</code> is TipTap
		configuration &mdash; extensions, placeholder,
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">oncreate</code>,
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">editorProps</code>. See
		<a
			href={resolve('/docs/core/extensions')}
			class="underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
			>Extensions</a
		>.
	</p>
</section>

<Separator class="my-12" />

<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Caret placement</h2>
	<p class="mt-3 mb-6 text-muted-foreground">
		Pass the viewport coordinates of the click that activated the field and the caret lands where
		the user aimed. Omit them &mdash; a keyboard focus &mdash; and it goes to the end of the
		document. Nothing ever scrolls the selection into view: the field was just clicked, so it is
		already on screen, and scrolling to it nudges scrollable ancestors sideways.
	</p>

	<Code lang="typescript" code={FIELD_POINTER} />
</section>

<Separator class="my-12" />

<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Without a framework</h2>
	<p class="mt-3 mb-6 text-muted-foreground">
		Nothing above needs one. The catch is view mode: once ProseMirror has owned the element, its
		children are gone, so re-rendering after teardown is yours to do &mdash; walk the document with
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">nodeDefaults</code> /
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">markDefaults</code>, or set
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">textContent</code> for a plain field.
	</p>

	<Code lang="typescript" code={FIELD_VANILLA} />
</section>
