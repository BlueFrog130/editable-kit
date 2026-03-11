<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children,
		label = 'Live Example',
		editing = $bindable(false),
		onsave
	}: {
		children: Snippet;
		label?: string;
		editing?: boolean;
		onsave?: () => void;
	} = $props();
</script>

<div class="my-6 overflow-hidden rounded-lg border border-border">
	<div class="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2">
		<p class="text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
			{label}
		</p>
		<div class="flex items-center gap-1.5">
			{#if editing && onsave}
				<button
					class="rounded px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
					onclick={() => (editing = false)}
				>
					Cancel
				</button>
				<button
					class="rounded bg-foreground px-2.5 py-1 text-[11px] font-medium text-background transition-colors hover:bg-foreground/90"
					onclick={onsave}
				>
					Save
				</button>
			{:else}
				<button
					class="rounded px-2.5 py-1 text-[11px] font-medium transition-colors {editing
						? 'bg-foreground text-background hover:bg-foreground/90'
						: 'text-muted-foreground hover:bg-muted hover:text-foreground'}"
					onclick={() => (editing = !editing)}
				>
					{editing ? 'Editing' : 'Try editing'}
				</button>
			{/if}
		</div>
	</div>
	<div class="p-6">
		{@render children()}
	</div>
</div>
