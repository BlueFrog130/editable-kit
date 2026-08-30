import { describe, it, expect, vi, afterEach } from 'vitest';
import { flushSync } from 'svelte';
import { EditableContext } from './editable-context.svelte.js';

/** The context reads `Root`'s props through getters and uses `$effect.pre`. */
function makeContext(editing = true) {
	const box = { value: editing, restore: vi.fn() };
	let ctx!: EditableContext;
	const destroy = $effect.root(() => {
		ctx = new EditableContext({
			get editing() {
				return box.value;
			},
			restore: box.restore
		});
	});
	flushSync();
	return { ctx, box, destroy };
}

const cleanups: Array<() => void> = [];
afterEach(() => {
	for (const fn of cleanups.splice(0)) fn();
	vi.useRealTimers();
});

function context(editing = true) {
	const { ctx, box, destroy } = makeContext(editing);
	cleanups.push(() => {
		ctx.destroy();
		destroy();
	});
	return { ctx, box };
}

describe('EditableContext', () => {
	describe('save', () => {
		it('runs the persist callback and reports status', async () => {
			vi.useFakeTimers();
			const { ctx } = context();
			const persist = vi.fn().mockResolvedValue(undefined);

			const pending = ctx.save(persist);
			expect(ctx.saveStatus).toBe('saving');

			await pending;
			expect(persist).toHaveBeenCalledOnce();
			expect(ctx.saveStatus).toBe('saved');

			vi.advanceTimersByTime(2000);
			expect(ctx.saveStatus).toBe('idle');
		});

		it('flushes the focused field before persisting', async () => {
			const { ctx } = context();
			const order: string[] = [];
			ctx.flush = () => order.push('flush');

			await ctx.save(() => {
				order.push('persist');
			});

			// The focused field's content must land in the data before it is read
			expect(order).toEqual(['flush', 'persist']);
		});

		it('surfaces a failure with the original error as cause', async () => {
			const { ctx } = context();
			const boom = new Error('network down');

			await expect(
				ctx.save(() => {
					throw boom;
				})
			).rejects.toThrow('save failed');
			expect(ctx.saveStatus).toBe('error');
		});

		it('leaves dirty set when the save fails', async () => {
			const { ctx } = context();
			ctx.dirty = true;

			await expect(ctx.save(() => Promise.reject(new Error('nope')))).rejects.toThrow(
				'save failed'
			);
			expect(ctx.dirty).toBe(true);
		});

		it('clears dirty on success', async () => {
			const { ctx } = context();
			ctx.dirty = true;

			await ctx.save(async () => {});
			expect(ctx.dirty).toBe(false);
		});
	});

	describe('reset', () => {
		it("restores Root's data and clears dirty", () => {
			const { ctx, box } = context();
			ctx.dirty = true;

			ctx.reset();

			expect(box.restore).toHaveBeenCalledOnce();
			expect(ctx.dirty).toBe(false);
		});

		it('drops the pending flush so it cannot re-apply discarded edits', () => {
			const { ctx } = context();
			const flush = vi.fn();
			ctx.flush = flush;

			ctx.reset();

			expect(ctx.flush).toBeUndefined();
			expect(flush).not.toHaveBeenCalled();
		});
	});

	describe('editing', () => {
		it('creates toolbar state when editing turns on', () => {
			const { ctx } = context(true);
			expect(ctx.state).toBeDefined();
		});

		it('has no toolbar state while not editing', () => {
			const { ctx } = context(false);
			expect(ctx.state).toBeUndefined();
		});
	});
});
