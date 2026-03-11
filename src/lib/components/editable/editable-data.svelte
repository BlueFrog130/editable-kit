<script lang="ts" generics="T extends EditorData">
	import { type Snippet } from 'svelte';
	import { TextEditor } from '../text-editor/index.js';
	import type { EditorComponentProps, EditorContent, TextEditorOptions } from '../editor/index.js';
	import Image from '../image/image.svelte';
	import type {
		EditorData,
		EditorSaveData,
		ImageKeys,
		ImageState,
		MaybePromise,
		JSONKeys
	} from '$lib/types.js';
	import type { ProseMirrorJSON } from '$lib/types/prosemirror.js';
	import type { NodeOverrides } from '../renderer/types.js';
	import { SvelteMap } from 'svelte/reactivity';
	import { getEditableContext } from './editable-context.svelte.js';
	import type { ImageProps } from '../image/index.js';

	type JSONSelector = JSONKeys<T>;
	type ImageSelector = ImageKeys<T>;
	type Selector = JSONSelector | ImageSelector;

	type TextEditorSnippet = Snippet<
		[selector: JSONSelector, options?: TextEditorOptions, ariaLabel?: string]
	>;

	type EditorRegistration = {
		getContent: () => Promise<EditorContent>;
	};

	type Props = {
		key: string;
		data: T;
		overrides?: NodeOverrides;
		onsave?: (data: EditorSaveData<T>) => MaybePromise<void>;
		children?: Snippet<
			[
				{
					text: TextEditorSnippet;
					multiline: TextEditorSnippet;
					rich: TextEditorSnippet;
					image: Snippet<
						[
							selector: ImageSelector,
							options: { maxWidth: number; maxHeight: number; quality: number; aspect?: number },
							ariaLabel?: string
						]
					>;
				}
			]
		>;
	};

	let { key, data, overrides, onsave, children }: Props = $props();

	const ctx = getEditableContext();

	const components = new SvelteMap<Selector, EditorRegistration | undefined>();

	$effect.pre(() => {
		let unregister: () => void;

		if (ctx.editing) {
			unregister = ctx.register(key, {
				save
			});
		}

		return () => {
			unregister?.();
		};
	});

	const editorProps = (key: JSONSelector): EditorComponentProps => {
		return {
			content: data[key] as ProseMirrorJSON,
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
		key: ImageSelector,
		options: { maxWidth: number; maxHeight: number; quality: number; aspect?: number }
	): Pick<
		ImageProps,
		'src' | 'alt' | 'onfocus' | 'maxWidth' | 'maxHeight' | 'quality' | 'aspect'
	> => {
		const d = data[key] as ImageState;

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
		const entries = await Promise.all(
			[...components.entries()].map(async ([selector, component]) => {
				if (!component) return;
				const content = await component.getContent();
				return [selector, content] as const;
			})
		);

		const result = Object.fromEntries(
			entries.filter((e): e is NonNullable<typeof e> => Boolean(e))
		) as EditorSaveData<T>;

		await onsave?.(result);

		return result;
	}
</script>

{#snippet text(key: JSONSelector, options?: TextEditorOptions, ariaLabel?: string)}
	<TextEditor
		bind:editor={() => components.get(key)!, (e) => components.set(key, e)}
		{...editorProps(key)}
		editing={ctx.editing}
		variant="plain"
		textEditorOptions={options}
		aria-label={ariaLabel}
		{overrides}
	/>
{/snippet}

{#snippet multiline(key: JSONSelector, options?: TextEditorOptions, ariaLabel?: string)}
	<TextEditor
		bind:editor={() => components.get(key)!, (e) => components.set(key, e)}
		{...editorProps(key)}
		editing={ctx.editing}
		variant="multiline"
		textEditorOptions={options}
		aria-label={ariaLabel}
		{overrides}
	/>
{/snippet}

{#snippet rich(key: JSONSelector, options?: TextEditorOptions, ariaLabel?: string)}
	<TextEditor
		bind:editor={() => components.get(key)!, (e) => components.set(key, e)}
		{...editorProps(key)}
		editing={ctx.editing}
		variant="rich"
		textEditorOptions={options}
		aria-label={ariaLabel}
		{overrides}
	/>
{/snippet}

{#snippet image(
	key: ImageSelector,
	options: { maxWidth: number; maxHeight: number; quality: number; aspect?: number },
	ariaLabel?: string
)}
	<Image
		bind:editor={() => components.get(key)!, (e) => components.set(key, e)}
		{...imageProps(key, options)}
		editing={ctx.editing}
		aria-label={ariaLabel}
	/>
{/snippet}

{@render children?.({
	text,
	multiline,
	rich,
	image
})}
