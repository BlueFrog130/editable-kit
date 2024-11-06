<script lang="ts">
	import { multiLineRichTextSchema, singleLineRichTextSchema } from '$lib/editor/schema.js';
	import { fromHTML, toHTML } from '$lib/editor/util.js';
	import { EditorState, Plugin } from 'prosemirror-state';
	import type { RichTextEditorProps } from './index.js';
	import { keymap } from 'prosemirror-keymap';
	import { buildKeymap } from '$lib/editor/keymap.js';
	import { baseKeymap } from 'prosemirror-commands';
	import { history } from 'prosemirror-history';
	import { editor } from '$lib/state/index.svelte.js';
	import { EditorView } from 'prosemirror-view';
	import { untrack } from 'svelte';
	import { buildInputRules } from '$lib/editor/input-rules.js';
	import { textToolbar } from '$lib/editor/toolbars.js';

	let { content, multiline }: RichTextEditorProps = $props();

	let _content = $state(content);

	const schema = $derived(multiline ? multiLineRichTextSchema : singleLineRichTextSchema);
	const doc = $derived(
		fromHTML(
			schema,
			untrack(() => content)
		)
	);

	const onUpdatePlugin = new Plugin({
		view() {
			return {
				update(view) {
					editor.view = view;
					editor.state = view.state;
					editor.tools = textToolbar({ view, state: view.state, reset });
				}
			};
		}
	});

	let editorView: EditorView | undefined = undefined;

	function createEditor(el: HTMLElement) {
		editorView = new EditorView(el, {
			state: EditorState.create({
				doc: doc,
				schema: schema,
				plugins: [
					buildInputRules(schema),
					keymap(buildKeymap(schema)),
					keymap(baseKeymap),
					history(),
					onUpdatePlugin
				]
			}),
			dispatchTransaction(this: EditorView, transaction) {
				const editorState = this.state.apply(transaction);
				if (transaction.docChanged) {
					content = toHTML(editorState);
				}
				editor.state = editorState;
				this.updateState(editorState);
			}
		});

		return {
			destroy() {
				editorView?.destroy();
			}
		};
	}

	function reset() {
		_content = content;
	}

	$effect(() => {
		if (content) {
			reset();
		}
	});
</script>

<div id="prosemirror-editor" use:createEditor></div>

<style>
	:global(#prosemirror-editor .ProseMirror) {
		outline: none;
		white-space: pre-wrap;
		word-wrap: break-word;
	}
</style>
