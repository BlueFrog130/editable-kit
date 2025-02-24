<script lang="ts" generics="T extends EditorData">
	import { untrack, type Snippet } from 'svelte';
	import { PlainText as PlainTextComponent } from '../plain-text/index.js';
	import { MultilinePlainText as MultilinePlainTextComponent } from '../multiline-plain-text/index.js';
	import { Rich as RichComponent } from '../rich/index.js';
	import type { EditorComponentProps, EditorContent } from '../editor/index.js';
	import Image from '../image/image.svelte';
	import type { EditorData, EditorSaveData, ImageState, MaybePromise } from '$lib/types.js';
	import { SvelteMap } from 'svelte/reactivity';
	import { getEditableContext } from './editable-context.svelte.js';
	import type { ImageProps } from '../image/index.js';

	type Get<TVal> = (data: T) => TVal;
	type Set<TVal> = (data: T, value: TVal) => void;

	type StringSelector = [Get<string>, Set<string>];
	type ImageSelector = [Get<ImageState>, Set<ImageState>];
	type Selector = Get<string> | Get<ImageState>;

	type TextEditorSnippet = Snippet<[StringSelector]>;

	type EditorRegistration = {
		getContent: () => Promise<EditorContent>;
		setContent: () => Promise<void>;
	};

	type Props = {
		data: T;
		// onsave: (data: EditorSaveData<T>) => MaybePromise<void>;
		children?: Snippet<
			[
				{
					text: TextEditorSnippet;
					multiline: TextEditorSnippet;
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

	let { data: _data, children }: Props = $props();

	const data = $state(structuredClone(_data));

	const ctx = getEditableContext();

	const components = new SvelteMap<Selector, EditorRegistration | undefined>();

	$effect.pre(() => {
		let unregister: () => void;

		if (ctx.editing) {
			unregister = ctx.register({
				save
			});
		}

		return () => {
			unregister?.();
		};
	});

	const editorProps = (get: StringSelector[0]): EditorComponentProps => {
		return {
			content: get(data),
			onfocus: (e) => {
				if (!ctx.state) return;
				ctx.state.active = {
					type: 'text',
					editor: e
				};
			}
		};
	};

	const imageProps = (
		get: ImageSelector[0],
		options: { maxWidth: number; maxHeight: number; quality: number; aspect: number }
	): Pick<
		ImageProps,
		'src' | 'alt' | 'onfocus' | 'maxWidth' | 'maxHeight' | 'quality' | 'aspect'
	> => {
		const d = get(data);

		return {
			src: d.src,
			alt: d.alt,
			onfocus: (e) => {
				if (!ctx.state) return;
				ctx.state.active = {
					type: 'image',
					editor: e
				};
			},
			...options
		};
	};

	async function save() {
		await Promise.all(
			components.values().map(async (component) => {
				component?.setContent();
			})
		);

		console.log(data);
	}
</script>

{#snippet text([get, set]: StringSelector)}
	<PlainTextComponent
		bind:editor={() => components.get(get)!, (e) => components.set(get, e)}
		{...editorProps(get)}
		editing={ctx.editing}
		bind:content={() => get(data), (v) => set(data, v)}
	/>
{/snippet}

{#snippet multiline([get, set]: StringSelector)}
	<MultilinePlainTextComponent
		bind:editor={() => components.get(get)!, (e) => components.set(get, e)}
		{...editorProps(get)}
		editing={ctx.editing}
		bind:content={() => get(data), (v) => set(data, v)}
	/>
{/snippet}

{#snippet rich([get, set]: StringSelector)}
	<RichComponent
		bind:editor={() => components.get(get)!, (e) => components.set(get, e)}
		{...editorProps(get)}
		editing={ctx.editing}
		bind:content={() => get(data), (v) => set(data, v)}
	/>
{/snippet}

{#snippet image(
	[get, set]: ImageSelector,
	options: { maxWidth: number; maxHeight: number; quality: number; aspect: number }
)}
	<Image
		bind:editor={() => components.get(get)!, (e) => components.set(get, e)}
		{...imageProps(get, options)}
		editing={ctx.editing}
	/>
{/snippet}

{#snippet content()}
	{@render children?.({
		text,
		multiline,
		rich,
		image
	})}
{/snippet}

{@render content()}
