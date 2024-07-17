<script lang="ts">
	import ToggleButtonBase from './toggle-button-base.svelte';
	import List from 'lucide-svelte/icons/list';
	import type { EditorToolProps } from './index.js';

	const { ...props }: EditorToolProps = $props();
</script>

<ToggleButtonBase node="bullet_list" {...props}>
	<List class="h-3 w-3 sm:h-4 sm:w-4" />
</ToggleButtonBase>
