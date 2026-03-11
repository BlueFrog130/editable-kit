<script lang="ts">
	import Image from '../image/image.svelte';
	import type { EditorComponent } from '../editor/index.js';
	import type { FocusUtils } from '../image/types.js';
	import { tryGetEditableContext } from '../editable/editable-context.svelte.js';
	import type { ClassValue } from 'svelte/elements';

	let {
		src = $bindable(),
		alt = $bindable(),
		editing,
		key,
		maxWidth,
		maxHeight,
		quality,
		aspect,
		'aria-label': ariaLabel,
		class: className
	}: {
		src: string;
		alt: string;
		editing: boolean;
		key?: string;
		maxWidth: number;
		maxHeight: number;
		quality: number;
		aspect?: number;
		'aria-label'?: string;
		class?: ClassValue;
	} = $props();

	const ctx = tryGetEditableContext();

	let editorComponent: EditorComponent = $state() as EditorComponent;

	$effect.pre(() => {
		if (!ctx || !key || !ctx.editing) return;

		const unregister = ctx.register(key, {
			save: async () => {
				if (!editorComponent) return {};
				const content = await editorComponent.getContent();
				return { [key]: content };
			}
		});

		return () => unregister();
	});

	function handleFocus(editor: FocusUtils) {
		if (!ctx?.state) return;
		ctx.state.active = {
			type: 'image',
			editor: {
				replaceImage: editor.replaceImage,
				setImageSrc: editor.setImageSrc,
				getAlt: editor.getAlt,
				setAlt: editor.setAlt
			}
		};
	}
</script>

<Image
	bind:editor={editorComponent}
	{src}
	{alt}
	{editing}
	{maxWidth}
	{maxHeight}
	{quality}
	{aspect}
	aria-label={ariaLabel}
	class={className}
	onfocus={handleFocus}
/>
