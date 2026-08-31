import { describe, it, expect } from 'vitest';

describe('library exports', () => {
	it('exports the components the docs tell you to import', async () => {
		const lib = await import('$lib/index.js');
		expect(Object.keys(lib)).toEqual(
			expect.arrayContaining(['Root', 'Field', 'Text', 'Multiline', 'Rich', 'Image', 'Renderer'])
		);
	});

	it('exports EditableState class', async () => {
		const lib = await import('$lib/index.js');
		expect(typeof lib.EditableState).toBe('function');
	});
});
