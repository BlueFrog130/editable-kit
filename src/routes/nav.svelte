<script lang="ts">
	import { Button } from '@routes/components/ui/button/index.js';

	let {
		editing,
		onedit,
		onreset,
		backHref,
		ondelete
	}: {
		editing: boolean;
		onedit: () => void;
		onreset: () => void;
		backHref?: string;
		ondelete?: () => void;
	} = $props();

	const today = new Date().toLocaleDateString('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
</script>

<nav
	class="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md supports-backdrop-filter:bg-background/70"
>
	<div class="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
		{#if backHref}
			<a
				href={backHref}
				class="flex items-center gap-1.5 text-xs tracking-[0.15em] text-muted-foreground uppercase transition-colors hover:text-foreground"
			>
				<span class="text-base">&larr;</span> Back
			</a>
		{:else}
			<span class="text-xs tracking-[0.15em] text-muted-foreground uppercase">{today}</span>
		{/if}
		<div class="flex items-center gap-2">
			{#if editing}
				{#if ondelete}
					<Button variant="ghost" size="sm" onclick={ondelete}>Delete</Button>
				{/if}
				<Button variant="ghost" size="sm" onclick={onreset}>Reset</Button>
			{:else}
				<Button variant="ghost" size="sm" href="/docs">Docs</Button>
				<Button variant="ghost" size="sm" onclick={onedit}>Edit Page</Button>
			{/if}
		</div>
	</div>
</nav>
