<script lang="ts">
	import Italic from 'lucide-svelte/icons/italic';
	import ToggleMark from './toggle-mark.svelte';
	import type { EditorToolProps } from './index.js';

	const { ...props }: EditorToolProps = $props();
</script>

<ToggleMark type="em" {...props}>
	<Italic class="h-3 w-3 sm:h-4 sm:w-4" />
</ToggleMark>
