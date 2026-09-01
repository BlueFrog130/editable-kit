<script lang="ts" generics="T">
	import { untrack, type Snippet } from 'svelte';
	import {
		EditableContext,
		setEditableContext,
		type SaveStatus
	} from './editable-context.svelte.js';
	import type { EditableState } from './editable-state.svelte.js';
	import type { MaybePromise } from '@editable-kit/core';
	import type { TextEditorOptions } from '@editable-kit/core';
	import type { NodeOverrides } from '../renderer/types.js';

	let {
		data = $bindable(),
		editing,
		overrides,
		options,
		onsave,
		children
	}: {
		/**
		 * Your content object — pass it and bind fields straight at its properties.
		 * Optional; supply it to get `reset()` and to have it handed to `onsave`.
		 *
		 * Text fields sync on blur, not per keystroke, so reading `data` while a field
		 * is focused gives its value as of the last blur. `save()` flushes the focused
		 * field first, so what `onsave` receives is always current.
		 */
		data?: T;
		editing: boolean;
		/** Default renderer overrides for every field inside. Fields merge their own over these. */
		overrides?: NodeOverrides;
		/** Default editor options for every field inside — configure TipTap extensions once here. */
		options?: TextEditorOptions;
		/** Persist the content. Receives a plain snapshot of `data`, ready to serialize. */
		onsave?: (data: T) => MaybePromise<void>;
		children?: Snippet<
			[
				{
					state: EditableState | undefined;
					save: () => Promise<void>;
					/** Discard every edit made since editing was switched on. */
					reset: () => void;
					editing: boolean;
					saveStatus: SaveStatus;
					/** Whether anything has been edited since the last save or reset. */
					dirty: boolean;
				}
			]
		>;
	} = $props();

	let original: T | undefined;

	const ctx = setEditableContext(
		new EditableContext({
			get editing() {
				return editing;
			},
			get overrides() {
				return overrides;
			},
			get options() {
				return options;
			},
			restore: () => {
				// Clone per restore: the previous restore handed `original` itself to the
				// caller, whose state proxy then wrote edits straight back into it.
				if (original !== undefined) data = structuredClone(original);
			}
		})
	);

	// One snapshot per editing session, for `reset()`. Untracked because reading all of
	// `data` here would re-snapshot on every edit and leave reset with nothing to undo.
	$effect.pre(() => {
		original = editing ? (untrack(() => $state.snapshot(data)) as T) : undefined;
	});

	$effect(() => {
		return () => ctx.destroy();
	});
</script>

<!-- Getters, not values: a consumer that never reads `dirty` does not re-render when
	 it changes, and likewise for `saveStatus` and `state`. -->
{@render children?.({
	save: () => ctx.save(() => onsave?.($state.snapshot(data) as T)),
	reset: () => ctx.reset(),
	editing,
	get state() {
		return ctx.state;
	},
	get saveStatus() {
		return ctx.saveStatus;
	},
	get dirty() {
		return ctx.dirty;
	}
})}

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
