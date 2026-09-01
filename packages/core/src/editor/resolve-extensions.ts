import type { Extensions } from '@tiptap/core';
import type { TextEditorOptions } from './types.js';

export async function resolveExtensions(
	defaults: Extensions,
	options?: TextEditorOptions
): Promise<Extensions> {
	if (!options) return defaults;

	let result = defaults;

	if (options.placeholder != null) {
		result = result.map((ext) => {
			if (ext.name === 'placeholder') {
				return ext.configure({ placeholder: options.placeholder });
			}
			return ext;
		});
	}

	if (options.extensions) {
		result = await options.extensions(result);
	}

	return result;
}
