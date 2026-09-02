import type { Extensions } from '@tiptap/core';
import type { TextEditorOptions, Variant } from './types.js';

export * from './types.js';

const cache = new Map<Variant, Promise<Extensions>>();

/**
 * TipTap and the extension list, both in flight at once. `options.extensions` replaces
 * the variant defaults outright — pass a promise (`import('...').then(...)`) and it
 * loads in parallel with TipTap rather than queueing behind anything.
 */
export function importEditor(variant: Variant, options?: TextEditorOptions) {
	const extensions = Promise.resolve(options?.extensions ?? defaultExtensions(variant));

	return Promise.all([
		import('@tiptap/core'),
		options?.placeholder == null
			? extensions
			: extensions.then((exts) => withPlaceholder(exts, options.placeholder!))
	]);
}

/**
 * A variant's default extensions, loaded lazily and cached. Building on top of them is
 * a `Promise.all` away — everything still loads in parallel:
 *
 * ```ts
 * extensions: Promise.all([
 *   defaultExtensions('rich'),
 *   import('@tiptap/extension-highlight')
 * ]).then(([defaults, { Highlight }]) => [...defaults, Highlight])
 * ```
 */
export function defaultExtensions(variant: Variant): Promise<Extensions> {
	let loading = cache.get(variant);
	if (!loading) {
		loading = importVariant(variant).then((m) => m.extensions);
		cache.set(variant, loading);
	}
	return loading;
}

/** `configure` returns a copy, so the cached defaults are never mutated. */
function withPlaceholder(extensions: Extensions, placeholder: string): Extensions {
	return extensions.map((ext) =>
		ext.name === 'placeholder' ? ext.configure({ placeholder }) : ext
	);
}

function importVariant(variant: Variant) {
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
