<script lang="ts">
	import { resolve } from '$app/paths';
	import { Separator } from '@routes/components/ui/separator/index.js';
	import * as Tabs from '@routes/components/ui/tabs/index.js';
	import Code from '../code.svelte';
	import { CORE_ADAPTER_SHAPE, CORE_SURFACE } from './examples.js';
</script>

<section class="mb-16">
	<p class="mb-4 text-xs font-medium tracking-[0.25em] text-muted-foreground uppercase">Core</p>
	<h1 class="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">@editable-kit/core</h1>
	<p class="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
		The framework-agnostic half: document types and helpers, TipTap extension sets, and the field
		editor lifecycle. It depends on
		<a
			href="https://tiptap.dev/docs/editor"
			class="underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
			target="_blank"
			rel="noopener noreferrer">TipTap</a
		> and nothing else.
	</p>
</section>

<Separator class="my-12" />

<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Do you need it?</h2>
	<p class="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
		Usually not. Every framework package re-exports core's whole surface, so if you are using
		<a
			href={resolve('/docs/svelte/getting-started')}
			class="underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:decoration-foreground"
			>@editable-kit/svelte</a
		>
		you already have
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">text()</code>,
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">ProseMirrorJSON</code> and the rest
		&mdash; importing core directly just adds a dependency you do not need.
	</p>
	<p class="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
		Install it on its own for one of two reasons: you are writing an adapter for a framework that
		has none yet, or you want editable fields with no framework at all.
	</p>

	<Tabs.Root value="pnpm" class="mt-6 gap-0">
		<Tabs.List class="mb-0 h-7">
			<Tabs.Trigger value="pnpm" class="px-2 py-0.5 text-xs">pnpm</Tabs.Trigger>
			<Tabs.Trigger value="npm" class="px-2 py-0.5 text-xs">npm</Tabs.Trigger>
			<Tabs.Trigger value="yarn" class="px-2 py-0.5 text-xs">yarn</Tabs.Trigger>
			<Tabs.Trigger value="bun" class="px-2 py-0.5 text-xs">bun</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="pnpm"><Code lang="bash" code="pnpm add @editable-kit/core" /></Tabs.Content
		>
		<Tabs.Content value="npm"
			><Code lang="bash" code="npm install @editable-kit/core" /></Tabs.Content
		>
		<Tabs.Content value="yarn"><Code lang="bash" code="yarn add @editable-kit/core" /></Tabs.Content
		>
		<Tabs.Content value="bun"><Code lang="bash" code="bun add @editable-kit/core" /></Tabs.Content>
	</Tabs.Root>
</section>

<Separator class="my-12" />

<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">What's in it</h2>
	<p class="mt-3 mb-6 text-muted-foreground">
		Four groups of exports, all reachable from the package root.
		<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">@editable-kit/core/types</code> is
		the second entry point, and exists only so you can augment the node and mark tables.
	</p>

	<div class="grid gap-4 sm:grid-cols-2">
		<div class="rounded-lg border border-border p-4">
			<p class="text-sm font-medium">Documents</p>
			<p class="mt-1 text-xs leading-relaxed text-muted-foreground">
				<code class="font-mono">text()</code>, <code class="font-mono">paragraphs()</code>,
				<code class="font-mono">image()</code>
				and friends build the ProseMirror JSON every field stores &mdash;
				<a
					href={resolve('/docs/core/documents')}
					class="underline decoration-muted-foreground/50 underline-offset-2 hover:decoration-foreground"
					>Documents</a
				>.
			</p>
		</div>
		<div class="rounded-lg border border-border p-4">
			<p class="text-sm font-medium">Field editor</p>
			<p class="mt-1 text-xs leading-relaxed text-muted-foreground">
				<code class="font-mono">loadFieldEditor()</code> mounts TipTap
				<em>onto</em>
				an element rather than inside it &mdash;
				<a
					href={resolve('/docs/core/field-editor')}
					class="underline decoration-muted-foreground/50 underline-offset-2 hover:decoration-foreground"
					>Field Editor</a
				>.
			</p>
		</div>
		<div class="rounded-lg border border-border p-4">
			<p class="text-sm font-medium">Extensions</p>
			<p class="mt-1 text-xs leading-relaxed text-muted-foreground">
				Four lazily-loaded variant sets, replaceable or extendable per field &mdash;
				<a
					href={resolve('/docs/core/extensions')}
					class="underline decoration-muted-foreground/50 underline-offset-2 hover:decoration-foreground"
					>Extensions</a
				>.
			</p>
		</div>
		<div class="rounded-lg border border-border p-4">
			<p class="text-sm font-medium">Render defaults</p>
			<p class="mt-1 text-xs leading-relaxed text-muted-foreground">
				<code class="font-mono">nodeDefaults</code> / <code class="font-mono">markDefaults</code>:
				the node &rarr; element table a view-mode renderer walks.
			</p>
		</div>
	</div>

	<Code lang="typescript" code={CORE_SURFACE} />
</section>

<Separator class="my-12" />

<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">What core deliberately isn't</h2>
	<p class="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
		Core is not reactive. There is no store, no signal, no component &mdash; just pure functions and
		one callback-based editor controller. Reactivity is the adapter's job, because every framework
		already has its own and a shared abstraction would only fight them.
	</p>
	<p class="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
		It also owns no DOM. It never creates the element a field lives in, never removes it, and never
		re-renders view mode &mdash; it only asks for an element it can take over, and tells you when it
		is done with it.
	</p>

	<Code lang="typescript" code={CORE_ADAPTER_SHAPE} />
</section>
