import { render, cleanup, waitFor } from '@testing-library/svelte';
import { afterEach, describe, it, expect, vi } from 'vitest';
import Field from './field.svelte';
import { pickFile } from './pick-file.js';
import { image, paragraphs } from '$lib/doc.js';
import type { ProseMirrorJSON } from '$lib/types/prosemirror.js';

afterEach(() => cleanup());

const doc: ProseMirrorJSON = {
	type: 'doc',
	content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }]
};

function field() {
	return document.querySelector('[data-ek-field]') as HTMLElement;
}

/** pickFile never appends the input, so hand it back the one it just created. */
function spyInput() {
	const input = document.createElement('input');
	input.click = vi.fn();
	vi.spyOn(document, 'createElement').mockReturnValueOnce(input);
	return input;
}

describe('Field', () => {
	it('renders the document without an editor when not editing', () => {
		render(Field, { content: doc, variant: 'rich', editing: false });

		expect(field().querySelector('p')?.textContent).toBe('Hello');
		expect(field().getAttribute('contenteditable')).toBeNull();
	});

	it('adds no extra element when the editor mounts', async () => {
		render(Field, { content: doc, variant: 'rich', editing: true });

		const before = field();
		const parent = before.parentElement;
		expect(before.getAttribute('contenteditable')).toBeNull();

		before.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));

		await waitFor(() => {
			expect(field().getAttribute('contenteditable')).toBe('true');
		});

		// The claim this library rests on: editing does not introduce a new box.
		// Same tag, same parent, same slot in the tree, no nested editor wrapper.
		const after = field();
		expect(document.querySelectorAll('[data-ek-field]')).toHaveLength(1);
		expect(after.tagName).toBe(before.tagName);
		expect(after.parentElement).toBe(parent);
		expect(after.querySelector('.ProseMirror')).toBeNull();
		expect(after.querySelector('[data-ek-field]')).toBeNull();
		expect(after.textContent).toContain('Hello');
	});

	it('restores the element when editing is switched off', async () => {
		const { rerender } = render(Field, { content: doc, variant: 'rich', editing: true });

		// the element is re-created on activation, so re-query rather than hold a reference
		field().dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
		await waitFor(() => expect(field().getAttribute('contenteditable')).toBe('true'));

		await rerender({ content: doc, variant: 'rich', editing: false });

		await waitFor(() => {
			expect(field().getAttribute('contenteditable')).toBeNull();
		});
		expect(field().classList.contains('ProseMirror')).toBe(false);
		expect(field().querySelector('p')?.textContent).toBe('Hello');
	});

	it('reports its value with no editor mounted', () => {
		const { component } = render(Field, { content: doc, variant: 'rich', editing: false });

		// The document itself, not a { type, content } envelope
		expect(component.getValue()).toEqual(doc);
	});

	it('stores an image field as a document too, not as { src, alt }', () => {
		const cover = image('a.png', { alt: 'A' });
		const { component } = render(Field, { content: cover, variant: 'image', editing: false });

		expect(component.getValue()).toEqual(cover);
	});

	it('marks an unpicked image field as the placeholder rule sees it, and a picked one not', () => {
		const { unmount } = render(Field, { content: image(), variant: 'image', editing: true });
		expect(field().matches(':not(:has(img))')).toBe(true);
		unmount();

		render(Field, { content: image('a.png'), variant: 'image', editing: false });
		expect(field().matches(':not(:has(img))')).toBe(false);
	});

	it('renders an image field through the Renderer, dimensions included', () => {
		render(Field, {
			content: image('a.png', { alt: 'A', width: 800, height: 450 }),
			variant: 'image',
			editing: false
		});

		// The Renderer emits width/height so the image reserves space before it loads —
		// the hand-rolled <img> this replaced dropped them.
		const img = field().querySelector('img')!;
		expect([img.getAttribute('src'), img.getAttribute('alt')]).toEqual(['a.png', 'A']);
		expect([img.getAttribute('width'), img.getAttribute('height')]).toEqual(['800', '450']);
	});
});

describe('Field element', () => {
	// A plain field sits inline (a heading, a table cell); a div there is invalid HTML.
	it('is a span for the plain variant and a div for every other', () => {
		const tag = (variant: 'plain' | 'multiline' | 'rich' | 'image') => {
			const { unmount } = render(Field, { content: doc, variant, editing: false });
			const t = field().tagName;
			unmount();
			return t;
		};

		expect(tag('plain')).toBe('SPAN');
		expect([tag('multiline'), tag('rich'), tag('image')]).toEqual(['DIV', 'DIV', 'DIV']);
	});

	it('is only reachable and labelled when editing', async () => {
		const { rerender } = render(Field, {
			content: doc,
			variant: 'rich',
			editing: false,
			'aria-label': 'Body'
		});

		expect(field().getAttribute('tabindex')).toBeNull();
		expect(field().getAttribute('role')).toBeNull();
		expect(field().getAttribute('aria-label')).toBe('Body');

		await rerender({ content: doc, variant: 'rich', editing: true, 'aria-label': 'Body' });
		expect(field().getAttribute('tabindex')).toBe('0');
		expect(field().getAttribute('role')).toBe('textbox');
	});

	it('offers an image field as a button, not a textbox', async () => {
		render(Field, { content: image(), variant: 'image', editing: true });
		expect(field().getAttribute('role')).toBe('button');
	});

	it('carries the variant so the placeholder CSS can find it', () => {
		render(Field, { content: doc, variant: 'multiline', editing: false });
		expect(field().getAttribute('data-ek-variant')).toBe('multiline');
	});
});

describe('Field content sync', () => {
	it('re-renders view mode when the bound document changes underneath it', async () => {
		const { rerender } = render(Field, { content: doc, variant: 'rich', editing: false });

		await rerender({ content: paragraphs('Goodbye'), variant: 'rich', editing: false });
		expect(field().querySelector('p')?.textContent).toBe('Goodbye');
	});

	// External writes (a reset, a fetch landing) must reach a mounted, unfocused editor.
	it('pushes an external change into a mounted editor', async () => {
		const { rerender } = render(Field, { content: doc, variant: 'rich', editing: true });

		field().dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
		await waitFor(() => expect(field().getAttribute('contenteditable')).toBe('true'));

		await rerender({ content: paragraphs('Replaced'), variant: 'rich', editing: true });
		await waitFor(() => expect(field().textContent).toContain('Replaced'));
	});

	it('reports the mounted editor value, not the prop it was created with', async () => {
		const { component } = render(Field, { content: doc, variant: 'rich', editing: true });

		field().dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
		await waitFor(() => expect(field().getAttribute('contenteditable')).toBe('true'));

		expect(JSON.stringify(component.getValue())).toContain('Hello');
	});

	it('fires onchange with the document when editing is switched off', async () => {
		const onchange = vi.fn();
		const { rerender } = render(Field, { content: doc, variant: 'rich', editing: true, onchange });

		field().dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
		await waitFor(() => expect(field().getAttribute('contenteditable')).toBe('true'));

		await rerender({ content: doc, variant: 'rich', editing: false, onchange });
		await waitFor(() => expect(onchange).toHaveBeenCalled());
		expect(onchange.mock.lastCall?.[0]).toEqual(doc);
	});

	it('runs the oncreate and ondestroy hooks around the editor lifetime', async () => {
		const oncreate = vi.fn();
		const ondestroy = vi.fn();
		const options = { oncreate, ondestroy };
		const { rerender } = render(Field, { content: doc, variant: 'rich', editing: true, options });

		field().dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
		await waitFor(() => expect(oncreate).toHaveBeenCalledOnce());

		await rerender({ content: doc, variant: 'rich', editing: false, options });
		await waitFor(() => expect(ondestroy).toHaveBeenCalledOnce());
		expect(ondestroy.mock.lastCall?.[0]).toBe(oncreate.mock.lastCall?.[0]);
	});

	it('does not mount an editor on focus when not editing', async () => {
		render(Field, { content: doc, variant: 'rich', editing: false });

		field().dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
		await new Promise((r) => setTimeout(r, 20));

		expect(field().getAttribute('contenteditable')).toBeNull();
	});
});

describe('pickFile', () => {
	it('resolves with the chosen file', async () => {
		const input = spyInput();
		const pending = pickFile();

		const file = new File(['x'], 'a.png', { type: 'image/png' });
		Object.defineProperty(input, 'files', { value: [file] });
		input.onchange!(new Event('change'));

		expect(await pending).toBe(file);
	});

	it('resolves undefined when the dialog is dismissed', async () => {
		const input = spyInput();
		const pending = pickFile();

		input.oncancel!(new Event('cancel'));
		expect(await pending).toBeUndefined();
	});

	it('opens an image-only picker', () => {
		const input = spyInput();
		void pickFile();

		expect([input.type, input.accept]).toEqual(['file', 'image/*']);
		expect(input.click).toHaveBeenCalledOnce();
	});
});
