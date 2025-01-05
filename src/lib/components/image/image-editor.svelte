<script lang="ts">
	import Cropper from './cropper.svelte';

	let {
		src,
		maxWidth,
		maxHeight,
		aspect,
		quality,
		onchange
	}: {
		src: string;
		aspect: number;
		maxWidth?: number;
		maxHeight?: number;
		quality?: number;
		onchange?: (data: { crop: Point; zoom: number }) => void;
	} = $props();
	import { editor } from '$lib/state/editor.svelte.js';
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
		editor.active = {
			type: 'image',
			editor: {
				replaceImage,
				test
			}
		};
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

	async function test() {
		const blob = await cropper?.blob();

		if (!blob) {
			throw new Error('No image to download');
		}

		// Download the blob
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'image.webp';
		a.click();
		URL.revokeObjectURL(url);
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
