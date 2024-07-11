<script lang="ts">
	import type { ImageProps } from './index.js';
	import { isSafari, nanoid } from '$lib/util.js';
	import { getCroppedImg } from '$lib/image/crop.js';
	import type { CropArea } from '$lib/image/types.js';
	import { resizeImage } from '$lib/image/resize.js';
	import { getDimensions } from '$lib/image/index.js';
	import Cropper from './cropper.svelte';

	let {
		src = $bindable(),
		previewSrc = $bindable(),
		alt,
		quality,
		maxHeight,
		maxWidth,
		uploadPrompt
	}: ImageProps & { previewSrc: string } = $props();

	let fileInput: HTMLInputElement;
	let progress: number | undefined = undefined;
	let overlayEl: HTMLElement;

	let newSrc: string | undefined = $state(undefined);
	let cropDetail: CropArea | undefined = undefined;
	let isCropping = $state(false);
	let scale = $state(1);
	let crop = $state({
		x: 0,
		y: 0
	});
	let zoom = $state(1);

	let safari = isSafari();

	function onKeyDown(e: KeyboardEvent) {
		if (isCropping && e.key === 'Escape') {
			cancelCropping();
		} else if (isCropping && e.key === 'Enter') {
			uploadImage();
		}
	}

	function cancelCropping() {
		isCropping = false;
		newSrc = undefined;
		if (fileInput) fileInput.value = '';
		scale = 1;
	}

	async function uploadImage() {
		if (!newSrc || !cropDetail) return;
		const file = fileInput.files?.[0];
		const contentType = isSafari() ? 'image/jpeg' : 'image/webp';

		const extension = contentType === 'image/jpeg' ? 'jpg' : 'webp';

		const path = `images/${nanoid()}.${extension}`;
		const croppedImage = await getCroppedImg(newSrc, cropDetail);

		if (!croppedImage) return;

		const resizedBlob = await resizeImage(croppedImage, maxWidth, maxHeight, quality, contentType);
		const resizedFile = new File([resizedBlob], `${file?.name.split('.')[0]}`, {
			type: contentType
		});

		progress = 0;
		try {
			// TODO: implement current user
			src = URL.createObjectURL(resizedFile);
			progress = undefined;
		} catch (e) {
			console.error(e);
			progress = undefined;
		}
		cancelCropping();
		fileInput.value = '';
	}

	async function startCropping() {
		const file = fileInput.files?.[0];
		if (!file) return;
		const { width, height } = await getDimensions(file);
		const currentAspectRatio = width / height;
		const desiredAspectRatio = maxWidth / maxHeight;

		if (desiredAspectRatio > currentAspectRatio) {
			scale = desiredAspectRatio / currentAspectRatio;
		} else {
			scale = currentAspectRatio / desiredAspectRatio;
		}

		newSrc = URL.createObjectURL(file);
		isCropping = true;
	}
</script>

<div
	bind:this={overlayEl}
	role="none"
	class={isCropping
		? 'z-40 bg-black text-white font-bold fixed inset-0 bg-opacity-80 text-center p-6'
		: 'hidden'}
	ondblclick={cancelCropping}
>
	{#if safari}
		<span class="text-[#EF174C]">ATTENTION:</span> Use Google Chrome, Firefox, oder Microsoft Edge for
		optimized image quality and size.
	{:else}
		Confirm with ENTER. Cancel with ESC.
	{/if}
</div>

{#if isCropping}
	<div class="flex space-x-4 z-[60] fixed bottom-0 right-0 left-0 p-6">
		<div class="flex-1"></div>
		<button class="bg-[#EF174C] text-white rounded-full px-4 py-2" onclick={uploadImage}
			>Confirm</button
		>
		<button class="bg-white text-black rounded-full px-4 py-2" onclick={cancelCropping}
			>Cancel</button
		>
		<div class="flex-1"></div>
	</div>
{/if}

<div
	role="img"
	style={`aspect-ratio: ${maxWidth}/${maxHeight}; scale: ${scale}`}
	class={isCropping ? `relative z-50` : 'relative'}
	ondblclick={uploadImage}
>
	{#if isCropping}
		<Cropper
			image={newSrc}
			bind:crop
			bind:zoom
			oncropcomplete={(d) => (cropDetail = d.pixels)}
			aspect={maxWidth / maxHeight}
		/>
	{:else}
		<button onclick={() => fileInput.click()}>
			<img
				class={'cursor-pointer outline-[2px] hover:outline-dashed outline-[#EF174C] -outline-offset-[2px]'}
				{src}
				{alt}
				title={uploadPrompt}
			/>
		</button>
	{/if}
</div>

<input
	class="w-px h-px opacity-0 fixed -top-40"
	type="file"
	accept="image/*"
	name="imagefile"
	bind:this={fileInput}
	onchange={startCropping}
/>

<svelte:window on:keydown={onKeyDown} />
