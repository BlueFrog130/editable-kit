<script lang="ts">
	import type { Action } from 'svelte/action';
	import 'cropperjs/dist/cropper.min.css';
	import Cropper from 'cropperjs';

	let {
		cropper = $bindable(),
		data = $bindable(),
		src,
		aspectRatio = NaN,
		id
	}: {
		cropper: Cropper | undefined;
		src: string;
		aspectRatio: number;
		data: Cropper.Data | undefined;
		id: string;
	} = $props();

	let ready = $state(false);

	const action: Action<HTMLImageElement> = (el) => {
		if (!el.parentElement) return;

		// Parent until button
		let parent = el.parentElement;
		while (parent && parent.tagName !== 'BUTTON') {
			if (!parent.parentElement) return;
			parent = parent.parentElement;
		}

		const { width, height } = parent.getBoundingClientRect();

		console.log({ width, height });

		cropper = new Cropper(el, {
			viewMode: 3,
			dragMode: 'move',
			rotatable: false,
			minContainerWidth: 56,
			minContainerHeight: 56,
			minCanvasHeight: 56,
			minCanvasWidth: 56,
			minCropBoxHeight: 56,
			minCropBoxWidth: 56,
			toggleDragModeOnDblclick: false,
			autoCropArea: 1,
			cropBoxMovable: false,
			cropBoxResizable: false,
			aspectRatio,
			data,
			preview: `#${id} .preview`,
			ready() {
				ready = true;
			},
			crop({ detail }) {
				data = detail;
			}
		});

		return {
			destroy() {
				// TODO: Re-add this
				// cropper?.destroy();
			}
		};
	};

	$effect(() => {
		if (ready && src) {
			cropper?.replace(src);
		}
	});
</script>

<img class="block max-w-full max-h-full w-full h-full" use:action {src} alt="Crop" />
