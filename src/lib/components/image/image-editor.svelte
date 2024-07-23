<script lang="ts">
	import { tool } from '$lib/editor/toolbars.js';
	import { editor } from '$lib/state/index.svelte.js';
	import CropButton from './crop-button.svelte';
	import ReplaceButton from './replace-button.svelte';
	import Cropper from './cropper.svelte';
	import { customAlphabet } from 'nanoid';
	import Test from './test.svelte';

	let {
		src = $bindable(),
		maxWidth,
		maxHeight,
		aspect,
		quality
	}: {
		src: string;
		aspect: number;
		maxWidth?: number;
		maxHeight?: number;
		quality?: number;
	} = $props();

	let editing = $state(false);
	let el: HTMLElement;
	let cropper: Cropper | undefined = $state();

	const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	const nanoid = customAlphabet(alphabet, 10);
	let id = nanoid();

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
		editor.tools = [
			tool(CropButton, { onclick: () => {} }),
			tool(ReplaceButton, { onclick: replaceImage }),
			tool(Test, { onclick: test })
		];
	}

	async function outFocus() {
		editing = false;
		console.log(cropper?.getCropData());
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
	{id}
	class="w-full h-full [&.editing]:ring-1 hover:ring-1 ring-[#39f] group relative"
	class:editing
	onfocusin={onFocus}
	onmousedown={(e) => e.currentTarget.focus()}
	onfocusout={outFocus}
>
	{#if src}
		<Cropper
			bind:this={cropper}
			{src}
			{aspect}
			preview={!editing}
			{maxHeight}
			{maxWidth}
			{quality}
		/>
	{:else}
		<label class="grid place-content-center w-full h-full bg-gray cursor-pointer">
			<input class="sr-only" type="file" accept="image/*" onchange={insertFile} />
			<p>Image</p>
		</label>
	{/if}
</button>
