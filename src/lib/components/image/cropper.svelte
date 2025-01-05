<script lang="ts">
	import { untrack } from 'svelte';
	import type { CropShape, ImageSize, Point, Size } from './types.js';
	import {
		computeCroppedArea,
		getCenter,
		getCropSize,
		getDistanceBetweenPoints,
		restrictPosition as restrict
	} from './util.js';

	let {
		src,
		crop = $bindable({ x: 0, y: 0 }),
		zoom = $bindable(1),
		touched = $bindable(false),
		aspect = 4 / 3,
		cropShape = 'rect',
		preview = false,
		maxWidth,
		maxHeight,
		quality,
		onchange
	}: {
		src: string;
		crop?: Point;
		aspect: number;
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

	let imageSize: ImageSize & { left: number; top: number } = $state({
		width: 0,
		height: 0,
		naturalWidth: 0,
		naturalHeight: 0,
		left: 0,
		top: 0
	});
	let containerRect: DOMRect | null = $state(null);
	let dragStartPosition = { x: 0, y: 0 };
	let dragStartCrop = { x: 0, y: 0 };
	let lastPinchDistance = 0;
	let rafDragTimeout: number | null = null;
	let rafZoomTimeout: number | null = null;

	// ------------------------------
	// Derived state
	// ------------------------------

	const computedAspect = $derived.by(() => {
		// if (cropSize) {
		// 	return cropSize.width / cropSize.height;
		// }
		return aspect;
	});

	const cropperSize = $derived.by<Size | null>(() => {
		if (!containerRect) return null;
		return {
			height: containerRect.height,
			width: containerRect.width
		};
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
		const scaledImageSize = { width: 0, height: 0, left: 0, top: 0 };
		if (containerEl) {
			containerRect = containerEl.getBoundingClientRect();
			scaledImageSize.width = containerRect.width;
			scaledImageSize.height = containerRect.height;
		}
		if (imageEl) {
			const naturalAspect = imageEl.naturalWidth / imageEl.naturalHeight;
			const desiredWidth = scaledImageSize.width;
			const desiredHeight = scaledImageSize.height;

			// If the image is wider than the aspect, we need to scale it to the height
			if (naturalAspect > computedAspect) {
				scaledImageSize.width = desiredHeight * naturalAspect;
				scaledImageSize.height = desiredHeight;
				// center the image -- margin auto doesn't work
				scaledImageSize.left = (desiredWidth - scaledImageSize.width) / 2;
			} else {
				scaledImageSize.width = desiredWidth;
				scaledImageSize.height = desiredWidth / naturalAspect;
				// margin auto works vertically
			}

			imageSize = {
				...scaledImageSize,
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

	function container(el: HTMLDivElement) {
		el.addEventListener('mousedown', containerMouseDown);
		el.addEventListener('touchstart', containerTouchStart, { passive: false });
		el.addEventListener('wheel', containerWheel, { passive: false });
		el.addEventListener('guesturestart', preventZoomSafari);
		el.addEventListener('guesturechange', preventZoomSafari);

		return {
			destroy() {
				el.removeEventListener('mousedown', containerMouseDown);
				el.removeEventListener('touchstart', containerTouchStart);
				el.removeEventListener('wheel', containerWheel);
				el.removeEventListener('guesturestart', preventZoomSafari);
				el.removeEventListener('guesturechange', preventZoomSafari);
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

	// Clean up document event listeners
	$effect(() => {
		return () => {
			cleanDocumentEvents();
		};
	});

	$effect(() => {
		if (aspect) {
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
			computedAspect,
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
			image.onload = () => resolve(image);
			image.onerror = reject;
		});

		// Convert to Blob
		const canvas = document.createElement('canvas');
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

		return await new Promise<Blob>((resolve) => {
			canvas.toBlob(
				(blob) => {
					if (!blob) {
						throw new Error('No blob');
					}
					resolve(blob);
				},
				'image/webp',
				quality ?? 0.8
			);
		});
	}

	export async function file() {
		const originalName = src.split('/').pop()?.split('.')[0] ?? 'image';
		return new File([await blob()], `${originalName}.webp`, { type: 'image/webp' });
	}
</script>

<svelte:window onresize={computeSizes} />

<div
	class="absolute inset-0 overflow-hidden select-none touch-none !cursor-move"
	bind:this={containerEl}
	use:container
	role="button"
	data-testid="container"
>
	<div
		class="absolute inline inset-0 will-change-transform m-auto"
		style:width="{imageSize.width}px"
		style:height="{imageSize.height}px"
		style:left="{imageSize.left}px"
		style:top="{imageSize.top}px"
		style="transform: translate({crop.x}px, {crop.y}px) scale({zoom})"
	>
		<img class="w-full h-full" {src} alt="" bind:this={imageEl} use:image />
	</div>
	{#if cropperSize && !preview}
		<div
			class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 box-border text-black/50 overflow-hidden before:content-[''] before:box-border before:border-x-1 before:border-y-0 before:border-white/50 before:absolute before:inset-y-0 before:inset-x-1/3 after:content-[''] after:box-border after:border-x-0 after:border-y-1 after:border-white/50 after:absolute after:inset-y-1/3 after:inset-x-0 [&.crop-round]:rounded-full"
			class:crop-round={cropShape === 'round'}
			style:width="{cropperSize.width}px"
			style:height="{cropperSize.height}px"
		></div>
	{/if}
</div>
