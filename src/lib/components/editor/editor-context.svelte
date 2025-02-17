<script lang="ts" generics="T extends EditorData">
	import { type Snippet } from 'svelte';
	import { setEditorContext } from './editor-context-state.svelte.js';
	import { PlainText as PlainTextComponent } from '../plain-text/index.js';
	import { MultilinePlainText as MultilinePlainTextComponent } from '../multiline-plain-text/index.js';
	import { Rich as RichComponent } from '../rich/index.js';
	import type { EditorComponentProps } from './index.js';
	import Image from '../image/image.svelte';
	import type {
		EditorData,
		EditorSaveData,
		ImageKeys,
		ImageState,
		MaybePromise,
		StringKeys
	} from '$lib/types.js';
	import Toolbar from '../toolbar/toolbar.svelte';

	type TextEditorSnippet = Snippet<[StringKeys<T>]>;

	type Props = {
		data: T;
		onsave: (data: EditorSaveData<T>) => MaybePromise<void>;
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

	let { data, onsave, children }: Props = $props();

	const ctx = setEditorContext(data, onsave);

	$inspect({ data: ctx.data });

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
	<PlainTextComponent bind:editor={ctx.components[name]} {...editorProps(name)} />
{/snippet}

{#snippet multilinePlainText(name: StringKeys<T>)}
	<MultilinePlainTextComponent bind:editor={ctx.components[name]} {...editorProps(name)} />
{/snippet}

{#snippet rich(name: StringKeys<T>)}
	<RichComponent bind:editor={ctx.components[name]} {...editorProps(name)} />
{/snippet}

{#snippet image(
	name: ImageKeys<T>,
	options: { maxWidth: number; maxHeight: number; quality: number; aspect: number }
)}
	<Image bind:editor={ctx.components[name]} {...imageProps(name, options)} />
{/snippet}

<Toolbar onsave={ctx.save} />

{@render children({
	plainText,
	multilinePlainText,
	rich,
	image
})}
