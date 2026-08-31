import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce } from './debounce.js';

describe('debounce', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	const opts = { timing: 'both' as const, waitMs: 200, maxWaitMs: 500 };

	it('calls function immediately on leading edge', () => {
		const fn = vi.fn().mockReturnValue('result');
		const d = debounce(fn, opts);

		const result = d.call();
		expect(fn).toHaveBeenCalledTimes(1);
		expect(result).toBe('result');
	});

	it('does not invoke trailing when no further calls arrive during cooldown', () => {
		const fn = vi.fn();
		const d = debounce(fn, opts);

		d.call();
		expect(fn).toHaveBeenCalledTimes(1);

		vi.advanceTimersByTime(opts.waitMs);
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it('invokes trailing edge when calls arrive during cooldown', () => {
		const fn = vi.fn();
		const d = debounce(fn, opts);

		d.call(); // leading
		expect(fn).toHaveBeenCalledTimes(1);

		d.call(); // during cooldown — saved for trailing
		expect(fn).toHaveBeenCalledTimes(1);

		vi.advanceTimersByTime(opts.waitMs);
		expect(fn).toHaveBeenCalledTimes(2);
	});

	it('resets cooldown timer on subsequent calls', () => {
		const fn = vi.fn();
		const d = debounce(fn, opts);

		d.call(); // leading at t=0
		vi.advanceTimersByTime(100); // t=100

		d.call(); // resets cooldown, trailing scheduled
		vi.advanceTimersByTime(100); // t=200 — original cooldown would fire, but it was reset
		expect(fn).toHaveBeenCalledTimes(1); // still only leading

		vi.advanceTimersByTime(100); // t=300 — reset cooldown fires (200ms from second call)
		expect(fn).toHaveBeenCalledTimes(2);
	});

	it('forces invocation at maxWaitMs even with continuous calls', () => {
		const fn = vi.fn();
		const d = debounce(fn, opts);

		d.call(); // leading at t=0
		expect(fn).toHaveBeenCalledTimes(1);

		// Keep calling every 100ms so cooldown (200ms) never expires.
		// The maxWait timer is set on the SECOND call (t=100) with maxWaitMs=500,
		// so it fires at t=600.
		for (let t = 100; t <= 500; t += 100) {
			vi.advanceTimersByTime(100);
			d.call();
		}
		// Only leading call so far (at t=500, maxWait not yet fired)
		expect(fn).toHaveBeenCalledTimes(1);

		// Advance past maxWait (t=600) — should force invoke
		vi.advanceTimersByTime(100);
		expect(fn).toHaveBeenCalledTimes(2);
	});

	it('cancel() prevents pending trailing invocation', () => {
		const fn = vi.fn();
		const d = debounce(fn, opts);

		d.call(); // leading
		d.call(); // during cooldown

		d.cancel();
		vi.advanceTimersByTime(opts.waitMs + opts.maxWaitMs);

		expect(fn).toHaveBeenCalledTimes(1); // only leading
	});

	it('cancel() allows fresh leading edge on next call', () => {
		const fn = vi.fn();
		const d = debounce(fn, opts);

		d.call(); // leading #1
		d.cancel();

		d.call(); // should be fresh leading #2
		expect(fn).toHaveBeenCalledTimes(2);
	});

	it('passes correct arguments to leading invocation', () => {
		const fn = vi.fn();
		const d = debounce(fn, opts);

		d.call('a', 'b');
		expect(fn).toHaveBeenCalledWith('a', 'b');
	});

	it('passes latest arguments to trailing invocation', () => {
		const fn = vi.fn();
		const d = debounce(fn, opts);

		d.call('a'); // leading with 'a'
		d.call('b'); // saved
		d.call('c'); // overwrites saved

		vi.advanceTimersByTime(opts.waitMs);
		expect(fn).toHaveBeenCalledTimes(2);
		expect(fn).toHaveBeenLastCalledWith('c');
	});

	it('returns latest result from call()', () => {
		let counter = 0;
		const fn = vi.fn(() => ++counter);
		const d = debounce(fn, opts);

		const r1 = d.call(); // leading invocation, counter=1
		expect(r1).toBe(1);

		const r2 = d.call(); // during cooldown, no invocation yet — returns last result
		expect(r2).toBe(1);

		vi.advanceTimersByTime(opts.waitMs); // trailing fires, counter=2

		const r3 = d.call(); // fresh leading, counter=3
		expect(r3).toBe(3);
	});

	it('works with zero waitMs (leading fires, trailing fires immediately)', () => {
		const fn = vi.fn();
		const d = debounce(fn, { timing: 'both', waitMs: 0, maxWaitMs: 100 });

		d.call('a'); // leading
		expect(fn).toHaveBeenCalledTimes(1);

		d.call('b'); // during cooldown
		vi.advanceTimersByTime(0); // flush zero-timeout
		expect(fn).toHaveBeenCalledTimes(2);
		expect(fn).toHaveBeenLastCalledWith('b');
	});

	it('cancel() when no pending call is a no-op', () => {
		const fn = vi.fn();
		const d = debounce(fn, { timing: 'both', waitMs: 200, maxWaitMs: 500 });

		expect(() => d.cancel()).not.toThrow();
		expect(fn).not.toHaveBeenCalled();
	});

	it('multiple rapid cancel() calls do not throw', () => {
		const fn = vi.fn();
		const d = debounce(fn, { timing: 'both', waitMs: 200, maxWaitMs: 500 });

		d.call();
		d.call();

		expect(() => {
			d.cancel();
			d.cancel();
			d.cancel();
		}).not.toThrow();

		vi.advanceTimersByTime(1000);
		expect(fn).toHaveBeenCalledTimes(1); // only leading
	});
});
