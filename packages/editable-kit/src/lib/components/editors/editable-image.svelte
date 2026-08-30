<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import EditableField from './editable-field.svelte';

	type Props = Omit<ComponentProps<typeof EditableField>, 'variant'>;

	let { value = $bindable(), ...rest }: Props = $props();
</script>

<EditableField bind:value {...rest} variant="image" />
