import { autoUpdate, computePosition, type ComputePositionConfig } from '@floating-ui/dom';
import type { Attachment } from 'svelte/attachments';

export type Reference = Attachment<HTMLElement>;
export type Floating = Attachment<HTMLElement>;

export type FloatingParams = Partial<ComputePositionConfig> &
	Partial<{
		/**
		 * Callback function to be called when a click event occurs outside the reference and floating elements.
		 */
		outsideClick: (event: MouseEvent) => void;
	}>;

export const floating = (config: FloatingParams): [Reference, Floating] => {
	let reference: HTMLElement | undefined = $state();
	let floating: HTMLElement | undefined = $state();

	const update = () => {
		if (!reference || !floating) return;

		computePosition(reference, floating, config).then(({ x, y }) =>
			Object.assign(floating!.style, { top: `${y}px`, left: `${x}px` })
		);
	};

	const referenceAttachment: Reference = (node) => {
		reference = node;

		const handleOutsideClick = (event: MouseEvent) => {
			if (!reference?.contains(event.target as Node) && !floating?.contains(event.target as Node)) {
				config.outsideClick?.(event);
			}
		};

		if (config.outsideClick) {
			document.addEventListener('click', handleOutsideClick);
		}

		return () => {
			reference = undefined;
			document.removeEventListener('click', handleOutsideClick);
		};
	};

	const floatingAttachment: Floating = (node) => {
		floating = node;

		return () => {
			floating = undefined;
		};
	};

	$effect(() => {
		if (!reference || !floating) return;

		const cleanup = autoUpdate(reference, floating, update);

		return () => {
			cleanup();
		};
	});

	return [referenceAttachment, floatingAttachment];
};
