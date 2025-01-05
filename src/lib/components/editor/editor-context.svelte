<script lang="ts" generics="T extends EditorData">
	import { type Snippet } from 'svelte';
	import { setEditorContext } from './editor-context-state.svelte.js';
	import { PlainText as PlainTextComponent } from '../plain-text/index.js';
	import { MultilinePlainText as MultilinePlainTextComponent } from '../multiline-plain-text/index.js';
	import { Rich as RichComponent } from '../rich/index.js';
	import { debounce } from '$lib/util/debounce.js';
	import type { Editor, EditorEvents } from '@tiptap/core';
	import type { EditorComponentProps } from './index.js';
	import Image from '../image/image.svelte';
	import type { EditorData, ImageKeys, ImageState, StringKeys } from '$lib/types.js';

	type TextEditorSnippet = Snippet<[StringKeys<T>]>;

	type Props = {
		data: T;
		children: Snippet<
			[
				{
					plainText: TextEditorSnippet;
					multilinePlainText: TextEditorSnippet;
					rich: TextEditorSnippet;
					image: Snippet<
						[ImageKeys<T>, { maxWidth: number; maxHeight: number; quality: number; aspect: number }]
					>;
				}
			]
		>;
	};

	let { data, children }: Props = $props();

	const ctx = setEditorContext(data);

	$inspect({ data: ctx.data });

	const updater = (fn: (e: EditorEvents['update']) => void) =>
		debounce(fn, {
			timing: 'trailing',
			maxWaitMs: 1000,
			waitMs: 500
		});

	const editorProps = (key: StringKeys<T>): EditorComponentProps => {
		return {
			name: key,
			// @ts-ignore: data[key] is a string
			content: ctx.data[key]
		};
	};

	const imageProps = (
		key: ImageKeys<T>,
		options: { maxWidth: number; maxHeight: number; quality: number; aspect: number }
	) => {
		const data = ctx.data[key] as ImageState;

		return {
			name: key,
			src: data.src,
			alt: data.alt,
			...options
		};
	};
</script>

{#snippet plainText(name: StringKeys<T>)}
	<PlainTextComponent {...editorProps(name)} />
{/snippet}

{#snippet multilinePlainText(name: StringKeys<T>)}
	<MultilinePlainTextComponent {...editorProps(name)} />
{/snippet}

{#snippet rich(name: StringKeys<T>)}
	<RichComponent {...editorProps(name)} />
{/snippet}

{#snippet image(
	name: ImageKeys<T>,
	options: { maxWidth: number; maxHeight: number; quality: number; aspect: number }
)}
	<Image {...imageProps(name, options)} />
{/snippet}

{@render children({
	plainText,
	multilinePlainText,
	rich,
	image
})}
