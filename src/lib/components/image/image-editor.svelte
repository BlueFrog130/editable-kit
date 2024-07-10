<script lang="ts">
	import type { ImageProps } from './index.js';

	let {
		src = $bindable(),
		previewSrc = $bindable(),
		alt,
		quality,
		maxHeight,
		maxWidth,
		uploadPrompt
	}: ImageProps & { previewSrc: string } = $props();
</script>
