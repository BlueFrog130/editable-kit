import { describe, it, expect } from 'vitest';
import { getSchema, type Extensions } from '@tiptap/core';
import { Node } from '@tiptap/pm/model';
import { text, paragraphs } from './doc.js';
import type { ProseMirrorJSON } from './types/prosemirror.js';
import { extensions as plain } from './components/editor/extensions-plain.js';
import { extensions as multiline } from './components/editor/extensions-multiline.js';
import { extensions as rich } from './components/editor/extensions-rich.js';

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
