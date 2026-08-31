<script lang="ts">
	import { floating } from '@routes/actions/floating.svelte.js';
	import type { ComputePositionConfig } from '@floating-ui/dom';
	import type { Snippet } from 'svelte';
	import type { Attachment } from 'svelte/attachments';

	type Fn = () => void;
	type Action = (fn?: Fn) => (...args: any[]) => void;

	type Actions = {
		open: Action;
		close: Action;
		toggle: Action;
	};

	type Props = {
		config?: Partial<ComputePositionConfig>;
		trigger: Snippet<[Attachment<HTMLElement>, Actions]>;
		menu: Snippet<[Attachment<HTMLElement>, Actions]>;
	};

	let { trigger, menu, config = {} }: Props = $props();

	let _open = $state(false);

	const actions = { open, close, toggle };

	const [reference, popover] = $derived(
		floating({
			...config,
			outsideClick: close()
		})
	);

	function open(fn?: Fn) {
		return function () {
			_open = true;
			fn?.();
		};
	}

	function close(fn?: Fn) {
		return function () {
			_open = false;
			fn?.();
		};
	}

	function toggle(fn?: Fn) {
		return function () {
			_open = !_open;
			fn?.();
		};
	}
</script>

{@render trigger(reference, actions)}
{#if _open}
	{@render menu(popover, actions)}
{/if}
