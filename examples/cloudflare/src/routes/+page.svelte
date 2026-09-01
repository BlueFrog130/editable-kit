<script lang="ts">
	import type { HomeContent } from '$lib/content';
	import Home from './home.svelte';

	let { data }: { data: { content: HomeContent } } = $props();
</script>

<Home content={data.content} />
