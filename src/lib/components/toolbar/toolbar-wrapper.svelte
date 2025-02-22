<script lang="ts">
	const { editing }: { editing: boolean } = $props();
</script>

{#if editing}
	{#await Promise.all([import('$lib/state/toolbar-state.svelte.js'), import('./toolbar.svelte')]) then [{ toolbarState }, { default: Toolbar }]}
		<Toolbar onsave={() => {}} state={toolbarState} />
	{/await}
{/if}
