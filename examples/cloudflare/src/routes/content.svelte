<script lang="ts">
	import * as Editable from '@editable-kit/svelte';
	import type { EditableState } from '@editable-kit/svelte';
	import type { Content } from '$lib/content';
	import type { Snippet } from 'svelte';

	let {
		content = $bindable(),
		editing,
		toolbar,
		onsave
	}: {
		content: Content;
		editing: boolean;
		toolbar?: Snippet<[EditableState | undefined, () => Promise<void>]>;
		onsave?: (content: Content) => Promise<void>;
	} = $props();
</script>

<Editable.Root bind:data={content} {editing} {onsave}>
	{#snippet children({ state, save })}
		<article class={editing ? 'editing' : ''}>
			<Editable.Image bind:value={content.hero} />
			<h1><Editable.Text bind:value={content.title} /></h1>
			<div class="tagline"><Editable.Multiline bind:value={content.tagline} /></div>
			<Editable.Rich bind:value={content.body} />
		</article>
		{#if editing && toolbar}
			{@render toolbar(state, save)}
		{/if}
	{/snippet}
</Editable.Root>
