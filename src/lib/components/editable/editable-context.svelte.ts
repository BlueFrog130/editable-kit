import { setContext, getContext } from 'svelte';
import { EditableState } from './editable-state.svelte.js';
import type { EditorContent } from '../editor/index.js';

const EDITABLE_CONTEXT_KEY = Symbol('editable-context');

export function getEditableContext() {
	return getContext<EditableContext>(EDITABLE_CONTEXT_KEY);
}

export function tryGetEditableContext(): EditableContext | undefined {
	try {
		return getContext<EditableContext>(EDITABLE_CONTEXT_KEY);
	} catch {
		return undefined;
	}
}

export function setEditableContext(context: EditableContext) {
	return setContext(EDITABLE_CONTEXT_KEY, context);
}

type EditableDataEvents = {
	save: () => Promise<Record<string, EditorContent> | Record<string, EditorContent>[]>;
};

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export class EditableContext {
	#editing: { value: boolean };
	state: EditableState | undefined = $state();
	saveStatus: SaveStatus = $state('idle');

	private editableData = new Map<string, EditableDataEvents>();
	private saveStatusTimeout: ReturnType<typeof setTimeout> | undefined;

	constructor(editing: { value: boolean }) {
		this.#editing = editing;
		$effect.pre(() => {
			if (editing.value && !this.state) {
				this.state = new EditableState();
			}
			if (!editing.value && this.state) {
				this.state.active = undefined;
			}
		});
	}

	get editing() {
		return this.#editing.value;
	}

	public register(key: string, data: EditableDataEvents) {
		this.editableData.set(key, data);
		return () => {
			this.editableData.delete(key);
		};
	}

	public destroy() {
		clearTimeout(this.saveStatusTimeout);
	}

	public async get(key: string) {
		const data = this.editableData.get(key);
		if (!data) return undefined;
		return data.save();
	}

	public async save() {
		clearTimeout(this.saveStatusTimeout);
		this.saveStatus = 'saving';

		try {
			const results = new Map<
				string,
				Record<string, EditorContent> | Record<string, EditorContent>[]
			>();
			for (const [key, data] of this.editableData) {
				results.set(key, await data.save());
			}

			this.saveStatus = 'saved';
			this.saveStatusTimeout = setTimeout(() => {
				this.saveStatus = 'idle';
			}, 2000);

			return results;
		} catch {
			this.saveStatus = 'error';
			this.saveStatusTimeout = setTimeout(() => {
				this.saveStatus = 'idle';
			}, 3000);
			throw new Error('Save failed');
		}
	}
}
