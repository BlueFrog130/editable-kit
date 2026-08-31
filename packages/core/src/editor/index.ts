import type { Variant } from './types.js';

export * from './types.js';

type LoadedEditor = [
	typeof import('@tiptap/core'),
	{ extensions: import('@tiptap/core').Extensions }
];

const cache = new Map<Variant, Promise<LoadedEditor>>();

export function importEditor(variant: Variant) {
	if (!cache.has(variant)) {
		cache.set(variant, Promise.all([import('@tiptap/core'), resolveExtensions(variant)]));
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
		case 'image':
			return import('./extensions-image.js');
	}
}
