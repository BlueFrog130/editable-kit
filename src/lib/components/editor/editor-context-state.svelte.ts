import { editor } from '$lib/state/editor.svelte.js';
import type { EditorData, EditorSaveData, MaybePromise } from '$lib/types.js';
import { getContext, setContext, untrack, type Component } from 'svelte';
import type { EditorComponent, EditorContent } from './index.js';

type RegistrationKey = string | number | Symbol;

type EditorRegistration = {
	name: RegistrationKey;
	getContent: () => EditorData[keyof EditorData];
};

const editorContextKey = Symbol();

function editorContextState<T extends EditorData>(
	data: T,
	onsave?: (data: EditorSaveData<T>) => MaybePromise<void>
) {
	const original = data;
	let d: null | T = $state(null);
	const components: Record<keyof T, EditorComponent> = $state(
		{} as Record<keyof T, EditorComponent>
	);

	const modified = $derived(Object.keys(d ?? {}).some((key) => d![key] !== original[key]));

	$effect.pre(() => {
		if (editor.editing && untrack(() => d === null)) {
			untrack(() => (d = { ...original }));
		}
	});

	return {
		get data() {
			return d ?? original;
		},
		set data(value: T) {
			d = value;
		},
		get modified() {
			return modified;
		},
		get components() {
			return components;
		},
		reset() {
			d = { ...original };
		},
		async save() {
			if (d === null) return;

			const entries = await Promise.all(
				Object.entries(components).map(async ([key, component]) => [
					key,
					await component.getContent()
				])
			);
			const data = Object.fromEntries(entries);
			onsave?.(data);
		}
	};
}

export const setEditorContext = <T extends EditorData>(
	data: T,
	onsave: (data: EditorSaveData<T>) => MaybePromise<void>
) => setContext(editorContextKey, editorContextState(data, onsave));

export const getEditorContext = <T extends EditorData>() =>
	getContext<ReturnType<typeof editorContextState<T>>>(editorContextKey);
