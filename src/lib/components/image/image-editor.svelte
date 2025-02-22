<script lang="ts">
	import Cropper from './cropper.svelte';

	type FocusUtils = {
		replaceImage: () => void;
	};

	let {
		src,
		maxWidth,
		maxHeight,
		aspect,
		quality,
		onchange,
		onfocus
	}: {
		src: string;
		aspect: number;
		maxWidth?: number;
		maxHeight?: number;
		quality?: number;
		onchange?: (data: { crop: Point; zoom: number }) => void;
		onfocus?: (e: FocusUtils) => void;
	} = $props();
	import type { Point } from './types.js';

	let editing = $state(false);
	let el: HTMLElement;
	let cropper: ReturnType<typeof Cropper> | undefined = $state();
	let touched = $state(false);

	function insertFile(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		const file = event.currentTarget.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = () => {
			src = reader.result as string;
		};
		reader.readAsDataURL(file);
		el.focus();
	}

	function onFocus() {
		editing = true;
		onfocus?.({
			replaceImage
		});
	}

	async function outFocus() {
		editing = false;
	}

	function replaceImage() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'image/*';
		input.onchange = (e) => {
			insertFile({ ...e, currentTarget: input });
			input.remove();
		};
		input.click();
	}

	export async function getContent() {
		if (!touched || !cropper)
			return {
				type: 'image' as const,
				content: null
			};
		return {
			type: 'image' as const,
			content: await cropper.blob()
		};
	}
</script>

<button
	bind:this={el}
	class="w-full h-full [&.editing]:ring-1 hover:ring-1 ring-[#39f] group relative"
	class:editing
	onfocusin={onFocus}
	onmousedown={(e) => e.currentTarget.focus()}
	onfocusout={outFocus}
>
	{#if src}
		<Cropper
			bind:this={cropper}
			bind:touched
			{src}
			{aspect}
			preview={!editing}
			{maxHeight}
			{maxWidth}
			{quality}
			{onchange}
		/>
	{:else}
		<label class="grid place-content-center w-full h-full bg-gray cursor-pointer">
			<input class="sr-only" type="file" accept="image/*" onchange={insertFile} />
			<p>Image</p>
		</label>
	{/if}
</button>
