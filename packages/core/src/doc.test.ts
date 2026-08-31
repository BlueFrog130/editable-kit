import { describe, it, expect } from 'vitest';
import { getSchema, type Extensions } from '@tiptap/core';
import { Node } from '@tiptap/pm/model';
import { text, paragraphs, image, imageAttrs } from './doc.js';
import type { ProseMirrorJSON } from './prosemirror.js';
import { extensions as plain } from './editor/extensions-plain.js';
import { extensions as multiline } from './editor/extensions-multiline.js';
import { extensions as rich } from './editor/extensions-rich.js';
import { extensions as imageExts } from './editor/extensions-image.js';

/** The only check that matters: a real editor can load what the helper produced. */
function parse(exts: Extensions, doc: ProseMirrorJSON) {
	return Node.fromJSON(getSchema(exts), doc);
}

describe('text', () => {
	it('produces a document a plain field can load', () => {
		expect(parse(plain, text('Hello')).textContent).toBe('Hello');
	});

	// Hand-written `{ type: 'text', text: '' }` throws "Empty text nodes are not
	// allowed" — but only once the editor mounts, so it looks like a focus bug.
	it('survives an empty string', () => {
		expect(() => parse(plain, text())).not.toThrow();
		expect(parse(plain, text('')).textContent).toBe('');
	});
});

describe('paragraphs', () => {
	it('wraps each argument in its own paragraph', () => {
		const doc = paragraphs('One', 'Two');
		expect(doc.content).toHaveLength(2);
		expect(parse(rich, doc).textContent).toBe('OneTwo');
		expect(parse(multiline, doc).childCount).toBe(2);
	});

	it('defaults to one empty paragraph, which every rich schema accepts', () => {
		expect(() => parse(rich, paragraphs())).not.toThrow();
		expect(() => parse(multiline, paragraphs())).not.toThrow();
		expect(parse(rich, paragraphs()).childCount).toBe(1);
	});
});

describe('image', () => {
	it('produces a document an image field can load', () => {
		const doc = parse(imageExts, image('a.png', { alt: 'A' }));
		expect(doc.childCount).toBe(1);
		expect(doc.child(0).attrs.src).toBe('a.png');
		expect(doc.child(0).attrs.alt).toBe('A');
	});

	// An `<img src="">` requests the current page; an empty document renders nothing.
	it('is an empty document when nothing has been picked', () => {
		expect(image().content).toEqual([]);
		expect(() => parse(imageExts, image())).not.toThrow();
	});

	it('round-trips width and height, which is what stops the layout shift', () => {
		const doc = parse(imageExts, image('a.png', { width: 800, height: 450 }));
		expect([doc.child(0).attrs.width, doc.child(0).attrs.height]).toEqual([800, 450]);
	});
});

describe('imageAttrs', () => {
	it('reads back what image() stored', () => {
		expect(imageAttrs(image('a.png', { alt: 'A', width: 8 }))).toEqual({
			src: 'a.png',
			alt: 'A',
			width: 8
		});
	});

	it('is {} for an unpicked image and for a document that holds no image', () => {
		expect(imageAttrs(image())).toEqual({});
		expect(imageAttrs(text('hi'))).toEqual({});
		expect(imageAttrs(paragraphs('hi'))).toEqual({});
	});
});
