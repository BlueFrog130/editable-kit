import { render, cleanup, waitFor } from '@testing-library/svelte';
import { afterEach, describe, it, expect, vi } from 'vitest';
import type { Editor } from '@tiptap/core';
import type { ProseMirrorJSON } from '@editable-kit/core';
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

describe('Editable.Root reset', () => {
	// The comment in `restore` records the bug: handing `original` itself to the caller
	// let the state proxy write later edits back into it, so the second reset restored
	// the first reset's edits. Two rounds is what catches it.
	it('restores the same original content on a second reset', async () => {
		const { editor, api } = await setup();

		editor.commands.insertContent(' one');
		editor.commands.blur();
		await waitFor(() => expect(api.dirty).toBe(true));
		api.reset();
		await waitFor(() => expect(field().textContent).toBe('Hello'));

		editor.commands.focus();
		editor.commands.insertContent(' two');
		editor.commands.blur();
		await waitFor(() => expect(field().textContent).toContain('two'));
		api.reset();

		await waitFor(() => expect(field().textContent).toBe('Hello'));
		expect(api.dirty).toBe(false);
	});

	it('leaves data alone when nothing was edited', async () => {
		const { data, api } = await setup();
		api.reset();

		await waitFor(() => expect(field().textContent).toBe('Hello'));
		expect(data.title).toEqual(doc('Hello'));
	});

	it('reports a save failure to the caller and keeps the edit', async () => {
		const onsave = vi.fn(() => {
			throw new Error('offline');
		});
		const { editor, api } = await setup(onsave);

		editor.commands.insertContent('!');
		await expect(api.save()).rejects.toThrow('save failed');

		// The edit is not rolled back and stays flagged — the user retries with it.
		expect(field().textContent).toContain('!');
		expect(api.dirty).toBe(true);
	});

	it('announces save status in a live region', async () => {
		const onsave = vi.fn();
		const { api } = await setup(onsave);

		const region = document.querySelector('[aria-live="polite"]')!;
		expect(region.textContent?.trim()).toBe('');

		await api.save();
		await waitFor(() => expect(region.textContent).toContain('Changes saved.'));
	});
});

describe('Editable.Root dirty tracking', () => {
	// `flush` used to write the focused field's value straight past the dirty check, so
	// typing and saving without ever blurring left the form reading clean while its data
	// had already changed. Both write paths now agree.
	it('flags an unblurred edit as dirty, visible once the save fails', async () => {
		const { editor, api } = await setup(() => {
			throw new Error('offline');
		});
		expect(api.dirty).toBe(false);

		// No blur anywhere: the flush inside save() is the only thing that sees this edit.
		editor.commands.insertContent(' more');
		await expect(api.save()).rejects.toThrow('save failed');

		expect(api.dirty).toBe(true);
	});

	it('stays clean when a save flushes a field nobody touched', async () => {
		const onsave = vi.fn();
		const { api } = await setup(onsave);

		await api.save();
		expect(onsave).toHaveBeenCalledOnce();
		expect(api.dirty).toBe(false);
	});

	it('clears dirty again on a successful save of an unblurred edit', async () => {
		const onsave = vi.fn();
		const { editor, api } = await setup(onsave);

		editor.commands.insertContent('!');
		await api.save();

		expect(JSON.stringify(onsave.mock.calls[0][0])).toContain('!');
		expect(api.dirty).toBe(false);
	});
});
