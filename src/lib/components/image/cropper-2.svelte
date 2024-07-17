<script lang="ts">
	import type { CropShape, Point, Size } from './types.js';

	let {
		src,
		crop = $bindable({ x: 0, y: 0 }),
		zoom = $bindable(1),
		aspect = 4 / 3,
		cropShape = 'rect'
	}: { src: string; crop: Point; aspect: number; zoom: number; cropShape: CropShape } = $props();

	// State (could be props)
	const minZoom = 1;
	const maxZoom = 3;
	const showGrid = true;
	const zoomSpeed = 1;
	const restrictPosition = true;

	// Reactive state
	let cropperSize: Size | null = $state(null);

	// Elements
	let containerEl: HTMLElement;
	let imageEl: HTMLImageElement;
	let domRect: DOMRect;

	function computeSizes() {}

	function containerMouseDown(e: Event) {
		e.preventDefault();
	}

	function containerTouchStart(e: Event) {
		e.preventDefault();
	}

	function containerWheel(e: Event) {
		e.preventDefault();
	}

	function container(el: HTMLElement) {
		el.addEventListener('onmousedown', containerMouseDown);
		el.addEventListener('ontouchstart', containerTouchStart, { passive: false });
		el.addEventListener('onwheel', containerWheel, { passive: false });

		return {
			destroy() {
				el.removeEventListener('onmousedown', containerMouseDown);
				el.removeEventListener('ontouchstart', containerTouchStart);
				el.removeEventListener('onwheel', containerWheel);
			}
		};
	}
</script>

<svelte:window onresize={computeSizes} />

<div
	class="absolute inset-0 overflow-hidden select-none touch-none cursor-move"
	bind:this={containerEl}
	use:container
	role="button"
	data-testid="container"
>
	<img
		class="max-w-full max-h-full m-auto absolute inset-0 will-change-transform"
		{src}
		alt=""
		bind:this={imageEl}
		style:translate="{crop.x}px, {crop.y}px"
		style:scale={zoom}
	/>
	{#if cropperSize}
		<div class="" class:crop-round={cropShape}></div>
	{/if}
</div>
