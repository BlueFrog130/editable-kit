<script lang="ts">
	import * as Editable from '$lib/components/editable/index.js';
	import type { ProseMirrorJSON } from '$lib/types/prosemirror.js';
	import { Separator } from '../../components/ui/separator/index.js';
	import Code from '../code.svelte';
	import Example from '../example.svelte';
	import {
		THEMING_CSS_VARS,
		THEMING_SCOPED,
		THEMING_DARK_MODE,
		THEMING_ALL_VARIABLES,
		THEMING_IMAGE_CUSTOM
	} from '../examples.js';

	let scopedEditing = $state(false);
	let scopedSave: (() => Promise<unknown>) | undefined = $state();
	let scopedData: { title: ProseMirrorJSON } = $state({
		title: { type: 'doc', content: [{ type: 'text', text: '' }] }
	});
</script>

<section class="mb-16">
	<p class="mb-4 text-xs font-medium tracking-[0.25em] text-muted-foreground uppercase">Guide</p>
	<h1 class="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">Theming</h1>
	<p class="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
		Customize editor appearance with CSS custom properties.
	</p>
</section>

<Separator class="my-12" />

<!-- CSS Custom Properties -->
<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">CSS Custom Properties</h2>
	<p class="mt-3 mb-6 text-muted-foreground">
		editable-kit uses CSS custom properties for theming. Override them on any parent element to
		change the look of editors, placeholders, and image crop overlays.
	</p>

	<div class="space-y-2">
		<div class="flex items-start gap-3 rounded-md border border-border px-3 py-2.5">
			<code class="shrink-0 font-mono text-sm font-medium">--ek-focus-ring-color</code>
			<span class="text-sm text-muted-foreground">
				Image editor focus ring. Default: <code class="font-mono text-xs">#39f</code>
			</span>
		</div>
		<div class="flex items-start gap-3 rounded-md border border-border px-3 py-2.5">
			<code class="shrink-0 font-mono text-sm font-medium">--ek-placeholder-color</code>
			<span class="text-sm text-muted-foreground">
				Empty editor placeholder text. Default: <code class="font-mono text-xs">#adb5bd</code>
			</span>
		</div>
		<div class="flex items-start gap-3 rounded-md border border-border px-3 py-2.5">
			<code class="shrink-0 font-mono text-sm font-medium">--ek-crop-overlay-color</code>
			<span class="text-sm text-muted-foreground">
				Image crop dark overlay. Default: <code class="font-mono text-xs">rgba(0, 0, 0, 0.5)</code>
			</span>
		</div>
		<div class="flex items-start gap-3 rounded-md border border-border px-3 py-2.5">
			<code class="shrink-0 font-mono text-sm font-medium">--ek-crop-grid-color</code>
			<span class="text-sm text-muted-foreground">
				Image crop grid lines. Default: <code class="font-mono text-xs"
					>rgba(255, 255, 255, 0.5)</code
				>
			</span>
		</div>
		<div class="flex items-start gap-3 rounded-md border border-border px-3 py-2.5">
			<code class="shrink-0 font-mono text-sm font-medium">--ek-focus-ring-width</code>
			<span class="text-sm text-muted-foreground">
				Image editor focus ring thickness. Default: <code class="font-mono text-xs">1px</code>
			</span>
		</div>
		<div class="flex items-start gap-3 rounded-md border border-border px-3 py-2.5">
			<code class="shrink-0 font-mono text-sm font-medium">--ek-placeholder-font-style</code>
			<span class="text-sm text-muted-foreground">
				Placeholder text font style. Default: <code class="font-mono text-xs">normal</code>
			</span>
		</div>
		<div class="flex items-start gap-3 rounded-md border border-border px-3 py-2.5">
			<code class="shrink-0 font-mono text-sm font-medium">--ek-image-placeholder-color</code>
			<span class="text-sm text-muted-foreground">
				Empty image placeholder text color. Default: <code class="font-mono text-xs"
					>currentColor</code
				>
			</span>
		</div>
		<div class="flex items-start gap-3 rounded-md border border-border px-3 py-2.5">
			<code class="shrink-0 font-mono text-sm font-medium">--ek-image-placeholder-bg</code>
			<span class="text-sm text-muted-foreground">
				Empty image placeholder background. Default: <code class="font-mono text-xs"
					>transparent</code
				>
			</span>
		</div>
		<div class="flex items-start gap-3 rounded-md border border-border px-3 py-2.5">
			<code class="shrink-0 font-mono text-sm font-medium">--ek-crop-grid-width</code>
			<span class="text-sm text-muted-foreground">
				Crop grid line thickness. Default: <code class="font-mono text-xs">1px</code>
			</span>
		</div>
	</div>

	<Code code={THEMING_CSS_VARS} lang="css" />

	<h3 class="mt-8 font-serif text-xl tracking-tight">All Variables Reference</h3>
	<p class="mt-3 mb-6 text-muted-foreground">
		Every CSS custom property available, organized by component.
	</p>

	<Code code={THEMING_ALL_VARIABLES} lang="css" />
</section>

<Separator class="my-12" />

<!-- Scoped Theming -->
<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Scoped Theming</h2>
	<p class="mt-3 mb-6 text-muted-foreground">
		Override properties on any parent element to scope themes to a specific section of your page.
		Child editors inherit the closest values.
	</p>

	<Example label="Scoped Theme" bind:editing={scopedEditing}>
		<div style="--ek-placeholder-color: #6366f1;">
			<Editable.Root editing={scopedEditing}>
				{#snippet children({ save })}
					{((scopedSave = save), '')}
					<Editable.Data
						key="themed"
						data={scopedData}
						onsave={(d) => {
							if (d.title.type === 'text') scopedData.title = d.title.content;
						}}
					>
						{#snippet children({ text })}
							<h2 class="font-serif text-2xl tracking-tight">
								{@render text('title', { placeholder: 'Type here to see themed placeholder...' })}
							</h2>
						{/snippet}
					</Editable.Data>
				{/snippet}
			</Editable.Root>
		</div>
	</Example>

	<Code code={THEMING_SCOPED} />
</section>

<Separator class="my-12" />

<!-- Image Styling -->
<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Image Styling</h2>
	<p class="mt-3 mb-6 text-muted-foreground">
		Customize the image editor's focus ring, placeholder, and crop overlay with dedicated variables.
	</p>

	<Code code={THEMING_IMAGE_CUSTOM} lang="css" />

	<div class="mt-6 rounded-lg border border-border bg-muted/30 p-4">
		<p class="text-sm">
			<span class="font-medium">Tip.</span>
			<span class="text-muted-foreground">
				Use <code class="font-mono text-xs">--ek-focus-ring-width: 0px</code> to completely remove the
				image editor focus ring if your design doesn't need one.
			</span>
		</p>
	</div>
</section>

<Separator class="my-12" />

<!-- Dark Mode -->
<section class="mb-16">
	<h2 class="font-serif text-2xl tracking-tight">Dark Mode</h2>
	<p class="mt-3 mb-6 text-muted-foreground">
		Combine CSS custom properties with media queries or class-based dark mode to adjust editor
		appearance for light and dark themes.
	</p>

	<Code code={THEMING_DARK_MODE} lang="css" />

	<div class="mt-6 rounded-lg border border-border bg-muted/30 p-4">
		<p class="text-sm">
			<span class="font-medium">Tip.</span>
			<span class="text-muted-foreground">
				These properties inherit through the DOM, so you can set them on <code
					class="font-mono text-xs">:root</code
				>
				for global theming or on any parent element for scoped overrides.
			</span>
		</p>
	</div>
</section>
