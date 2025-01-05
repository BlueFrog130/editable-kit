<script lang="ts">
	import { Editor, type EditorEvents, type Extensions } from '@tiptap/core';
	import type { Action } from 'svelte/action';
	import { registerEditor } from './editor-context-state.svelte.js';

	type Props = {
		name?: string | number | Symbol;
		content: string;
		extensions: Extensions;
		onfocus?: (editor: Editor) => void;
		oncreate?: (editor: Editor) => void;
		ondestroy?: (editor: Editor | null) => void;
	};

	let { name, content, extensions, onfocus, oncreate, ondestroy }: Props = $props();

	let _editor: Editor | null = null;

	const handleFocus = (e: EditorEvents['focus']) => {
		onfocus?.(e.editor);
	};

	const editor: Action<HTMLElement> = (element) => {
		_editor = new Editor({
			element,
			content,
			extensions,
			autofocus: true,
			editable: true,
			injectCSS: true
		});

		_editor.on('focus', handleFocus);

		oncreate?.(_editor);

		return {
			destroy() {
				ondestroy?.(_editor);
				_editor?.off('focus', handleFocus);
				_editor?.destroy();
			}
		};
	};

	if (name) {
		registerEditor({
			name,
			getContent() {
				if (!_editor) throw new Error('Editor not initialized');
				return _editor.getHTML();
			}
		});
	}

	export const getHtml = () => {
		if (!_editor) throw new Error('Editor not initialized');
		return _editor.getHTML();
	};
</script>

<div class="contents" use:editor></div>
