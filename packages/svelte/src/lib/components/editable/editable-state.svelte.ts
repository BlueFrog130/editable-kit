/**
 * Global toolbar state
 */
import type { Editor } from '@tiptap/core';
import { debounce } from '@editable-kit/core';

export type EditableCommand = {
	readonly isActive: boolean;
	readonly has: boolean;
	run(): void;
};

export class EditableState {
	#active: Editor | undefined = $state(undefined);

	// Bumped on each TipTap transaction (debounced).
	// Any method that reads this becomes reactive to editor changes.
	#version = $state(0);

	#transactionHandler: (() => void) | undefined;
	#transactionHandlerCancel: (() => void) | undefined;

	get editor() {
		return this.#active;
	}

	set editor(value: Editor | undefined) {
		if (this.#active && this.#transactionHandler) {
			this.#transactionHandlerCancel?.();
			this.#active.off('transaction', this.#transactionHandler);
		}
		this.#transactionHandler = undefined;
		this.#transactionHandlerCancel = undefined;

		this.#active = value;

		if (value) {
			const { call, cancel } = debounce(() => this.#version++, {
				timing: 'both',
				maxWaitMs: 500,
				waitMs: 200
			});

			this.#transactionHandler = () => call();
			this.#transactionHandlerCancel = cancel;
			value.on('transaction', this.#transactionHandler);
		}
	}

	/** Whether a mark/node is active on the current editor. Reactive. */
	isActive(name: string, attributes?: Record<string, unknown>): boolean {
		void this.#version;
		if (!this.editor) return false;
		return this.editor.isActive(name, attributes);
	}

	/** Whether a mark/node extension exists on the current editor's schema. */
	has(extension: string): boolean {
		if (!this.editor) return false;
		const schema = this.editor.state.schema;
		return extension in schema.marks || extension in schema.nodes;
	}

	run<R>(fn: (editor: Editor) => R) {
		if (!this.#active) return;
		return fn(this.#active);
	}

	/**
	 * Create a toolbar command that groups isActive, has, and run for a given extension.
	 *
	 * ```ts
	 * const bold = state.command('bold', (e) => e.chain().focus().toggleBold().run());
	 * // bold.isActive — reactive
	 * // bold.has — is extension available
	 * // bold.run() — execute the command
	 * ```
	 */
	command(
		name: string,
		fn: (editor: Editor) => void,
		attributes?: Record<string, unknown>
	): EditableCommand {
		// Arrows, not a `const state = this` alias: same capture, no shadow variable.
		const isActive = () => this.isActive(name, attributes);
		const has = () => this.has(name);

		return {
			get isActive() {
				return isActive();
			},
			get has() {
				return has();
			},
			run: () => this.editor && fn(this.editor)
		};
	}
}
