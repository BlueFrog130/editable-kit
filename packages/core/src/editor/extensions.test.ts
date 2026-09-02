import { describe, it, expect } from 'vitest';
import { getSchema, type Extensions } from '@tiptap/core';
import { Node } from '@tiptap/pm/model';
import Doc from '@tiptap/extension-document';
import Text from '@tiptap/extension-text';
import Italic from '@tiptap/extension-italic';
import { EkImage } from './image-extension.js';
import { importEditor, defaultExtensions } from './index.js';
import type { Variant } from './types.js';

const variants: Variant[] = ['plain', 'multiline', 'rich', 'image'];

// Building the schema is what threw "Every schema needs a 'text' type", and it only
// threw on first focus of an image field. Build every variant's schema up front.
describe.each(variants)('%s extensions', (variant) => {
	it('builds a valid ProseMirror schema', async () => {
		const [, extensions] = await importEditor(variant);
		expect(() => getSchema(extensions)).not.toThrow();
	});
});

describe('importEditor', () => {
	const placeholderOf = (exts: Extensions) =>
		(exts.find((e) => e.name === 'placeholder')?.options as { placeholder?: string } | undefined)
			?.placeholder;

	it('uses the variant defaults when no extensions are given', async () => {
		const [, extensions] = await importEditor('rich');
		expect(extensions).toBe(await defaultExtensions('rich'));
	});

	it('replaces the defaults outright … no merging', async () => {
		const [, extensions] = await importEditor('rich', { extensions: [Doc, Text, Italic] });
		expect(extensions.map((e) => e.name)).toEqual(['doc', 'text', 'italic']);
	});

	// The point of the promise form: it starts before the defaults have loaded.
	it('accepts a promise of extensions', async () => {
		const [, extensions] = await importEditor('rich', {
			extensions: Promise.resolve([Doc, Text, Italic])
		});
		expect(extensions.map((e) => e.name)).toEqual(['doc', 'text', 'italic']);
	});

	it('configures the placeholder extension without mutating the cached defaults', async () => {
		const [, extensions] = await importEditor('rich', { placeholder: 'Title…' });

		expect(placeholderOf(extensions)).toBe('Title…');
		expect(placeholderOf(await defaultExtensions('rich'))).toBe('Type something…');
	});

	// `placeholder: ''` is a deliberate "no placeholder", not an absent option.
	it('treats an empty placeholder as a value, but leaves undefined alone', async () => {
		const [, empty] = await importEditor('rich', { placeholder: '' });
		expect(placeholderOf(empty)).toBe('');

		const [, none] = await importEditor('rich', { placeholder: undefined });
		expect(none).toBe(await defaultExtensions('rich'));
	});
});

describe('EkImage', () => {
	// Intrinsic dimensions are the whole reason this extension exists: TipTap's own
	// Image extension drops width/height, so the <img> shifts the page as it loads.
	it('keeps width and height through a document round trip', () => {
		const schema = getSchema([Doc, Text, EkImage]);
		const node = Node.fromJSON(schema, {
			type: 'doc',
			content: [{ type: 'image', attrs: { src: 'a.png', width: 800, height: 450 } }]
		});

		expect(node.toJSON().content[0].attrs).toMatchObject({ width: 800, height: 450 });
	});

	it('defaults both to null rather than dropping the attributes', () => {
		const schema = getSchema([Doc, Text, EkImage]);
		const attrs = schema.nodes.image.createAndFill({ src: 'a.png' })!.attrs;

		expect([attrs.width, attrs.height]).toEqual([null, null]);
	});
});
