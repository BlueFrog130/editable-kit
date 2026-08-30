import { describe, it, expect, vi, afterEach } from 'vitest';
import { flushSync } from 'svelte';
import { EditableContext } from './editable-context.svelte.js';

/** The context reads `Root`'s props through getters and uses `$effect.pre`. */
function makeContext(editing = true) {
	// $state, so flipping `value` actually re-runs the context's $effect.pre
	const box = $state({ value: editing, restore: vi.fn() });
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

describe('EditableContext lifecycle', () => {
	it('tears the toolbar state down when editing turns off, and keeps it across a re-entry', () => {
		const { ctx, box } = context(true);
		const first = ctx.state;
		ctx.state!.editor = { isActive: () => false, on: () => {}, off: () => {} } as never;
		ctx.flush = vi.fn();

		box.value = false;
		flushSync();

		// The instance survives — its editor and pending flush do not.
		expect(ctx.state).toBe(first);
		expect(ctx.state!.editor).toBeUndefined();
		expect(ctx.flush).toBeUndefined();
	});

	it('creates the toolbar state on the first switch into editing', () => {
		const { ctx, box } = context(false);
		expect(ctx.state).toBeUndefined();

		box.value = true;
		flushSync();
		expect(ctx.state).toBeDefined();
	});

	it('exposes Root props live through getters', () => {
		const box = $state({ value: true, restore: vi.fn() });
		const overrides = { nodes: {} };
		const options = { placeholder: 'hi' };
		let ctx!: EditableContext;
		const stop = $effect.root(() => {
			ctx = new EditableContext({
				get editing() {
					return box.value;
				},
				overrides,
				options,
				restore: box.restore
			});
		});
		flushSync();

		expect([ctx.editing, ctx.overrides, ctx.editorOptions]).toEqual([true, overrides, options]);

		box.value = false;
		expect(ctx.editing).toBe(false);

		ctx.destroy();
		stop();
	});

	it('drops a pending status reset on destroy, so nothing writes after teardown', async () => {
		vi.useFakeTimers();
		const { ctx } = context();

		await ctx.save(async () => {});
		expect(ctx.saveStatus).toBe('saved');

		ctx.destroy();
		vi.advanceTimersByTime(5000);
		expect(ctx.saveStatus).toBe('saved'); // the timer was cleared, not fired
	});

	it('lets a second save supersede the first save status timer', async () => {
		vi.useFakeTimers();
		const { ctx } = context();

		await ctx.save(async () => {});
		vi.advanceTimersByTime(1500); // first 'saved' timer is 500ms from firing

		await ctx.save(async () => {});
		vi.advanceTimersByTime(1500);
		// The first timer must not drag the status to idle mid-way through the second.
		expect(ctx.saveStatus).toBe('saved');

		vi.advanceTimersByTime(500);
		expect(ctx.saveStatus).toBe('idle');
	});

	it('clears the error status after its own window', async () => {
		vi.useFakeTimers();
		const { ctx } = context();

		await expect(ctx.save(() => Promise.reject(new Error('x')))).rejects.toThrow('save failed');
		expect(ctx.saveStatus).toBe('error');

		vi.advanceTimersByTime(2000);
		expect(ctx.saveStatus).toBe('error'); // longer window than 'saved'
		vi.advanceTimersByTime(1000);
		expect(ctx.saveStatus).toBe('idle');
	});

	it('saves with no persist callback at all', async () => {
		const { ctx } = context();
		await expect(ctx.save()).resolves.toBeUndefined();
		expect(ctx.saveStatus).toBe('saved');
	});

	it('blurs the mounted editor before restoring, so it accepts the old content', () => {
		const { ctx } = context();
		const blur = vi.fn();
		ctx.state!.editor = {
			isDestroyed: false,
			view: { dom: { blur } },
			isActive: () => false,
			on: () => {},
			off: () => {}
		} as never;

		ctx.reset();
		expect(blur).toHaveBeenCalledOnce();
	});

	it('does not touch a destroyed editor on reset', () => {
		const { ctx, box } = context();
		const blur = vi.fn();
		ctx.state!.editor = {
			isDestroyed: true,
			view: { dom: { blur } },
			isActive: () => false,
			on: () => {},
			off: () => {}
		} as never;

		ctx.reset();
		expect(blur).not.toHaveBeenCalled();
		expect(box.restore).toHaveBeenCalledOnce();
	});
});
