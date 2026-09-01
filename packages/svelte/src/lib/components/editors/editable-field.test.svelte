<script lang="ts">
	import type { ProseMirrorJSON } from '@editable-kit/core';
	import type { TextEditorOptions } from '@editable-kit/core';
	import Root from '../editable/editable.svelte';
	import EditableField from './editable-field.svelte';

	let {
		value = $bindable(),
		editing = true,
		fieldEditing,
		options,
		fieldOptions
	}: {
		value: ProseMirrorJSON;
		editing?: boolean;
		/** Explicit `editing` on the field, to check it beats the Root's. */
		fieldEditing?: boolean;
		options?: TextEditorOptions;
		fieldOptions?: TextEditorOptions;
	} = $props();
</script>

<Root {editing} {options}>
	<EditableField bind:value variant="rich" editing={fieldEditing} options={fieldOptions} />
</Root>
