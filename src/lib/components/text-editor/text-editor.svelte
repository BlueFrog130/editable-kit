<script lang="ts">
	import { importEditor, type EditorContentProps } from '../editor/index.js';
	import { resolveExtensions } from '../editor/resolve-extensions.js';
	import { Renderer } from '../renderer/index.js';

	let {
		content,
		editor = $bindable(),
		editing,
		variant,
		overrides,
		textEditorOptions,
		'aria-label': ariaLabel,
		...props
	}: EditorContentProps = $props();

	async function loadEditor() {
		const [tiptapModule, editorModule, extModule] = await importEditor(variant);
		const extensions = await resolveExtensions(extModule.extensions, textEditorOptions);
		return [tiptapModule, editorModule, extensions] as const;
	}
</script>

{#snippet rendered()}
	<Renderer doc={content} {overrides} />
{/snippet}

{#if editing}
	{#await loadEditor()}
		{@render rendered()}
	{:then [{ Editor: Tiptap }, { default: Editor }, extensions]}
		<div data-ek-text-editor data-ek-variant={variant}>
			<Editor
				bind:this={editor}
				tiptap={Tiptap}
				{content}
				{extensions}
				oncreate={textEditorOptions?.oncreate}
				ondestroy={textEditorOptions?.ondestroy}
				editorProps={textEditorOptions?.editorProps}
				aria-label={ariaLabel}
				{...props}
			/>
		</div>
	{:catch}
		{@render rendered()}
	{/await}
{:else}
	{@render rendered()}
{/if}

<style>
	:global([data-ek-text-editor]) {
		display: contents;
	}

	:global([data-ek-text-editor][data-ek-variant='plain']) :global(.ProseMirror) {
		display: inline-block;
	}
</style>
