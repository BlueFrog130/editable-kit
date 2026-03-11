<script lang="ts">
	import type { ProseMirrorJSON } from '$lib/types/prosemirror.js';
	import Root from './editable.svelte';
	import Each from './editable-each.svelte';

	type NoteData = {
		title: ProseMirrorJSON;
		body: ProseMirrorJSON;
	};

	type Props = {
		editing?: boolean;
		data?: NoteData[];
		onsave?: (data: any) => void;
		onrootsave?: (data: any) => void;
	};

	let {
		editing = false,
		data = [
			{
				title: { type: 'doc', content: [{ type: 'text', text: 'Note 1' }] },
				body: {
					type: 'doc',
					content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Body 1' }] }]
				}
			},
			{
				title: { type: 'doc', content: [{ type: 'text', text: 'Note 2' }] },
				body: {
					type: 'doc',
					content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Body 2' }] }]
				}
			}
		],
		onsave,
		onrootsave
	}: Props = $props();
</script>

<Root {editing} onsave={onrootsave}>
	{#snippet children({ save, editing: isEditing })}
		<div data-testid="root-state" data-editing={isEditing}></div>
		<button data-testid="save-btn" onclick={save}>Save</button>

		<Each key="notes" {data} {onsave}>
			{#snippet each(item, index, { text, multiline })}
				<div data-testid="note-{index}">
					<div data-testid="note-title-{index}">
						{@render text('title')}
					</div>
					<div data-testid="note-body-{index}">
						{@render multiline('body')}
					</div>
				</div>
			{/snippet}
		</Each>
	{/snippet}
</Root>
