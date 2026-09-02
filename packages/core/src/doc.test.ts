import { describe, it, expect } from 'vitest';
import { getSchema, type Extensions } from '@tiptap/core';
import { Node } from '@tiptap/pm/model';
import {
	text,
	paragraphs,
	image,
	imageAttrs,
	textContent,
	doc,
	heading,
	codeBlock,
	list
} from './doc.js';
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

describe('doc', () => {
	it('flattens documents and keeps bare nodes, in order', () => {
		const built = doc(heading(2, 'Title'), paragraphs('One', 'Two'), list(['A', 'B']));
		expect(built.content?.map((node) => node.type)).toEqual([
			'heading',
			'paragraph',
			'paragraph',
			'bulletList'
		]);

		const parsed = parse(rich, built);
		expect(parsed.textContent).toBe('TitleOneTwoAB');
		expect(parsed.child(0).attrs.level).toBe(2);
	});

	// image() is an empty document when nothing is picked — it must not leave a hole.
	it('drops an empty document', () => {
		expect(doc(paragraphs('One'), image()).content).toHaveLength(1);
		expect(doc().content).toEqual([]);
	});
});

describe('list', () => {
	it('nests listItem > paragraph, which the schema requires', () => {
		const ordered = parse(rich, doc(list(['A'], true)));
		expect(ordered.child(0).type.name).toBe('orderedList');
		expect(ordered.child(0).child(0).child(0).type.name).toBe('paragraph');
	});
});

describe('codeBlock', () => {
	// No CodeBlock extension in core's sets, so this is a shape check, not a parse.
	it('carries the language and holds the code as one text node', () => {
		expect(codeBlock('const a = 1;', 'typescript')).toEqual({
			type: 'codeBlock',
			attrs: { language: 'typescript' },
			content: [{ type: 'text', text: 'const a = 1;' }]
		});
		expect(codeBlock()).toEqual({ type: 'codeBlock', attrs: { language: null } });
	});
});

describe('textContent', () => {
	it('separates blocks and joins the text runs inside one', () => {
		expect(textContent(paragraphs('One', 'Two'))).toBe('One\nTwo');
		expect(textContent(doc(heading(1, 'Title'), list(['A', 'B'])))).toBe('Title\nA\nB');
		expect(
			textContent({
				type: 'paragraph',
				content: [
					{ type: 'text', text: 'bold' },
					{ type: 'text', text: 'ed', marks: [{ type: 'bold' }] }
				]
			})
		).toBe('bolded');
	});

	// Matches ProseMirror's textBetween: an empty block still separates.
	it('is what ProseMirror\u2019s own textContent would be', () => {
		const built = doc(paragraphs('a', '', 'b'));
		expect(textContent(built)).toBe('a\n\nb');
		expect(parse(rich, built).textBetween(0, parse(rich, built).content.size, '\n')).toBe(
			textContent(built)
		);
	});

	it('keeps a code block\u2019s newlines and is empty for an empty document', () => {
		expect(textContent(codeBlock('a\nb'))).toBe('a\nb');
		expect(textContent(text())).toBe('');
		expect(textContent(image('a.png'))).toBe('');
	});
});
