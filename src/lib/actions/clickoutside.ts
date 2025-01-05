import type { Action } from 'svelte/action';

export type ClickOutsideParams = (node: HTMLElement) => void;

export const onclickoutside: Action<HTMLElement, ClickOutsideParams> = (el, params) => {
	const handleClick = (event: MouseEvent) => {
		if (!el.contains(event.target as Node)) {
			params(el);
		}
	};

	document.addEventListener('click', handleClick);

	return {
		destroy() {
			document.removeEventListener('click', handleClick);
		}
	};
};
