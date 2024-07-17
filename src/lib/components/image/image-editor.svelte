<script lang="ts">
	import { tool } from '$lib/editor/toolbars.js';
	import { editor } from '$lib/state/index.svelte.js';
	import type { Action } from 'svelte/action';
	import CropButton from './crop-button.svelte';
	import ReplaceButton from './replace-button.svelte';
	import Cropper from './cropper.svelte';
	import type CropperType from 'cropperjs';
	import { customAlphabet } from 'nanoid';
	import { untrack } from 'svelte';

	let {
		src = $bindable(),
		previewSrc = $bindable()
	}: { src: string; previewSrc: string | undefined } = $props();

	let editing = $state(false);
	let cropData: CropperType.Data | undefined = $state();
	let cropper: CropperType | undefined = $state();
	let el: HTMLButtonElement;

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
			tool(ReplaceButton, { onclick: replaceImage })
		];
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

	$effect(() => {
		// TODO: Remove this stuff - probably don't need to emit preview src back up to parent
		return () => {
			const c = untrack(() => cropper);
			console.log('unmounting and setting previewSrc', c);
			if (!c) return;
			const canvas = c.getCroppedCanvas();
			console.log('canvas', canvas);
			previewSrc = canvas.toDataURL();
		};
	});
</script>

<button
	bind:this={el}
	{id}
	class="w-full h-full [&.editing]:ring-1 hover:ring-1 ring-[#39f] group relative"
	class:editing
	onfocusin={onFocus}
	onclick={onFocus}
	onfocusout={outFocus}
>
	{#if src}
		<div class="invisible group-[.editing]:visible w-full h-full">
			<Cropper bind:cropper {id} {src} bind:data={cropData} aspectRatio={1 / 1} />
		</div>
		<div
			class="absolute top-0 left-0 preview visible group-[.editing]:invisible overflow-hidden w-full h-full object-cover"
		></div>
	{:else}
		<label class="grid place-content-center w-full h-full bg-gray cursor-pointer">
			<input class="sr-only" type="file" accept="image/*" onchange={insertFile} />
			<p>Image</p>
		</label>
	{/if}
</button>
