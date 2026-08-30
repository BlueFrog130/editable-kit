import { render, cleanup, waitFor } from '@testing-library/svelte';
import { afterEach, describe, it, expect, vi } from 'vitest';
import type { Editor } from '@tiptap/core';
import { paragraphs } from '$lib/doc.js';
import Harness from './editable-field.test.svelte';
import Text from './plain-text.svelte';
import Multiline from './multiline-text.svelte';
import Rich from './rich-text.svelte';
import Image from './editable-image.svelte';

afterEach(() => cleanup());

function field() {
	return document.querySelector('[data-ek-field]') as HTMLElement;
}

const editable = () => field().getAttribute('tabindex') === '0';

describe('Field variant wrappers', () => {
	it('each wrapper pins its own variant', () => {
		const variant = (Component: typeof Text) => {
			const { unmount } = render(Component, { value: paragraphs('x') });
			const v = field().getAttribute('data-ek-variant');
			unmount();
			return v;
		};

		expect([variant(Text), variant(Multiline), variant(Rich), variant(Image)]).toEqual([
			'plain',
			'multiline',
			'rich',
			'image'
		]);
	});

	// No Root, no `editing` prop — the field must not be editable by default.
	it('is read-only outside a Root', () => {
		render(Rich, { value: paragraphs('x') });
		expect(editable()).toBe(false);
	});
});

describe('Field context fallbacks', () => {
	it("inherits the Root's editing flag, and follows it as it flips", async () => {
		const { rerender } = render(Harness, { value: paragraphs('x'), editing: false });
		expect(editable()).toBe(false);

		await rerender({ value: paragraphs('x'), editing: true });
		await waitFor(() => expect(editable()).toBe(true));
	});

	it("an explicit editing prop beats the Root's", async () => {
		render(Harness, { value: paragraphs('x'), editing: true, fieldEditing: false });
		expect(editable()).toBe(false);
	});

	it("merges the Root's editor options under its own, per key", async () => {
		const rootCreate = vi.fn();
		const fieldCreate = vi.fn();
		render(Harness, {
			value: paragraphs('x'),
			editing: true,
			options: { placeholder: 'from root', oncreate: rootCreate },
			fieldOptions: { oncreate: fieldCreate }
		});

		field().dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
		await waitFor(() => expect(fieldCreate).toHaveBeenCalledOnce());

		// oncreate was overridden; placeholder came through from the Root untouched.
		expect(rootCreate).not.toHaveBeenCalled();
		const editor: Editor = fieldCreate.mock.lastCall![0];
		expect(
			editor.extensionManager.extensions.find((e) => e.name === 'placeholder')?.options.placeholder
		).toBe('from root');
	});

	it("uses the Root's options when the field passes none", async () => {
		const rootCreate = vi.fn();
		render(Harness, {
			value: paragraphs('x'),
			editing: true,
			options: { oncreate: rootCreate }
		});

		field().dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
		await waitFor(() => expect(rootCreate).toHaveBeenCalledOnce());
	});
});
