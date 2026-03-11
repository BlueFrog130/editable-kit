/**
 * Global toolbar state
 */
import type { Editable } from '$lib/types.js';
import type { Editor } from '@tiptap/core';
import { debounce } from '$lib/util/debounce.js';

export type EditableCommand = {
	readonly isActive: boolean;
	readonly has: boolean;
	run(): void;
};

export class EditableState {
	#active: Editable | undefined = $state(undefined);

	// Bumped on each TipTap transaction (debounced).
	// Any method that reads this becomes reactive to editor changes.
	#version = $state(0);

	#transactionHandler: () => void = () => {};
	#transactionHandlerCancel: () => void = () => {};

	get active() {
		return this.#active;
	}

	set active(value: Editable | undefined) {
		if (this.#active?.editor && this.#active.type === 'text') {
			this.#transactionHandlerCancel();
			this.#active.editor.off('transaction', this.#transactionHandler);
		}

		this.#active = value;

		if (this.#active?.editor && this.#active.type === 'text') {
			const { call, cancel } = debounce(
				() => {
					this.#version++;
				},
				{
					timing: 'both',
					maxWaitMs: 500,
					waitMs: 200
				}
			);

			const handler = () => call();
			this.#transactionHandlerCancel = cancel;

			this.#active.editor.on('transaction', handler);
		}
	}

	/** Whether the active editor is a text editor. */
	get isText(): boolean {
		return this.active?.type === 'text';
	}

	/** Whether the active editor is an image editor. */
	get isImage(): boolean {
		return this.active?.type === 'image';
	}

	/** Whether a mark/node is active on the current text editor. Reactive. */
	isActive(name: string, attributes?: {}): boolean {
		void this.#version;
		if (this.active?.type !== 'text') return false;
		return this.active.editor.isActive(name, attributes);
	}

	/** Whether a mark/node extension exists on the current text editor's schema. */
	has(extension: string): boolean {
		if (this.active?.type !== 'text') return false;
		const schema = this.active.editor.state.schema;
		return extension in schema.marks || extension in schema.nodes;
	}

	/** Run a function against the active text editor if one exists. */
	text<R>(fn: (editor: Editor) => R): R | undefined {
		if (this.active?.type !== 'text') return;
		return fn(this.active.editor);
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
	command(name: string, fn: (editor: Editor) => void, attributes?: {}): EditableCommand {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const state = this;

		return {
			get isActive() {
				return state.isActive(name, attributes);
			},
			get has() {
				return state.has(name);
			},
			run() {
				state.text((e) => fn(e));
			}
		};
	}

	/** Replace the image on the active image editor. No-op if active editor is not an image. */
	replaceImage() {
		if (this.active?.type === 'image') {
			this.active.editor.replaceImage();
		}
	}

	/** Set the image src directly (e.g. a URL). No-op if active editor is not an image. */
	setImageSrc(src: string) {
		if (this.active?.type === 'image') {
			this.active.editor.setImageSrc(src);
		}
	}

	/** Get the alt text of the active image editor. Returns undefined if not an image. */
	getImageAlt(): string | undefined {
		if (this.active?.type === 'image') {
			return this.active.editor.getAlt();
		}
	}

	/** Set the alt text on the active image editor. No-op if active editor is not an image. */
	setImageAlt(alt: string) {
		if (this.active?.type === 'image') {
			this.active.editor.setAlt(alt);
		}
	}
}
