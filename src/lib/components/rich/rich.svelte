<script lang="ts">
	import { importEditor, type EditorContentProps } from '../editor/index.js';

	let { editor = $bindable(), editing, content, ...props }: EditorContentProps = $props();
</script>

{#snippet html()}
	{@html content}
{/snippet}

{#if editing}
	{#await importEditor()}
		{@render html()}
	{:then [{ Editor: Tiptap }, { default: Editor }, { rich }, { toolbarState }]}
		<Editor
			bind:this={editor}
			tiptap={Tiptap}
			{content}
			extensions={rich}
			{...toolbarState.props}
			{...props}
		/>
	{/await}
{:else}
	{@render html()}
{/if}
