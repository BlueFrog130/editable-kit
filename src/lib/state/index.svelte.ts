import type { EditorState } from 'prosemirror-state';
import type { ChangeFunction } from './index.js';
import { EditorView } from 'prosemirror-view';

class GlobalEditorState {
	isEditing = $state(false);

	view = $state<EditorView | null>(null);
	state = $state<EditorState | null>(null);

	#changes = $state<ChangeFunction[]>([]);

	queueChange(change: ChangeFunction) {
		this.#changes.push(change);
	}

	async applyChanges() {
		await Promise.all(this.#changes.map((change) => change()));
		this.#changes = [];
	}
}

export let editor = new GlobalEditorState();
