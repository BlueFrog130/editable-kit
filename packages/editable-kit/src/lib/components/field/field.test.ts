import { render, cleanup, waitFor } from '@testing-library/svelte';
import { afterEach, describe, it, expect } from 'vitest';
import Field from './field.svelte';
import { image } from '$lib/doc.js';
import type { ProseMirrorJSON } from '$lib/types/prosemirror.js';

afterEach(() => cleanup());

const doc: ProseMirrorJSON = {
	type: 'doc',
	content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }]
};

function field() {
	return document.querySelector('[data-ek-field]') as HTMLElement;
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
