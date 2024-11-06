<script lang="ts">
	import type { MaybePromise } from '@sveltejs/kit';
	import RotateCcw from 'lucide-svelte/icons/rotate-ccw';

	let { onclick }: { onclick: () => MaybePromise<void> } = $props();
</script>

<button {onclick} class="sm:mx-1 rounded-full p-2 disabled:opacity-30">
	<RotateCcw class="h-3 w-3 sm:h-4 sm:w-4" />
</button>
