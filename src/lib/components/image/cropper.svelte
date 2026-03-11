<script lang="ts">
	import { untrack } from 'svelte';
	import type { CropShape, ImageSize, Point, Size } from './types.js';
	import {
		computeCroppedArea,
		getCenter,
		getDistanceBetweenPoints,
		restrictPosition as restrict
	} from './util.js';

	let {
		src,
		crop = $bindable({ x: 0, y: 0 }),
		zoom = $bindable(1),
		touched = $bindable(false),
		aspect,
		cropShape = 'rect',
		preview = false,
		maxWidth,
		maxHeight,
		quality,
		onchange
	}: {
		src: string;
		crop?: Point;
		aspect?: number;
		zoom?: number;
		touched?: boolean;
		cropShape?: CropShape;
		preview?: boolean;
		maxWidth?: number;
		maxHeight?: number;
		quality?: number;
		onchange?: (data: { crop: Point; zoom: number }) => void;
	} = $props();

	// State (could be props)
	const minZoom = 1;
	const maxZoom = 3;
	const zoomSpeed = 1;
	const restrictPosition = true;
	// const restrictPosition = false;

	// ------------------------------
	// Reactive state
	// ------------------------------

	let imageSize: ImageSize & { left: number; top: number } = $state.raw({
		width: 0,
		height: 0,
		naturalWidth: 0,
		naturalHeight: 0,
		left: 0,
		top: 0
	});
	let containerRect: DOMRect | null = $state.raw(null);
	let dragStartPosition = { x: 0, y: 0 };
	let dragStartCrop = { x: 0, y: 0 };
	let lastPinchDistance = 0;
	let rafDragTimeout: number | null = null;
	let rafZoomTimeout: number | null = null;

	// ------------------------------
	// Derived state
	// ------------------------------

	// When no aspect is provided, use the container's natural aspect ratio
	const effectiveAspect = $derived.by(() => {
		if (aspect) return aspect;
		if (containerRect) return containerRect.width / containerRect.height;
		return 1;
	});

	const cropperSize = $derived.by<Size | null>(() => {
		if (!containerRect) return null;
		const cw = containerRect.width;
		const ch = containerRect.height;
		if (cw / ch > effectiveAspect) {
			return { width: ch * effectiveAspect, height: ch };
		} else {
			return { width: cw, height: cw / effectiveAspect };
		}
	});

	// ------------------------------
	// Elements
	// ------------------------------

	let containerEl: HTMLElement;
	let imageEl: HTMLImageElement;

	// ------------------------------
	// Functions
	// ------------------------------

	function computeSizes() {
		if (containerEl) {
			containerRect = containerEl.getBoundingClientRect();
		}
		if (imageEl && containerRect) {
			const naturalAspect = imageEl.naturalWidth / imageEl.naturalHeight;
			const containerAspect = containerRect.width / containerRect.height;

			// Size the image to cover the container (matches object-fit: cover behavior)
			const scaledImageSize = { width: 0, height: 0 };
			if (naturalAspect > containerAspect) {
				scaledImageSize.height = containerRect.height;
				scaledImageSize.width = containerRect.height * naturalAspect;
			} else {
				scaledImageSize.width = containerRect.width;
				scaledImageSize.height = containerRect.width / naturalAspect;
			}

			imageSize = {
				...scaledImageSize,
				// CSS margin:auto centers vertically for oversized absolutely positioned
				// elements, but NOT horizontally (in LTR, margin-left is forced to 0).
				// So we only need an explicit left offset for horizontal centering.
				left: (containerRect.width - scaledImageSize.width) / 2,
				top: 0,
				naturalWidth: imageEl.naturalWidth,
				naturalHeight: imageEl.naturalHeight
			};
		}
	}

	function getMousePoint(e: MouseEvent): Point {
		return {
			x: e.clientX,
			y: e.clientY
		};
	}

	function getTouchPoint(touch: TouchEvent['touches'][0]): Point {
		return {
			x: touch.clientX,
			y: touch.clientY
		};
	}

	function setNewZoom(newZoom: number, point: Point) {
		if (!cropperSize) return;
		const zoomPoint = getPointOnContainer(point);
		const zoomTarget = getPointOnImage(zoomPoint);
		zoom = Math.min(maxZoom, Math.max(minZoom, newZoom));

		const requestedPosition = {
			x: zoomTarget.x * zoom - zoomPoint.x,
			y: zoomTarget.y * zoom - zoomPoint.y
		};

		crop = restrictPosition
			? restrict(requestedPosition, imageSize, cropperSize, zoom)
			: requestedPosition;

		onchange?.({ crop, zoom });
	}

	function getPointOnContainer({ x, y }: Point): Point {
		if (!containerRect) {
			throw new Error('Container rect is not defined');
		}
		return {
			x: containerRect.width / 2 - (x - containerRect.left),
			y: containerRect.height / 2 - (y - containerRect.top)
		};
	}

	function getPointOnImage({ x, y }: Point): Point {
		return {
			x: (x + crop.x) / zoom,
			y: (y + crop.y) / zoom
		};
	}

	// ------------------------------
	// Event handlers
	// ------------------------------

	function containerMouseDown(e: MouseEvent) {
		e.preventDefault();
		document.addEventListener('mousemove', onMouseMove);
		document.addEventListener('mouseup', onDragStop);
		onDragStart(getMousePoint(e));
	}

	function containerTouchStart(e: TouchEvent) {
		document.addEventListener('touchmove', onTouchMove);
		document.addEventListener('touchend', onDragStop);

		if (e.touches.length === 2) {
			onPinchStart(e);
		} else if (e.touches.length === 1) {
			onDragStart(getTouchPoint(e.touches[0]));
		}
	}

	function containerWheel(e: WheelEvent) {
		// Skip if preview
		if (preview) return;

		e.preventDefault();
		const point = getMousePoint(e);
		const newZoom = zoom - (e.deltaY * zoomSpeed) / 200;
		setNewZoom(newZoom, point);
	}

	function onMouseMove(e: MouseEvent) {
		onDrag(getMousePoint(e));
	}

	function onDragStart({ x, y }: Point) {
		dragStartPosition = { x, y };
		dragStartCrop = { x: crop.x, y: crop.y };
	}

	function onDrag({ x, y }: Point) {
		if (rafDragTimeout) {
			cancelAnimationFrame(rafDragTimeout);
		}

		rafDragTimeout = requestAnimationFrame(() => {
			if (!cropperSize) return;

			const offsetX = x - dragStartPosition.x;
			const offsetY = y - dragStartPosition.y;

			const requestedPosition = {
				x: dragStartCrop.x + offsetX,
				y: dragStartCrop.y + offsetY
			};

			crop = restrictPosition
				? restrict(requestedPosition, imageSize, cropperSize, zoom)
				: requestedPosition;
		});
	}

	function onDragStop(e: Event) {
		cleanDocumentEvents();
		onchange?.({ crop, zoom });
	}

	function onTouchMove(e: TouchEvent) {
		e.preventDefault();
		if (e.touches.length === 2) {
			onPinchMove(e);
		} else if (e.touches.length === 1) {
			onDrag(getTouchPoint(e.touches[0]));
		}
	}

	function onPinchStart(e: TouchEvent) {
		const touch1 = getTouchPoint(e.touches[0]);
		const touch2 = getTouchPoint(e.touches[1]);

		lastPinchDistance = getDistanceBetweenPoints(touch1, touch2);
		onDragStart(getCenter(touch1, touch2));
	}

	function onPinchMove(e: TouchEvent) {
		const touch1 = getTouchPoint(e.touches[0]);
		const touch2 = getTouchPoint(e.touches[1]);
		const center = getCenter(touch1, touch2);

		onDrag(center);

		if (rafZoomTimeout) cancelAnimationFrame(rafZoomTimeout);

		rafZoomTimeout = requestAnimationFrame(() => {
			const distance = getDistanceBetweenPoints(touch1, touch2);
			const newZoom = zoom * (distance / lastPinchDistance);

			setNewZoom(newZoom, center);

			lastPinchDistance = distance;
		});
	}

	function preventZoomSafari(e: Event) {
		e.preventDefault();
	}

	function onImageLoad() {
		computeSizes();
		// Reset crop and zoom
		reset();
	}

	function cleanDocumentEvents() {
		document.removeEventListener('mousemove', onMouseMove);
		document.removeEventListener('mouseup', onDragStop);
		document.removeEventListener('touchmove', onTouchMove);
		document.removeEventListener('touchend', onDragStop);
	}

	// ------------------------------
	// Actions
	// ------------------------------

	export function handleKeyDown(e: KeyboardEvent) {
		if (preview) return;
		if (!cropperSize) return;

		const panStep = e.shiftKey ? 50 : 10;
		const zoomStep = 0.1;
		let handled = true;

		switch (e.key) {
			case 'ArrowLeft':
				crop = restrictPosition
					? restrict({ x: crop.x + panStep, y: crop.y }, imageSize, cropperSize, zoom)
					: { x: crop.x + panStep, y: crop.y };
				break;
			case 'ArrowRight':
				crop = restrictPosition
					? restrict({ x: crop.x - panStep, y: crop.y }, imageSize, cropperSize, zoom)
					: { x: crop.x - panStep, y: crop.y };
				break;
			case 'ArrowUp':
				crop = restrictPosition
					? restrict({ x: crop.x, y: crop.y + panStep }, imageSize, cropperSize, zoom)
					: { x: crop.x, y: crop.y + panStep };
				break;
			case 'ArrowDown':
				crop = restrictPosition
					? restrict({ x: crop.x, y: crop.y - panStep }, imageSize, cropperSize, zoom)
					: { x: crop.x, y: crop.y - panStep };
				break;
			case '+':
			case '=':
				zoom = Math.min(maxZoom, zoom + zoomStep);
				crop = restrictPosition ? restrict(crop, imageSize, cropperSize, zoom) : crop;
				break;
			case '-':
				zoom = Math.max(minZoom, zoom - zoomStep);
				crop = restrictPosition ? restrict(crop, imageSize, cropperSize, zoom) : crop;
				break;
			default:
				handled = false;
		}

		if (handled) {
			e.preventDefault();
			onchange?.({ crop, zoom });
		}
	}

	function container(el: HTMLDivElement) {
		el.addEventListener('mousedown', containerMouseDown);
		el.addEventListener('touchstart', containerTouchStart, { passive: false });
		el.addEventListener('wheel', containerWheel, { passive: false });
		el.addEventListener('gesturestart', preventZoomSafari);
		el.addEventListener('gesturechange', preventZoomSafari);

		return {
			destroy() {
				el.removeEventListener('mousedown', containerMouseDown);
				el.removeEventListener('touchstart', containerTouchStart);
				el.removeEventListener('wheel', containerWheel);
				el.removeEventListener('gesturestart', preventZoomSafari);
				el.removeEventListener('gesturechange', preventZoomSafari);
			}
		};
	}

	function image(el: HTMLImageElement) {
		if (el.complete) {
			onImageLoad();
		}

		el.addEventListener('load', onImageLoad);

		return {
			destroy() {
				el.removeEventListener('load', onImageLoad);
			}
		};
	}

	// Clean up document event listeners and pending RAF frames
	$effect(() => {
		return () => {
			cleanDocumentEvents();
			if (rafDragTimeout) cancelAnimationFrame(rafDragTimeout);
			if (rafZoomTimeout) cancelAnimationFrame(rafZoomTimeout);
		};
	});

	$effect(() => {
		if (effectiveAspect) {
			untrack(() => computeSizes());
		}
	});

	// update touched state
	$effect(() => {
		if (crop.x !== 0 || crop.y !== 0 || zoom !== 1) {
			touched = true;
		} else {
			touched = false;
		}
	});

	export function getCropData() {
		if (!cropperSize || cropperSize.width === 0) return;
		const position = crop;
		const { croppedAreaPixels } = computeCroppedArea(
			position,
			imageSize,
			cropperSize,
			effectiveAspect,
			zoom,
			restrictPosition
		);

		return croppedAreaPixels;
	}

	export function reset() {
		crop = { x: 0, y: 0 };
		zoom = 1;
	}

	export async function blob() {
		const cropData = getCropData();

		if (!cropData) {
			throw new Error('No crop data');
		}

		const { height, width, x, y } = cropData;

		const image = await new Promise<HTMLImageElement>((resolve, reject) => {
			const image = new Image();
			image.src = src;
			image.crossOrigin = 'anonymous';
			image.onload = () => resolve(image);
			image.onerror = reject;
		});

		// Convert to Blob
		const canvas = document.createElement('canvas').transferControlToOffscreen();
		const ctx = canvas.getContext('2d');

		if (!ctx) {
			throw new Error('No 2d context');
		}

		canvas.width = width;
		canvas.height = height;

		if (width > height) {
			if (maxWidth && width > maxWidth) {
				canvas.width = maxWidth;
				canvas.height = (height * maxWidth) / width;
			}
		} else {
			if (maxHeight && height > maxHeight) {
				canvas.height = maxHeight;
				canvas.width = (width * maxHeight) / height;
			}
		}

		ctx.drawImage(image, x, y, width, height, 0, 0, canvas.width, canvas.height);

		return canvas.convertToBlob({
			type: 'image/webp',
			quality: quality ?? 0.8
		});
	}

	export async function file() {
		const originalName = src.split('/').pop()?.split('.')[0] ?? 'image';
		return new File([await blob()], `${originalName}.webp`, { type: 'image/webp' });
	}
</script>

<svelte:window onresize={() => requestAnimationFrame(computeSizes)} />

<div data-ek-cropper bind:this={containerEl} use:container data-testid="container">
	<div
		data-ek-cropper-wrapper
		style:width="{imageSize.width}px"
		style:height="{imageSize.height}px"
		style:left="{imageSize.left}px"
		style:top="{imageSize.top}px"
		style="transform: translate({crop.x}px, {crop.y}px) scale({zoom})"
	>
		<img data-ek-cropper-image {src} alt="" bind:this={imageEl} use:image />
	</div>
	{#if cropperSize && !preview}
		<div
			data-ek-crop-overlay
			data-ek-crop-shape={cropShape}
			style:width="{cropperSize.width}px"
			style:height="{cropperSize.height}px"
		></div>
	{/if}
</div>

<style>
	:global([data-ek-cropper]) {
		position: absolute;
		inset: 0;
		overflow: hidden;
		user-select: none;
		touch-action: none;
		cursor: move;
	}

	:global([data-ek-cropper-wrapper]) {
		position: absolute;
		display: inline;
		inset: 0;
		will-change: transform;
		margin: auto;
	}

	:global([data-ek-cropper-image]) {
		width: 100%;
		height: 100%;
	}

	:global([data-ek-crop-overlay]) {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		box-sizing: border-box;
		color: var(--ek-crop-overlay-color, rgba(0, 0, 0, 0.5));
		overflow: hidden;
	}

	:global([data-ek-crop-overlay]::before) {
		content: '';
		box-sizing: border-box;
		border-left: var(--ek-crop-grid-width, 1px) solid
			var(--ek-crop-grid-color, rgba(255, 255, 255, 0.5));
		border-right: var(--ek-crop-grid-width, 1px) solid
			var(--ek-crop-grid-color, rgba(255, 255, 255, 0.5));
		position: absolute;
		top: 0;
		bottom: 0;
		left: 33.333%;
		right: 33.333%;
	}

	:global([data-ek-crop-overlay]::after) {
		content: '';
		box-sizing: border-box;
		border-top: var(--ek-crop-grid-width, 1px) solid
			var(--ek-crop-grid-color, rgba(255, 255, 255, 0.5));
		border-bottom: var(--ek-crop-grid-width, 1px) solid
			var(--ek-crop-grid-color, rgba(255, 255, 255, 0.5));
		position: absolute;
		top: 33.333%;
		bottom: 33.333%;
		left: 0;
		right: 0;
	}

	:global([data-ek-crop-overlay][data-ek-crop-shape='round']) {
		border-radius: 50%;
	}
</style>
