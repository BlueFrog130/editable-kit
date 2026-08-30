import { render, cleanup, waitFor } from '@testing-library/svelte';
import { afterEach, describe, it, expect, vi } from 'vitest';
import type { Editor } from '@tiptap/core';
import type { ProseMirrorJSON } from '$lib/types/prosemirror.js';
import Harness from './editable.test.svelte';

afterEach(() => cleanup());

const doc = (text: string): ProseMirrorJSON => ({
	type: 'doc',
	content: [{ type: 'text', text }]
});

function field() {
	// Re-query every time: the element is re-created when the editor mounts.
	return document.querySelector('[data-ek-field]') as HTMLElement;
}

type Api = { save: () => Promise<void>; reset: () => void; dirty: boolean };

/** Renders the harness and focuses the field, waiting for TipTap to take over. */
async function setup(onsave?: (data: { title: ProseMirrorJSON }) => void) {
	const data = $state({ title: doc('Hello') });
	let editor!: Editor;
	let api!: Api;

	render(Harness, {
		data,
		editing: true,
		onsave,
		oncreate: (e: Editor) => (editor = e),
		onapi: (a: Api) => (api = a)
	});

	field().dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
	await waitFor(() => expect(editor).toBeDefined());
	// jsdom will not focus a contenteditable through `.focus()`, so hand ProseMirror
	// the DOM event it actually listens for. That is what makes TipTap's onFocus fire.
	editor.view.dom.dispatchEvent(new FocusEvent('focus'));
	await waitFor(() => expect(editor.isFocused).toBe(true));

	return { data, editor, api };
}

describe('Editable.Root with directly bound fields', () => {
	it('writes edits into the bound property on blur', async () => {
		const { data, editor } = await setup();

		editor.commands.insertContent(' world');
		editor.commands.blur();

		await waitFor(() => {
			expect(JSON.stringify(data.title)).toContain('world');
		});
	});

	it('marks the root dirty once a field really changes', async () => {
		const { editor, api } = await setup();

		editor.commands.blur();
		expect(api.dirty).toBe(false);

		editor.commands.insertContent('!');
		editor.commands.blur();

		await waitFor(() => expect(api.dirty).toBe(true));
	});

	it('hands onsave a current snapshot without needing a blur', async () => {
		const onsave = vi.fn();
		const { editor, api } = await setup(onsave);

		// No blur: `save()` flushes the focused field first, which is the whole point.
		editor.commands.insertContent(' there');
		await api.save();

		expect(JSON.stringify(onsave.mock.calls[0][0])).toContain('there');
		expect(api.dirty).toBe(false);
	});

	it('restores the original content on reset', async () => {
		const { editor, api } = await setup();

		editor.commands.insertContent(' world');
		editor.commands.blur();
		await waitFor(() => expect(api.dirty).toBe(true));

		api.reset();

		await waitFor(() => expect(field().textContent).toBe('Hello'));
		expect(api.dirty).toBe(false);
	});
});
