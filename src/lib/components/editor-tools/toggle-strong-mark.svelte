<script lang="ts">
	import Bold from 'lucide-svelte/icons/bold';
	import ToggleMark from './toggle-mark.svelte';
	import type { EditorToolProps } from './index.js';

	const { ...props }: EditorToolProps = $props();
</script>

<ToggleMark type="strong" {...props}>
	<Bold class="h-3 w-3 sm:h-4 sm:w-4" />
</ToggleMark>
