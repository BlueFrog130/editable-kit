<script lang="ts">
	import ToggleButtonBase from './toggle-button-base.svelte';
	import Quote from 'lucide-svelte/icons/quote';
	import type { EditorToolProps } from './index.js';

	const { ...props }: EditorToolProps = $props();
</script>

<ToggleButtonBase node="blockquote" {...props}>
	<Quote class="h-3 w-3 sm:h-4 sm:w-4" />
</ToggleButtonBase>
