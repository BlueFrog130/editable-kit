<script lang="ts">
	import type { Editor, EditorEvents, EditorOptions, Extensions } from '@tiptap/core';
	import type { EditorProps } from '@tiptap/pm/view';
	import type { Action } from 'svelte/action';
	import type { ProseMirrorJSON } from '$lib/types/prosemirror.js';
	import type { ClassValue } from 'svelte/elements';
	import type { Attachment } from 'svelte/attachments';

	type Props = {
		content: ProseMirrorJSON;
		extensions: Extensions;
		tiptap: {
			new (options: Partial<EditorOptions>): Editor;
		};
		onfocus?: (editor: Editor) => void;
		onblur?: () => void;
		oncreate?: (editor: Editor) => void;
		ondestroy?: (editor: Editor | null) => void;
		editorProps?: EditorProps;
		'aria-label'?: string;
		class?: ClassValue;
	};

	let {
		class: className,
		content,
		extensions,
		tiptap,
		onfocus,
		onblur,
		oncreate,
		ondestroy,
		editorProps: tiptapEditorProps,
		'aria-label': ariaLabel
	}: Props = $props();

	let _editor: Editor | null = null;

	const handleFocus = (e: EditorEvents['focus']) => {
		onfocus?.(e.editor);
	};

	const handleBlur = () => {
		onblur?.();
	};

	const editor: Attachment<HTMLElement> = (element) => {
		function mergeAriaLabel(attrs: Record<string, string>): Record<string, string> {
			if (ariaLabel) return { ...attrs, 'aria-label': ariaLabel };
			return attrs;
		}

		const rawAttrs = tiptapEditorProps?.attributes;
		const attributes: EditorProps['attributes'] =
			typeof rawAttrs === 'function'
				? (state: any) =>
						mergeAriaLabel((rawAttrs as (state: any) => Record<string, string>)(state))
				: mergeAriaLabel(typeof rawAttrs === 'object' ? (rawAttrs as Record<string, string>) : {});

		_editor = new tiptap({
			element,
			content,
			extensions,
			autofocus: false,
			editable: true,
			injectCSS: false,
			onFocus: handleFocus,
			onBlur: handleBlur,
			editorProps: {
				...tiptapEditorProps,
				attributes
			}
		});

		oncreate?.(_editor);

		return () => {
			ondestroy?.(_editor);
			_editor?.destroy();
			_editor = null;
		};
	};

	export async function getContent() {
		if (!_editor) throw new Error('Editor not initialized');
		return {
			type: 'text' as const,
			content: _editor.getJSON() as ProseMirrorJSON
		};
	}
</script>

<div data-ek-editor class={className} {@attach editor}></div>

<style>
	:global([data-ek-editor]) {
		display: contents;
	}

	:global([data-ek-editor] .tiptap) {
		white-space: pre-wrap;
	}

	:global([data-ek-editor] .tiptap:focus) {
		outline: none;
	}

	:global([data-ek-editor] .tiptap p.is-editor-empty:first-child::before) {
		color: var(--ek-placeholder-color, #adb5bd);
		font-style: var(--ek-placeholder-font-style, normal);
		content: attr(data-placeholder);
		float: left;
		height: 0;
		pointer-events: none;
	}
</style>
