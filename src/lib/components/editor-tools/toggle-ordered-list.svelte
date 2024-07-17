<script lang="ts">
	import ToggleButtonBase from './toggle-button-base.svelte';
	import ListOrdered from 'lucide-svelte/icons/list-ordered';
	import type { EditorToolProps } from './index.js';

	const { ...props }: EditorToolProps = $props();
</script>

<ToggleButtonBase node="ordered_list" {...props}>
	<ListOrdered class="h-3 w-3 sm:h-4 sm:w-4" />
</ToggleButtonBase>
