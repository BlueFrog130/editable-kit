<script lang="ts">
	import type { ProseMirrorJSON } from '$lib/types/prosemirror.js';
	import type { TextEditorOptions } from '../editor/types.js';
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
