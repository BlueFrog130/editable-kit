<script lang="ts">
	import { type Snippet } from 'svelte';
	import {
		EditableContext,
		setEditableContext,
		type SaveStatus
	} from './editable-context.svelte.js';
	import type { EditableState } from './editable-state.svelte.js';
	import type { EditorContent } from '../editor/index.js';
	import type { MaybePromise } from '$lib/types.js';
	import type { SaveResult } from './types.js';

	const {
		editing: _editing,
		onsave,
		children
	}: {
		editing: boolean;
		onsave?: (data: SaveResult) => MaybePromise<void>;
		children?: Snippet<
			[
				{
					state: EditableState | undefined;
					save: () => Promise<SaveResult>;
					get: (
						key: string
					) => Promise<Record<string, EditorContent> | Record<string, EditorContent>[] | undefined>;
					editing: boolean;
					saveStatus: SaveStatus;
				}
			]
		>;
	} = $props();

	const ctx = setEditableContext(
		new EditableContext({
			get value() {
				return _editing;
			}
		})
	);

	$effect(() => {
		return () => ctx.destroy();
	});

	async function save() {
		const data = await ctx.save();
		await onsave?.(data);
		return data;
	}

	async function get(key: string) {
		return ctx.get(key);
	}
</script>

{@render children?.({ state: ctx.state, save, get, editing: _editing, saveStatus: ctx.saveStatus })}

<div aria-live="polite" data-ek-sr-only>
	{#if ctx.saveStatus === 'saving'}
		Saving changes…
	{:else if ctx.saveStatus === 'saved'}
		Changes saved.
	{:else if ctx.saveStatus === 'error'}
		Save failed.
	{/if}
</div>

<style>
	:global([data-ek-sr-only]) {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}
</style>
