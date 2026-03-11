import type { Variant } from './types.js';

export type { TextEditorOptions } from './types.js';

export * from './types.js';

const cache = new Map<
	Variant,
	Promise<
		[
			typeof import('@tiptap/core'),
			typeof import('./editor.svelte'),
			{ extensions: import('@tiptap/core').Extensions }
		]
	>
>();

export function importEditor(variant: Variant) {
	if (!cache.has(variant)) {
		const ext = resolveExtensions(variant);
		cache.set(variant, Promise.all([import('@tiptap/core'), import('./editor.svelte'), ext]));
	}
	return cache.get(variant)!;
}

function resolveExtensions(variant: Variant) {
	switch (variant) {
		case 'plain':
			return import('./extensions-plain.js');
		case 'multiline':
			return import('./extensions-multiline.js');
		case 'rich':
			return import('./extensions-rich.js');
	}
}
