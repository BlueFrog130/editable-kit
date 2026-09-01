<script lang="ts">
	import type { Snippet } from 'svelte';
	let { children }: { children: Snippet } = $props();
</script>

<nav style="display:flex; gap:1rem; padding:1rem; border-bottom:1px solid #ddd">
	<a href="/">Public site</a>
	<a href="/admin">Admin</a>
</nav>

<main style="max-width:48rem; margin:0 auto; padding:2rem 1rem">
	{@render children()}
</main>
