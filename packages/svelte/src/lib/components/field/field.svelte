<script lang="ts">
	import { tick } from 'svelte';
	import type { Editor } from '@tiptap/core';
	import {
		loadFieldEditor,
		destroyFieldEditor,
		getValue as readValue,
		type FieldEditorOptions,
		type Pointer,
		type ProseMirrorJSON
	} from '@editable-kit/core';
	import type { FieldProps } from './types.js';
	import { Renderer } from '../renderer/index.js';

	let {
		content,
		variant,
		editing,
		overrides,
		options,
		onfocus,
		onchange,
		'aria-label': ariaLabel,
		class: className
	}: FieldProps = $props();

	// The one element that is both the rendered output and, once activated, the
	// contenteditable itself. It exists in both modes, so toggling cannot shift layout.
	let el: HTMLElement | undefined = $state();
	let live = $state(false);

	let editor: Editor | undefined;
	let pointer: Pointer | undefined;

	const tag = $derived(variant === 'plain' ? 'span' : 'div');

	/** Everything core needs to build and tear down this field's editor. */
	function editorOptions(): FieldEditorOptions {
		return { variant, content, options, ariaLabel, pointer, onchange, onfocus };
	}

	/**
	 * The field's current document. TipTap's `JSONContent` is looser than our document
	 * type, so core narrows it.
	 */
	export function getValue(): ProseMirrorJSON {
		return readValue(editor, content);
	}

	async function activate() {
		if (live || !editing || !el) return;

		// Load before touching the DOM: `editing` can flip back while the chunk is in
		// flight, and nothing has been torn down yet if it does.
		const opts = editorOptions();
		const mount = await loadFieldEditor(opts);
		if (!editing || !el) return;

		// ProseMirror takes ownership of the element's children, including the anchors
		// Svelte inserts. Re-create the element (same tag, same attributes, same slot in
		// the tree) so the two never manage the same nodes.
		live = true;
		await tick();

		const node = el;
		if (!node || !editing) {
			live = false;
			return;
		}

		editor = mount(node);
		pointer = undefined;
	}

	function deactivate() {
		if (!editor) return;
		destroyFieldEditor(editor, editorOptions());
		editor = undefined;
		// Keyed below, so Svelte discards ProseMirror's element and renders a fresh one
		live = false;
	}

	// Tear down when editing is switched off, and on unmount
	$effect(() => {
		if (!editing && live) deactivate();
		return () => deactivate();
	});

	// External changes to the bound data reach a mounted editor, unless it is being typed in
	$effect(() => {
		const next = content;
		if (!editor || editor.isFocused) return;
		if (JSON.stringify(getValue()) === JSON.stringify(next)) return;
		editor.commands.setContent(next, { emitUpdate: false });
	});

	// TipTap prepends its classes at create time; a later `class` change would drop them
	$effect(() => {
		void className;
		if (live && editor) editor.view.dom.classList.add('tiptap', 'ProseMirror');
	});
</script>

{#key live}
	<svelte:element
		this={tag}
		bind:this={el}
		data-ek-field
		data-ek-variant={variant}
		class={className}
		aria-label={ariaLabel}
		role={editing && !live ? (variant === 'image' ? 'button' : 'textbox') : undefined}
		tabindex={editing && !live ? 0 : undefined}
		onpointerdown={editing && !live
			? (e: PointerEvent) => (pointer = { left: e.clientX, top: e.clientY })
			: undefined}
		onfocusin={editing && !live ? activate : undefined}
	>
		{#if !live}
			<Renderer doc={content} {overrides} />
		{/if}
	</svelte:element>
{/key}

<style>
	:global([data-ek-field]:focus) {
		outline: none;
	}

	/* ponytail: an image field with nothing picked yet has no box of its own, so it is
	   invisible and unclickable. One rule gives it one — no placeholder node, no JS.
	   `:has` rather than `:empty` so it also clears the moment an image is inserted. */
	:global([data-ek-field][data-ek-variant='image']:not(:has(img))) {
		min-height: var(--ek-image-placeholder-height, 8rem);
		border: 1px dashed var(--ek-placeholder-color, #adb5bd);
		border-radius: var(--ek-image-placeholder-radius, 0.25rem);
		background: var(--ek-image-placeholder-background, #f1f3f5);
	}

	:global([data-ek-field][data-ek-variant='image'] img) {
		display: block;
		max-width: 100%;
	}

	:global([data-ek-field] p.is-editor-empty:first-child::before) {
		color: var(--ek-placeholder-color, #adb5bd);
		font-style: var(--ek-placeholder-font-style, normal);
		content: attr(data-placeholder);
		float: left;
		height: 0;
		pointer-events: none;
	}
</style>
