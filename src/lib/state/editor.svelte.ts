import { debounce } from '$lib/util/debounce.js';
import type { Editor } from '@tiptap/core';
import type { Transaction } from '@tiptap/pm/state';

export type Editable =
	| {
			type: 'image';
			editor: {
				replaceImage: () => void;
			};
	  }
	| {
			type: 'text';
			editor: Editor;
	  };

class EditorState {
	editing = $state(false);
	active: Editable | undefined = $state.raw(undefined);

	props = {
		onfocus: (editor: Editor) =>
			(this.active = {
				type: 'text',
				editor
			})
	};

	has(extension: string) {
		let has = $derived.by(() => {
			if (this.active?.type !== 'text') return false;

			const schema = this.active.editor.state.schema;

			return extension in schema.marks || extension in schema.nodes;
		});

		return has;
	}

	isActive(name: string, attributes?: {}) {
		let active = $state(
			this.active?.type === 'text' ? this.active.editor.isActive(name, attributes) : false
		);

		let { call, cancel } = debounce(
			(editor: Editor) => {
				active = editor.isActive(name, attributes);
			},
			{
				timing: 'both',
				waitMs: 200,
				maxWaitMs: 500
			}
		);

		const handleTransaction = ({ editor }: { editor: Editor; transaction: Transaction }) =>
			call(editor);

		$effect.pre(() => {
			if (this.active?.type !== 'text') return;

			this.active.editor.on('transaction', handleTransaction);

			return () => {
				cancel();
				if (this.active?.type !== 'text') return;
				this.active.editor.off('transaction', handleTransaction);
			};
		});

		return active;
	}

	text<R>(fn: (editor: Editor) => R): R | undefined {
		if (this.active?.type !== 'text') return;

		return fn(this.active.editor);
	}
}

export const editor = new EditorState();
export type EditorStateType = InstanceType<typeof EditorState>;
