import { setContext, getContext } from 'svelte';
import { EditableState } from './editable-state.svelte.js';
import type { MaybePromise } from '$lib/types.js';
import type { TextEditorOptions, UploadHandler } from '../editor/types.js';
import type { NodeOverrides } from '../renderer/types.js';

const EDITABLE_CONTEXT_KEY = Symbol('editable-context');

export function getEditableContext() {
	return getContext<EditableContext | undefined>(EDITABLE_CONTEXT_KEY);
}

export function setEditableContext(context: EditableContext) {
	return setContext(EDITABLE_CONTEXT_KEY, context);
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

/** Live view of `Root`'s props. Getters, so the context tracks them reactively. */
export type EditableOptions = {
	readonly editing: boolean;
	/** Default upload handler for fields that do not pass their own. */
	readonly upload?: UploadHandler;
	/** Default renderer overrides. Fields merge their own over these. */
	readonly overrides?: NodeOverrides;
	/** Default editor options — TipTap extensions, placeholder, hooks. Fields merge over these. */
	readonly options?: TextEditorOptions;
	/** Put `Root`'s bound data back the way it was. No-op when `Root` has no `data`. */
	restore: () => void;
};

export class EditableContext {
	#options: EditableOptions;
	state: EditableState | undefined = $state();
	saveStatus: SaveStatus = $state('idle');

	/** Whether any field's value actually differs since the last save or reset. */
	dirty = $state(false);

	/**
	 * Writes the focused field's current content into its bound value. Fields normally
	 * only sync on blur, and a toolbar that preserves selection never blurs them, so
	 * `save()` calls this first. Plain property, not `$state` — nothing renders it.
	 */
	flush: (() => void) | undefined;

	#saveStatusTimeout: ReturnType<typeof setTimeout> | undefined;

	constructor(options: EditableOptions) {
		this.#options = options;
		$effect.pre(() => {
			if (options.editing && !this.state) {
				this.state = new EditableState();
			}
			if (!options.editing && this.state) {
				this.state.editor = undefined;
				this.flush = undefined;
			}
		});
	}

	get editing() {
		return this.#options.editing;
	}

	get upload() {
		return this.#options.upload;
	}

	get overrides() {
		return this.#options.overrides;
	}

	get editorOptions() {
		return this.#options.options;
	}

	public destroy() {
		clearTimeout(this.#saveStatusTimeout);
	}

	/** Discard every edit made since editing was switched on. */
	public reset() {
		this.flush = undefined;
		// Release focus so mounted editors accept the restored content. Blur the node
		// directly rather than via `commands.blur()` — that dispatches a transaction and
		// scrolls the selection into view, which is work we are about to discard anyway.
		const editor = this.state?.editor;
		if (editor && !editor.isDestroyed) editor.view.dom.blur();
		this.#options.restore();
		this.dirty = false;
	}

	#status(next: SaveStatus, resetAfterMs: number) {
		clearTimeout(this.#saveStatusTimeout);
		this.saveStatus = next;
		this.#saveStatusTimeout = setTimeout(() => {
			this.saveStatus = 'idle';
		}, resetAfterMs);
	}

	public async save(persist?: () => MaybePromise<void>) {
		this.flush?.();

		clearTimeout(this.#saveStatusTimeout);
		this.saveStatus = 'saving';

		try {
			await persist?.();
			this.dirty = false;
			this.#status('saved', 2000);
		} catch (error) {
			this.#status('error', 3000);
			throw new Error('editable-kit: save failed', { cause: error });
		}
	}
}
