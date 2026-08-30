import { describe, it, expect } from 'vitest';
import { getSchema, type Extensions } from '@tiptap/core';
import { Node } from '@tiptap/pm/model';
import Doc from '@tiptap/extension-document';
import Text from '@tiptap/extension-text';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import { Placeholder } from '@tiptap/extension-placeholder';
import { resolveExtensions } from './resolve-extensions.js';
import { EkImage } from './image-extension.js';
import { importEditor } from './index.js';
import type { Variant } from './types.js';

const variants: Variant[] = ['plain', 'multiline', 'rich', 'image'];

// Building the schema is what threw "Every schema needs a 'text' type", and it only
// threw on first focus of an image field. Build every variant's schema up front.
describe.each(variants)('%s extensions', (variant) => {
	it('builds a valid ProseMirror schema', async () => {
		const [, { extensions }] = await importEditor(variant);
		expect(() => getSchema(extensions)).not.toThrow();
	});
});

describe('resolveExtensions', () => {
	const defaults: Extensions = [Placeholder.configure({ placeholder: 'default' }), Bold];

	const placeholderOf = (exts: Extensions) =>
		(exts.find((e) => e.name === 'placeholder')?.options as { placeholder?: string } | undefined)
			?.placeholder;

	it('returns the defaults untouched with no options', async () => {
		expect(await resolveExtensions(defaults)).toBe(defaults);
		expect(await resolveExtensions(defaults, {})).toBe(defaults);
	});

	it('configures the placeholder extension in place', async () => {
		const result = await resolveExtensions(defaults, { placeholder: 'Title…' });

		expect(placeholderOf(result)).toBe('Title…');
		// non-placeholder extensions are carried through, and the defaults are not mutated
		expect(result.map((e) => e.name)).toEqual(['placeholder', 'bold']);
		expect(placeholderOf(defaults)).toBe('default');
	});

	// `placeholder: ''` is a deliberate "no placeholder", not an absent option.
	it('treats an empty placeholder as a value, but leaves undefined alone', async () => {
		expect(placeholderOf(await resolveExtensions(defaults, { placeholder: '' }))).toBe('');
		expect(await resolveExtensions(defaults, { placeholder: undefined })).toBe(defaults);
	});

	it('hands the defaults to an extensions callback and takes what it returns', async () => {
		const received: Extensions[] = [];
		const result = await resolveExtensions(defaults, {
			extensions: (d) => {
				received.push(d);
				return [Italic];
			}
		});

		expect(received[0]).toBe(defaults);
		expect(result.map((e) => e.name)).toEqual(['italic']);
	});

	it('awaits an async callback, which is how lazy imports are meant to work', async () => {
		const result = await resolveExtensions(defaults, {
			extensions: async (d) => [...d, Italic]
		});

		expect(result.map((e) => e.name)).toEqual(['placeholder', 'bold', 'italic']);
	});

	it('applies the placeholder before the callback, so the callback can override it', async () => {
		const result = await resolveExtensions(defaults, {
			placeholder: 'first',
			extensions: (d) =>
				d.map((e) => (e.name === 'placeholder' ? e.configure({ placeholder: 'last' }) : e))
		});

		expect(placeholderOf(result)).toBe('last');
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
