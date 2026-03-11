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
	import { getEditableContext, type EditableContext } from './editable-context.svelte.js';
	import type { ImageProps } from '../image/index.js';
	import type { EditorRegistration, ImageOptions } from './internal-types.js';

	type JSONSelector = JSONKeys<T>;
	type ImageSelector = ImageKeys<T>;
	type Selector = JSONSelector | ImageSelector;

	type TextEditorSnippet = Snippet<
		[selector: JSONSelector, options?: TextEditorOptions, ariaLabel?: string]
	>;

	type Props = {
		key: string;
		data: T[];
		overrides?: NodeOverrides;
		onsave?: (data: EditorSaveData<T>[]) => MaybePromise<void>;
		each?: Snippet<
			[
				T,
				number,
				{
					text: TextEditorSnippet;
					multiline: TextEditorSnippet;
					rich: TextEditorSnippet;
					image: Snippet<[selector: ImageSelector, options: ImageOptions, ariaLabel?: string]>;
				}
			]
		>;
	};

	let { key, data, overrides, onsave, each: eachSnippet }: Props = $props();

	// Get context
	const ctx = getEditableContext();

	// Single SvelteMap with compound keys "index:selector"
	const components = new SvelteMap<string, EditorRegistration | undefined>();

	function compoundKey(index: number, selector: Selector): string {
		return `${index}:${String(selector)}`;
	}

	// Register with context
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

	// Cleanup stale entries when array shrinks
	$effect.pre(() => {
		const len = data.length;
		const stale: string[] = [];
		for (const k of components.keys()) {
			const idx = parseInt(k.split(':')[0]);
			if (idx >= len) {
				stale.push(k);
			}
		}
		for (const k of stale) {
			components.delete(k);
		}
	});

	const editorProps = (index: number, selector: JSONSelector): EditorComponentProps => {
		const item = data[index];
		return {
			content: item?.[selector] as ProseMirrorJSON,
			onfocus: (e) => {
				if (!ctx.state) return;
				ctx.state.active = {
					type: 'text',
					editor: e
				};
			}
		};
	};

	const imagePropsFactory = (
		index: number,
		selector: ImageSelector,
		options: ImageOptions
	): Pick<
		ImageProps,
		'src' | 'alt' | 'onfocus' | 'maxWidth' | 'maxHeight' | 'quality' | 'aspect'
	> => {
		const item = data[index];
		if (!item) return { src: '', alt: '', ...options };
		const d = item[selector] as ImageState;

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
			[...components.entries()].map(async ([ck, component]) => {
				if (!component) return;
				const content = await component.getContent();
				return [ck, content] as const;
			})
		);

		const validEntries = entries.filter((e): e is NonNullable<typeof e> => Boolean(e));

		// Group by index
		const grouped = new Map<number, Record<string, EditorContent>>();
		for (const [ck, content] of validEntries) {
			const colonIdx = ck.indexOf(':');
			const index = parseInt(ck.slice(0, colonIdx));
			const selector = ck.slice(colonIdx + 1);
			if (index >= data.length) continue;
			if (!grouped.has(index)) grouped.set(index, {});
			grouped.get(index)![selector] = content;
		}

		// Build ordered array
		const result: EditorSaveData<T>[] = [];
		for (let i = 0; i < data.length; i++) {
			result.push((grouped.get(i) ?? {}) as EditorSaveData<T>);
		}

		await onsave?.(result);

		return result;
	}
</script>

{#each data as item, i (i)}
	{#snippet text(selector: JSONSelector, options?: TextEditorOptions, ariaLabel?: string)}
		<TextEditor
			bind:editor={
				() => components.get(compoundKey(i, selector))!,
				(e) => components.set(compoundKey(i, selector), e)
			}
			{...editorProps(i, selector)}
			editing={ctx.editing}
			variant="plain"
			textEditorOptions={options}
			aria-label={ariaLabel}
			{overrides}
		/>
	{/snippet}

	{#snippet multiline(selector: JSONSelector, options?: TextEditorOptions, ariaLabel?: string)}
		<TextEditor
			bind:editor={
				() => components.get(compoundKey(i, selector))!,
				(e) => components.set(compoundKey(i, selector), e)
			}
			{...editorProps(i, selector)}
			editing={ctx.editing}
			variant="multiline"
			textEditorOptions={options}
			aria-label={ariaLabel}
			{overrides}
		/>
	{/snippet}

	{#snippet rich(selector: JSONSelector, options?: TextEditorOptions, ariaLabel?: string)}
		<TextEditor
			bind:editor={
				() => components.get(compoundKey(i, selector))!,
				(e) => components.set(compoundKey(i, selector), e)
			}
			{...editorProps(i, selector)}
			editing={ctx.editing}
			variant="rich"
			textEditorOptions={options}
			aria-label={ariaLabel}
			{overrides}
		/>
	{/snippet}

	{#snippet image(selector: ImageSelector, options: ImageOptions, ariaLabel?: string)}
		<Image
			bind:editor={
				() => components.get(compoundKey(i, selector))!,
				(e) => components.set(compoundKey(i, selector), e)
			}
			{...imagePropsFactory(i, selector, options)}
			editing={ctx.editing}
			aria-label={ariaLabel}
		/>
	{/snippet}

	{@render eachSnippet?.(item, i, { text, multiline, rich, image })}
{/each}
