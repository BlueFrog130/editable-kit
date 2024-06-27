<script lang="ts">
	import type { Snippet } from 'svelte';
	import 'virtual:uno.css';
	import '@unocss/reset/tailwind.css';

	let { children }: { children: Snippet } = $props();
</script>

{@render children()}
