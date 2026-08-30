<script lang="ts">
	import { tick } from 'svelte';
	import type { Editor } from '@tiptap/core';
	import { importEditor, type FieldProps } from '../editor/index.js';
	import type { ProseMirrorJSON } from '$lib/types/prosemirror.js';
	import { resolveExtensions } from '../editor/resolve-extensions.js';
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

	const NO_SCROLL = { scrollIntoView: false };

	let editor: Editor | undefined;
	let pointer: { left: number; top: number } | undefined;

	const tag = $derived(variant === 'plain' ? 'span' : 'div');

	/**
	 * The field's current document. TipTap's `JSONContent` is looser than our document
	 * type, so this is the one place that narrows it.
	 */
	export function getValue(): ProseMirrorJSON {
		return (editor?.getJSON() ?? content) as ProseMirrorJSON;
	}

	async function activate() {
		if (live || !editing || !el) return;

		const [{ Editor: Tiptap }, extModule] = await importEditor(variant);
		const extensions = await resolveExtensions(extModule.extensions, options);

		// `editing` can flip back while the chunk is in flight
		if (!editing || !el) return;

		// ProseMirror takes ownership of the element's children, including the anchors
		// Svelte inserts. Re-create the element (same tag, same attributes, same slot in
		// the tree) so the two never manage the same nodes.
		live = true;
		await tick();

		const node = el;
		if (!node) return;

		editor = new Tiptap({
			// ProseMirror's `mount` place: use this element as the editable node
			// instead of appending a new one. Verified against @tiptap/core createView.
			element: { mount: node } as unknown as HTMLElement,
			content,
			extensions,
			autofocus: false,
			editable: true,
			injectCSS: false,
			editorProps: {
				...options?.editorProps,
				attributes: {
					...(typeof options?.editorProps?.attributes === 'object'
						? options.editorProps.attributes
						: {}),
					...(ariaLabel ? { 'aria-label': ariaLabel } : {})
				}
			},
			onBlur: () => onchange?.(getValue()),
			onFocus: ({ editor: e }) => onfocus?.(e)
		});

		options?.oncreate?.(editor);

		// ponytail: no scrollIntoView anywhere — the field was just clicked, so it is
		// already on screen, and letting ProseMirror scroll to the selection nudges any
		// scrollable ancestor (or the page) sideways, which reads as the field shifting.
		if (variant === 'image') {
			editor.commands.focus(null, NO_SCROLL);
		} else {
			const at = pointer && editor.view.posAtCoords(pointer);
			if (at) editor.chain().setTextSelection(at.pos).focus(null, NO_SCROLL).run();
			else editor.commands.focus('end', NO_SCROLL);
		}
		pointer = undefined;
	}

	function deactivate() {
		if (!editor) return;
		onchange?.(getValue());
		options?.ondestroy?.(editor);
		editor.destroy();
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
