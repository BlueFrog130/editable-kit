<script lang="ts">
	import Field from '../field/field.svelte';
	import type { TextEditorOptions, Variant } from '../editor/index.js';
	import type { NodeOverrides } from '../renderer/types.js';
	import type { ProseMirrorJSON } from '$lib/types/prosemirror.js';
	import { getEditableContext } from '../editable/editable-context.svelte.js';
	import type { ClassValue } from 'svelte/elements';

	let {
		value = $bindable(),
		variant,
		editing,
		overrides,
		options,
		'aria-label': ariaLabel,
		class: className
	}: {
		/**
		 * Bind straight at the property you store: `bind:value={post.title}`. Every
		 * variant, images included, holds a ProseMirror document.
		 *
		 * Text fields sync on blur, not per keystroke — reading it while the field is
		 * focused gives the value as of its last blur. `Root`'s `save()` flushes first.
		 */
		value: ProseMirrorJSON;
		variant: Variant;
		/** Falls back to the surrounding `Editable.Root` when omitted. */
		editing?: boolean;
		/** Merged over `Root`'s `overrides`, per node/mark type. */
		overrides?: NodeOverrides;
		/** Merged over `Root`'s `options`, per key. */
		options?: TextEditorOptions;
		'aria-label'?: string;
		class?: ClassValue;
	} = $props();

	const ctx = getEditableContext();

	const isEditing = $derived(editing ?? ctx?.editing ?? false);

	/**
	 * The only place `value` is written. Blur and `flush` both come through here, so a
	 * field saved without blurring first flags the form exactly as a blurred one does.
	 *
	 * The comparison is what keeps it honest: fields re-report their value when they
	 * unmount, so without it a field disappearing would mark the form dirty. Skipped
	 * once dirty, and it only runs on blur or save — never per keystroke.
	 */
	function write(next: ProseMirrorJSON) {
		if (ctx && !ctx.dirty && JSON.stringify(value) !== JSON.stringify(next)) ctx.dirty = true;
		value = next;
	}
</script>

<Field
	content={value}
	{variant}
	editing={isEditing}
	{overrides}
	options={ctx?.editorOptions ? { ...ctx.editorOptions, ...options } : options}
	aria-label={ariaLabel}
	class={className}
	onfocus={(active) => {
		if (ctx?.state) ctx.state.editor = active;
		if (ctx) {
			ctx.flush = () => {
				if (!active.isDestroyed) write(active.getJSON() as ProseMirrorJSON);
			};
		}
	}}
	onchange={write}
/>
