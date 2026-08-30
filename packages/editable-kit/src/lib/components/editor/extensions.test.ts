import { describe, it, expect } from 'vitest';
import { getSchema } from '@tiptap/core';
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
