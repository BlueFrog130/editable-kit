/* eslint-disable @typescript-eslint/no-explicit-any */

type Debouncer<F extends (...args: any) => any> = {
	readonly call: (...args: Parameters<F>) => ReturnType<F> | undefined;
	readonly cancel: () => void;
};

type DebounceOptions = {
	readonly timing: 'both';
	readonly waitMs: number;
	readonly maxWaitMs: number;
};

/**
 * Minimal leading+trailing debounce with maxWait support.
 * Only supports `timing: 'both'`.
 */
export function debounce<F extends (...args: any) => any>(
	func: F,
	{ waitMs, maxWaitMs }: DebounceOptions
): Debouncer<F> {
	let coolDownId: ReturnType<typeof setTimeout> | undefined;
	let maxWaitId: ReturnType<typeof setTimeout> | undefined;
	let latestArgs: Parameters<F> | undefined;
	let result: ReturnType<F> | undefined;

	const invoke = () => {
		if (maxWaitId !== undefined) {
			clearTimeout(maxWaitId);
			maxWaitId = undefined;
		}
		if (latestArgs === undefined) return;
		const args = latestArgs;
		latestArgs = undefined;
		result = func(...args);
	};

	const coolDownEnd = () => {
		coolDownId = undefined;
		if (latestArgs !== undefined) invoke();
	};

	return {
		call(...args) {
			if (coolDownId === undefined) {
				// Leading edge — invoke immediately
				result = func(...args);
			} else {
				// During cool-down — save args for trailing invocation
				latestArgs = args;
				if (maxWaitId === undefined) {
					maxWaitId = setTimeout(invoke, maxWaitMs);
				}
				clearTimeout(coolDownId);
			}
			coolDownId = setTimeout(coolDownEnd, waitMs);
			return result;
		},

		cancel() {
			if (coolDownId !== undefined) {
				clearTimeout(coolDownId);
				coolDownId = undefined;
			}
			if (maxWaitId !== undefined) {
				clearTimeout(maxWaitId);
				maxWaitId = undefined;
			}
			latestArgs = undefined;
		}
	};
}
