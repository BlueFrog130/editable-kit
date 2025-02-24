<script lang="ts">
	import { importEditor, type EditorContentProps } from '../editor/index.js';

	let {
		content = $bindable(),
		editor = $bindable(),
		editing,
		...props
	}: EditorContentProps = $props();
</script>

{#snippet html()}
	{@html content}
{/snippet}

{#if editing}
	{#await importEditor()}
		{@render html()}
	{:then [{ Editor: Tiptap }, { default: Editor }, { plain }]}
		<div class="contents [&_.ProseMirror]:inline-block">
			<Editor bind:this={editor} tiptap={Tiptap} bind:content extensions={plain} {...props} />
		</div>
	{/await}
{:else}
	{@render html()}
{/if}
