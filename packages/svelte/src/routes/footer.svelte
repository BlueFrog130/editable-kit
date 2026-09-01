<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<footer class="group-data-editing:pointer-events-none group-data-editing:opacity-50">
	<div class="border-t border-border bg-secondary/40 py-16">
		<div class="mx-auto max-w-6xl px-6 text-center">
			<h2 class="font-serif text-2xl tracking-tight sm:text-3xl">
				Ready to make your content editable?
			</h2>
			<p class="mx-auto mt-3 max-w-md text-muted-foreground">
				Install editable-kit and add inline editing to your Svelte 5 app in minutes.
			</p>
			<div class="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
				<a
					href={resolve('/docs/getting-started')}
					class="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
				>
					Get Started &rarr;
				</a>
				<code
					class="inline-flex h-11 items-center rounded-md border border-border bg-background px-5 font-mono text-sm text-muted-foreground"
				>
					pnpm add @editable-kit/svelte
				</code>
			</div>
		</div>
	</div>

	<div class="border-t border-border">
		<div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
			<p class="font-serif text-sm">editable-kit</p>
			<p class="text-xs text-muted-foreground">
				Powered by
				<a
					href="https://svelte.dev"
					class="underline underline-offset-2 transition-colors hover:text-foreground"
					target="_blank"
					rel="noopener noreferrer">Svelte 5</a
				>
			</p>
		</div>
	</div>
</footer>
