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
	{:then [{ Editor: Tiptap }, { default: Editor }, { plain }, { toolbarState }]}
		<div class="contents [&_.ProseMirror]:inline-block">
			<Editor
				bind:this={editor}
				tiptap={Tiptap}
				{content}
				extensions={plain}
				{...toolbarState.props}
				{...props}
			/>
		</div>
	{/await}
{:else}
	{@render html()}
{/if}
