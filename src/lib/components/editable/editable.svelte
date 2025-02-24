<script lang="ts">
	import { type Snippet } from 'svelte';
	import { setEditableContext } from './editable-context.svelte.js';

	const { editing: _editing, children }: { editing: boolean; children?: Snippet } = $props();

	const ctx = setEditableContext();

	$effect.pre(() => {
		ctx.editing = _editing;
	});
</script>

{#if ctx.editing}
	{#await import('../toolbar/index.js') then { Toolbar }}
		{#if ctx.state}
			<Toolbar onsave={() => ctx.save()} state={ctx.state} />
		{/if}
	{/await}
{/if}

{@render children?.()}
