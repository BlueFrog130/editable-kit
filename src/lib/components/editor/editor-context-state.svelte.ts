import { editor } from '$lib/state/editor.svelte.js';
import type { EditorData } from '$lib/types.js';
import { getContext, setContext, untrack } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';

type RegistrationKey = string | number | Symbol;

type EditorRegistration = {
	name: RegistrationKey;
	getContent: () => EditorData[keyof EditorData];
};

const editorContextKey = Symbol();

function editorContextState<T extends EditorData>(data: T) {
	const original = data;
	let d: null | T = $state(null);
	const components: SvelteMap<RegistrationKey, EditorRegistration> = $state(
		new SvelteMap<RegistrationKey, EditorRegistration>()
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
		reset() {
			d = { ...original };
		},
		register(registration: EditorRegistration) {
			if (components.has(registration.name)) {
				throw new Error(`Editor with name ${registration.name} is already registered`);
			}

			components.set(registration.name, registration);

			return () => {
				components.delete(registration.name);
			};
		}
	};
}

export const setEditorContext = <T extends EditorData>(data: T) =>
	setContext(editorContextKey, editorContextState(data));

export const getEditorContext = <T extends EditorData>() =>
	getContext<ReturnType<typeof editorContextState<T>>>(editorContextKey);

export const registerEditor = <T extends EditorData>(registration: EditorRegistration) => {
	const ctx = getEditorContext<T>();

	$effect(() => {
		const dispose = ctx.register(registration);

		return dispose;
	});
};
