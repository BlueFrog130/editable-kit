<script lang="ts">
	import type { MaybePromise } from '@sveltejs/kit';
	import Crop from 'lucide-svelte/icons/crop';

	const { onclick }: { onclick: () => MaybePromise<void> } = $props();
</script>

<button {onclick} class="sm:mx-1 rounded-full p-2 disabled:opacity-30">
	<Crop class="h-3 w-3 sm:h-4 sm:w-4" />
</button>
