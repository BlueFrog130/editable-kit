<script lang="ts">
	import { TextEditor } from '../text-editor/index.js';
	import type { EditorComponent, EditorContent, TextEditorOptions } from '../editor/index.js';
	import type { NodeOverrides } from '../renderer/types.js';
	import type { ProseMirrorJSON } from '$lib/types/prosemirror.js';
	import { tryGetEditableContext } from '../editable/editable-context.svelte.js';
	import type { ClassValue } from 'svelte/elements';

	let {
		value = $bindable(),
		editing,
		key,
		overrides,
		options,
		'aria-label': ariaLabel,
		class: className
	}: {
		value: ProseMirrorJSON;
		editing: boolean;
		key?: string;
		overrides?: NodeOverrides;
		options?: TextEditorOptions;
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

	function handleFocus(editor: import('@tiptap/core').Editor) {
		if (!ctx?.state) return;
		ctx.state.active = { type: 'text', editor };
	}

	function handleBlur() {
		if (!editorComponent) return;
		editorComponent.getContent().then((result: EditorContent) => {
			if (result.type === 'text') {
				value = result.content;
			}
		});
	}
</script>

<span class={className}>
	<TextEditor
		bind:editor={editorComponent}
		content={value}
		{editing}
		variant="plain"
		textEditorOptions={options}
		{overrides}
		aria-label={ariaLabel}
		onfocus={handleFocus}
		onblur={handleBlur}
	/>
</span>
