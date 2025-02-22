<script lang="ts">
	import type { Editor, EditorEvents, EditorOptions, Extensions } from '@tiptap/core';
	import type { Action } from 'svelte/action';

	type Props = {
		content: string;
		extensions: Extensions;
		tiptap: {
			new (options: Partial<EditorOptions>): Editor;
		};
		onfocus?: (editor: Editor) => void;
		oncreate?: (editor: Editor) => void;
		ondestroy?: (editor: Editor | null) => void;
	};

	let { content, extensions, tiptap, onfocus, oncreate, ondestroy }: Props = $props();

	let _editor: Editor | null = null;

	const handleFocus = (e: EditorEvents['focus']) => {
		onfocus?.(e.editor);
	};

	const editor: Action<HTMLElement> = (element) => {
		_editor = new tiptap({
			element,
			content,
			extensions,
			autofocus: false,
			editable: true,
			injectCSS: true,
			onFocus: handleFocus
		});

		oncreate?.(_editor);

		return {
			destroy() {
				ondestroy?.(_editor);
				_editor?.destroy();
			}
		};
	};

	export async function getContent() {
		if (!_editor) throw new Error('Editor not initialized');
		return {
			type: 'text' as const,
			content: _editor.getHTML()
		};
	}
</script>

<div class="contents" use:editor></div>
