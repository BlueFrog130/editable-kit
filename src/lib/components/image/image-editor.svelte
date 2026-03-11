<script lang="ts">
	import type { FocusUtils, Point } from './types.js';
	import Cropper from './cropper.svelte';
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';

	let {
		class: _className,
		src = $bindable(),
		alt = $bindable(''),
		maxWidth,
		maxHeight,
		aspect,
		quality,
		onchange,
		onfocus,
		placeholder,
		'aria-label': ariaLabel
	}: {
		class?: ClassValue;
		src: string;
		alt: string;
		aspect?: number;
		maxWidth?: number;
		maxHeight?: number;
		quality?: number;
		onchange?: (data: { crop: Point; zoom: number }) => void;
		onfocus?: (e: FocusUtils) => void;
		placeholder?: Snippet<[typeof replaceImage]>;
		'aria-label'?: string;
	} = $props();

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

	function setImageSrc(value: string) {
		src = value;
		touched = false;
		el.focus();
	}

	function onFocus() {
		editing = true;
		onfocus?.({
			replaceImage,
			setImageSrc,
			getAlt: () => alt,
			setAlt: (value: string) => (alt = value)
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
		if (touched && cropper) {
			return {
				type: 'image-blob' as const,
				blob: await cropper.blob(),
				alt
			};
		}
		return {
			type: 'image-src' as const,
			src,
			alt
		};
	}

	export async function syncContent() {}
</script>

{#snippet defaultImagePlaceholder()}
	<label data-ek-image-placeholder>
		<input data-ek-sr-only type="file" accept="image/*" onchange={insertFile} />
		<p>Image</p>
	</label>
{/snippet}

<button
	bind:this={el}
	data-ek-image-editor
	data-state={editing ? 'editing' : undefined}
	aria-label={ariaLabel}
	aria-roledescription="image editor"
	onfocusin={onFocus}
	onmousedown={(e) => e.currentTarget.focus()}
	onkeydown={(e) => cropper?.handleKeyDown(e)}
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
	{:else if placeholder}
		{@render placeholder(replaceImage)}
	{:else}
		{@render defaultImagePlaceholder()}
	{/if}
</button>

<style>
	:global([data-ek-image-editor]) {
		width: 100%;
		height: 100%;
		position: relative;
	}

	:global([data-ek-image-editor]:hover),
	:global([data-ek-image-editor][data-state='editing']) {
		box-shadow: 0 0 0 var(--ek-focus-ring-width, 1px) var(--ek-focus-ring-color, #39f);
	}

	:global([data-ek-image-placeholder]) {
		display: grid;
		place-content: center;
		width: 100%;
		height: 100%;
		cursor: pointer;
		color: var(--ek-image-placeholder-color, currentColor);
		background: var(--ek-image-placeholder-bg, transparent);
	}

	:global([data-ek-sr-only]) {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}
</style>
