import { getContext, setContext, untrack } from 'svelte';
import type { EditableState } from './editable-state.svelte.js';

const context = Symbol('editable-context');

export function setEditableContext() {
	return setContext(context, new EditableContext());
}

export function getEditableContext(): EditableContext {
	return getContext(context);
}

type EditableDataEvents = {
	save: () => Promise<void>;
};

export class EditableContext {
	editing = $state(false);
	state: EditableState | undefined = $state();

	private editableData = new Map<Symbol, EditableDataEvents>();

	constructor() {
		$effect.pre(() => {
			if (this.editing && !this.state) {
				untrack(() => {
					import('./editable-state.svelte.js').then(({ EditableState }) => {
						this.state = new EditableState();
					});
				});
			}
		});
	}

	public register(data: EditableDataEvents) {
		const id = Symbol();
		this.editableData.set(id, data);
		return () => {
			this.editableData.delete(id);
		};
	}

	public async save() {
		for (const data of this.editableData.values()) {
			await data.save();
		}
	}
}
