<script lang="ts">
	import Field from '../field/field.svelte';
	import type { TextEditorOptions, UploadHandler, Variant } from '../editor/index.js';
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
		upload,
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
		/** Falls back to `Root`'s `upload`. */
		upload?: UploadHandler;
		'aria-label'?: string;
		class?: ClassValue;
	} = $props();

	const ctx = getEditableContext();

	const isEditing = $derived(editing ?? ctx?.editing ?? false);

	/**
	 * Whether writing `next` over `value` is a real change. Fields re-report their value
	 * when they unmount, so without this a field disappearing would mark the form dirty.
	 * Skipped once dirty, and it only runs on blur — never per keystroke.
	 */
	function changed(next: ProseMirrorJSON): boolean {
		return JSON.stringify(value) !== JSON.stringify(next);
	}
</script>

<Field
	content={value}
	{variant}
	editing={isEditing}
	{overrides}
	options={ctx?.editorOptions ? { ...ctx.editorOptions, ...options } : options}
	upload={upload ?? ctx?.upload}
	aria-label={ariaLabel}
	class={className}
	onfocus={(active) => {
		if (ctx?.state) ctx.state.editor = active;
		if (ctx) {
			ctx.flush = () => {
				if (!active.isDestroyed) {
					value = active.getJSON() as ProseMirrorJSON;
				}
			};
		}
	}}
	onchange={(next) => {
		if (ctx && !ctx.dirty && changed(next)) ctx.dirty = true;
		value = next;
	}}
/>
