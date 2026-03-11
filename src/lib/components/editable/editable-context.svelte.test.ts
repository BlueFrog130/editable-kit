// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
import { EditableContext } from './editable-context.svelte.js';
import type { EditorContent } from '../editor/index.js';

function mockDataHandler(result: Record<string, EditorContent>) {
	return {
		save: vi.fn().mockResolvedValue(result)
	};
}

describe('EditableContext', () => {
	describe('register() and unregister', () => {
		it('registers a handler and returns an unregister function', () => {
			const ctx = new EditableContext({
				get value() {
					return false;
				}
			});

			const handler = mockDataHandler({
				title: { type: 'text', content: { type: 'doc' } }
			});
			const unregister = ctx.register('blog', handler);

			expect(typeof unregister).toBe('function');
			unregister();
		});

		it('registers multiple handlers with different keys', async () => {
			const ctx = new EditableContext({
				get value() {
					return false;
				}
			});

			const h1 = mockDataHandler({ title: { type: 'text', content: { type: 'doc' } } });
			const h2 = mockDataHandler({ body: { type: 'text', content: { type: 'doc' } } });
			ctx.register('a', h1);
			ctx.register('b', h2);

			const resultA = await ctx.get('a');
			const resultB = await ctx.get('b');
			expect(resultA).toEqual({ title: { type: 'text', content: { type: 'doc' } } });
			expect(resultB).toEqual({ body: { type: 'text', content: { type: 'doc' } } });
		});

		it('unregister only removes the specific key', async () => {
			const ctx = new EditableContext({
				get value() {
					return false;
				}
			});

			const h1 = mockDataHandler({ a: { type: 'text', content: { type: 'doc' } } });
			const h2 = mockDataHandler({ b: { type: 'text', content: { type: 'doc' } } });

			const unregA = ctx.register('a', h1);
			ctx.register('b', h2);

			unregA();

			expect(await ctx.get('a')).toBeUndefined();
			expect(await ctx.get('b')).toEqual({ b: { type: 'text', content: { type: 'doc' } } });
		});
	});

	describe('get()', () => {
		it('returns undefined for unregistered key', async () => {
			const ctx = new EditableContext({
				get value() {
					return false;
				}
			});
			expect(await ctx.get('nonexistent')).toBeUndefined();
		});

		it('calls save() on the registered handler and returns result', async () => {
			const ctx = new EditableContext({
				get value() {
					return false;
				}
			});

			const content = { title: { type: 'text' as const, content: { type: 'doc' as const } } };
			const handler = mockDataHandler(content);
			ctx.register('key', handler);

			const result = await ctx.get('key');
			expect(handler.save).toHaveBeenCalledOnce();
			expect(result).toEqual(content);
		});

		it('handles async save() correctly', async () => {
			const ctx = new EditableContext({
				get value() {
					return false;
				}
			});

			const expected = { title: { type: 'text' as const, content: { type: 'doc' as const } } };
			const handler = {
				save: vi
					.fn()
					.mockImplementation(
						() => new Promise((resolve) => setTimeout(() => resolve(expected), 10))
					)
			};
			ctx.register('async-key', handler);

			const result = await ctx.get('async-key');
			expect(result).toEqual(expected);
		});
	});

	describe('save()', () => {
		it('returns empty Map when no handlers registered', async () => {
			const ctx = new EditableContext({
				get value() {
					return false;
				}
			});

			const result = await ctx.save();
			expect(result).toBeInstanceOf(Map);
			expect(result.size).toBe(0);
		});

		it('collects results from all registered handlers', async () => {
			const ctx = new EditableContext({
				get value() {
					return false;
				}
			});

			const h1 = mockDataHandler({ title: { type: 'text', content: { type: 'doc' } } });
			const h2 = mockDataHandler({ body: { type: 'text', content: { type: 'doc' } } });
			ctx.register('a', h1);
			ctx.register('b', h2);

			const result = await ctx.save();
			expect(result.size).toBe(2);
			expect(result.get('a')).toEqual({
				title: { type: 'text', content: { type: 'doc' } }
			});
			expect(result.get('b')).toEqual({ body: { type: 'text', content: { type: 'doc' } } });
		});

		it('calls save on each registered handler', async () => {
			const ctx = new EditableContext({
				get value() {
					return false;
				}
			});

			const h1 = mockDataHandler({ x: { type: 'text', content: { type: 'doc' } } });
			const h2 = mockDataHandler({ y: { type: 'text', content: { type: 'doc' } } });
			ctx.register('first', h1);
			ctx.register('second', h2);

			await ctx.save();
			expect(h1.save).toHaveBeenCalledOnce();
			expect(h2.save).toHaveBeenCalledOnce();
		});

		it('does not include unregistered handlers', async () => {
			const ctx = new EditableContext({
				get value() {
					return false;
				}
			});

			const h1 = mockDataHandler({ a: { type: 'text', content: { type: 'doc' } } });
			const h2 = mockDataHandler({ b: { type: 'text', content: { type: 'doc' } } });
			const unreg = ctx.register('a', h1);
			ctx.register('b', h2);

			unreg();

			const result = await ctx.save();
			expect(result.size).toBe(1);
			expect(result.has('a')).toBe(false);
			expect(result.has('b')).toBe(true);
		});
	});

	describe('editing getter', () => {
		it('returns true when accessor value is true', () => {
			const ctx = new EditableContext({
				get value() {
					return true;
				}
			});
			expect(ctx.editing).toBe(true);
		});

		it('returns false when accessor value is false', () => {
			const ctx = new EditableContext({
				get value() {
					return false;
				}
			});
			expect(ctx.editing).toBe(false);
		});

		it('reflects dynamic changes to the accessor', () => {
			let editing = false;
			const ctx = new EditableContext({
				get value() {
					return editing;
				}
			});

			expect(ctx.editing).toBe(false);
			editing = true;
			expect(ctx.editing).toBe(true);
		});
	});

	describe('state property', () => {
		it('starts as undefined', () => {
			const ctx = new EditableContext({
				get value() {
					return false;
				}
			});
			expect(ctx.state).toBeUndefined();
		});
	});

	describe('edge cases', () => {
		it('double-register same key overwrites the first handler', async () => {
			const ctx = new EditableContext({
				get value() {
					return false;
				}
			});

			const h1 = mockDataHandler({ old: { type: 'text', content: { type: 'doc' } } });
			const h2 = mockDataHandler({ new: { type: 'text', content: { type: 'doc' } } });

			ctx.register('key', h1);
			ctx.register('key', h2);

			const result = await ctx.get('key');
			expect(result).toEqual({ new: { type: 'text', content: { type: 'doc' } } });
			expect(h1.save).not.toHaveBeenCalled();
			expect(h2.save).toHaveBeenCalledOnce();
		});

		it('get() propagates rejection from handler save()', async () => {
			const ctx = new EditableContext({
				get value() {
					return false;
				}
			});

			const handler = {
				save: vi.fn().mockRejectedValue(new Error('save failed'))
			};
			ctx.register('bad', handler);

			await expect(ctx.get('bad')).rejects.toThrow('save failed');
		});

		it('save() throws and sets error status when a handler rejects', async () => {
			const ctx = new EditableContext({
				get value() {
					return false;
				}
			});

			const good = mockDataHandler({ a: { type: 'text', content: { type: 'doc' } } });
			const bad = { save: vi.fn().mockRejectedValue(new Error('boom')) };

			ctx.register('good', good);
			ctx.register('bad', bad);

			await expect(ctx.save()).rejects.toThrow('Save failed');
		});
	});
});
