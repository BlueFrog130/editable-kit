<script lang="ts">
	import { highlight } from './highlight.js';

	let { code, lang = 'svelte' }: { code: string; lang?: string } = $props();

	let copied = $state(false);

	function copy() {
		navigator.clipboard.writeText(code);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}
</script>

<div class="group/code relative my-4">
	<button
		onclick={copy}
		class="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-md border border-border bg-background/80 px-2 py-1 text-xs text-muted-foreground opacity-0 backdrop-blur transition-opacity group-hover/code:opacity-100 hover:text-foreground"
	>
		{#if copied}
			<svg class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
				><polyline points="20 6 9 17 4 12" /></svg
			>
			Copied
		{:else}
			<svg class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
				><rect x="9" y="9" width="13" height="13" rx="2" /><path
					d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
				/></svg
			>
			Copy
		{/if}
	</button>
	{#await highlight(code, lang)}
		<pre
			class="overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 text-sm leading-relaxed"><code
				class="font-mono text-[13px]">{code}</code
			></pre>
	{:then html}
		<div class="shiki-wrapper">
			{@html html}
		</div>
	{/await}
</div>

<style>
	.shiki-wrapper :global(pre) {
		overflow-x: auto;
		border-radius: 0.5rem;
		border: 1px solid var(--color-border);
		background: var(--color-muted) / 0.5 !important;
		padding: 1rem;
		font-size: 0.875rem;
		line-height: 1.625;
	}

	.shiki-wrapper :global(code) {
		font-family:
			ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
		font-size: 13px;
	}
</style>
