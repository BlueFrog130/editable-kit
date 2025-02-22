<script lang="ts" generics="T extends EditorData">
	import { type Snippet } from 'svelte';
	import { PlainText as PlainTextComponent } from '../plain-text/index.js';
	import { MultilinePlainText as MultilinePlainTextComponent } from '../multiline-plain-text/index.js';
	import { Rich as RichComponent } from '../rich/index.js';
	import type { EditorComponentProps, EditorContent } from './index.js';
	import Image from '../image/image.svelte';
	import type { EditorData, EditorSaveData, ImageState, MaybePromise } from '$lib/types.js';
	import { SvelteMap } from 'svelte/reactivity';

	type StringSelector = (data: T) => string;
	type ImageSelector = (data: T) => ImageState;
	type Selector = StringSelector | ImageSelector;

	type TextEditorSnippet = Snippet<[StringSelector]>;

	type EditorRegistration = {
		getContent: () => Promise<EditorContent>;
	};

	type Props = {
		data: T;
		editing: boolean;
		onsave: (data: EditorSaveData<T>) => MaybePromise<void>;
		children: Snippet<
			[
				{
					plainText: TextEditorSnippet;
					multilinePlainText: TextEditorSnippet;
					rich: TextEditorSnippet;
					image: Snippet<
						[
							ImageSelector,
							{ maxWidth: number; maxHeight: number; quality: number; aspect: number }
						]
					>;
				}
			]
		>;
	};

	let { data, editing, onsave, children }: Props = $props();

	const components = new SvelteMap<Selector, EditorRegistration | undefined>();

	const editorProps = (selector: StringSelector): EditorComponentProps => {
		return {
			content: selector(data)
		};
	};

	const imageProps = (
		selector: ImageSelector,
		options: { maxWidth: number; maxHeight: number; quality: number; aspect: number }
	) => {
		const d = selector(data);

		return {
			src: d.src,
			alt: d.alt,
			...options
		};
	};
</script>

{#snippet plainText(selector: StringSelector)}
	<PlainTextComponent
		bind:editor={() => components.get(selector)!, (e) => components.set(selector, e)}
		{...editorProps(selector)}
		{editing}
	/>
{/snippet}

{#snippet multilinePlainText(selector: StringSelector)}
	<MultilinePlainTextComponent
		bind:editor={() => components.get(selector)!, (e) => components.set(selector, e)}
		{...editorProps(selector)}
		{editing}
	/>
{/snippet}

{#snippet rich(selector: StringSelector)}
	<RichComponent
		bind:editor={() => components.get(selector)!, (e) => components.set(selector, e)}
		{...editorProps(selector)}
		{editing}
	/>
{/snippet}

{#snippet image(
	selector: ImageSelector,
	options: { maxWidth: number; maxHeight: number; quality: number; aspect: number }
)}
	<Image
		bind:editor={() => components.get(selector)!, (e) => components.set(selector, e)}
		{...imageProps(selector, options)}
		{editing}
	/>
{/snippet}

{#snippet content()}
	{@render children({
		plainText,
		multilinePlainText,
		rich,
		image
	})}
{/snippet}

{@render content()}
