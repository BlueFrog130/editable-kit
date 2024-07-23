<script lang="ts">
	import type { MaybePromise } from '@sveltejs/kit';

	const { onclick }: { onclick: () => MaybePromise<void> } = $props();
</script>

<button {onclick}> TEST </button>
