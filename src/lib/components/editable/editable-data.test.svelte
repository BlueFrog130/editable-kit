<script lang="ts">
	import type { ProseMirrorJSON } from '$lib/types/prosemirror.js';
	import type { ImageState } from '$lib/types.js';
	import Root from './editable.svelte';
	import Data from './editable-data.svelte';

	type TestData = {
		title: ProseMirrorJSON;
		body: ProseMirrorJSON;
	};

	type TestDataWithImage = {
		title: ProseMirrorJSON;
		cover: ImageState;
	};

	type Props = {
		editing?: boolean;
		data?: TestData;
		dataWithImage?: TestDataWithImage;
		variant?: 'text-only' | 'with-image' | 'multiline' | 'rich' | 'multi-field';
		onsave?: (data: any) => void;
		onrootsave?: (data: any) => void;
	};

	let {
		editing = false,
		data = {
			title: { type: 'doc', content: [{ type: 'text', text: 'Hello World' }] },
			body: {
				type: 'doc',
				content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Body text' }] }]
			}
		},
		dataWithImage = {
			title: { type: 'doc', content: [{ type: 'text', text: 'Title' }] },
			cover: { src: 'test.jpg', alt: 'Test image' }
		},
		variant = 'text-only',
		onsave,
		onrootsave
	}: Props = $props();
</script>

<Root {editing} onsave={onrootsave}>
	{#snippet children({ save, editing: isEditing })}
		<div data-testid="root-state" data-editing={isEditing}></div>
		<button data-testid="save-btn" onclick={save}>Save</button>

		{#if variant === 'text-only'}
			<Data key="blog" data={data as TestData} {onsave}>
				{#snippet children({ text })}
					<div data-testid="text-field">
						{@render text('title')}
					</div>
				{/snippet}
			</Data>
		{:else if variant === 'multiline'}
			<Data key="blog" data={data as TestData} {onsave}>
				{#snippet children({ multiline })}
					<div data-testid="multiline-field">
						{@render multiline('body')}
					</div>
				{/snippet}
			</Data>
		{:else if variant === 'rich'}
			<Data key="blog" data={data as TestData} {onsave}>
				{#snippet children({ rich })}
					<div data-testid="rich-field">
						{@render rich('body')}
					</div>
				{/snippet}
			</Data>
		{:else if variant === 'multi-field'}
			<Data key="blog" data={data as TestData} {onsave}>
				{#snippet children({ text, multiline })}
					<div data-testid="title-field">
						{@render text('title')}
					</div>
					<div data-testid="body-field">
						{@render multiline('body')}
					</div>
				{/snippet}
			</Data>
		{:else if variant === 'with-image'}
			<Data key="post" data={dataWithImage as TestDataWithImage} {onsave}>
				{#snippet children({ text, image })}
					<div data-testid="title-field">
						{@render text('title')}
					</div>
					<div data-testid="image-field">
						{@render image('cover', { maxWidth: 800, maxHeight: 600, quality: 0.8 })}
					</div>
				{/snippet}
			</Data>
		{/if}
	{/snippet}
</Root>
