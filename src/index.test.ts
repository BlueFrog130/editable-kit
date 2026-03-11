import { describe, it, expect } from 'vitest';

describe('library exports', () => {
	it('exports editable context components', async () => {
		const lib = await import('$lib/index.js');
		expect(lib.Root).toBeDefined();
		expect(lib.Data).toBeDefined();
		expect(lib.Each).toBeDefined();
	});

	it('exports standalone editor components', async () => {
		const lib = await import('$lib/index.js');
		expect(lib.PlainText).toBeDefined();
		expect(lib.MultilineText).toBeDefined();
		expect(lib.RichText).toBeDefined();
		expect(lib.EditableImage).toBeDefined();
	});

	it('exports EditableState class', async () => {
		const lib = await import('$lib/index.js');
		expect(lib.EditableState).toBeDefined();
		expect(typeof lib.EditableState).toBe('function');
	});

	it('exports Renderer component', async () => {
		const lib = await import('$lib/index.js');
		expect(lib.Renderer).toBeDefined();
	});
});
