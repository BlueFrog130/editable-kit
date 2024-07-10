<script lang="ts">
	import ToggleButtonBase from './toggle-button-base.svelte';
	import type { ChildrenProps } from '$lib/index.js';

	const { children }: ChildrenProps = $props();
</script>

<ToggleButtonBase node="blockquote">
	{@render children()}
</ToggleButtonBase>
