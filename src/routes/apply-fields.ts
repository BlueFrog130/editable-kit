import type { EditorContent } from '$lib/components/editor/index.js';
import type { ProseMirrorJSON } from '$lib/types/prosemirror.js';

export function blobToDataURL(blob: Blob): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = () => reject(reader.error);
		reader.readAsDataURL(blob);
	});
}

export async function applyFields(
	target: Record<string, unknown>,
	fields: Record<string, EditorContent>
) {
	for (const [field, value] of Object.entries(fields)) {
		if (value.type === 'text') {
			target[field] = value.content as ProseMirrorJSON;
		} else if (value.type === 'image-src') {
			target[field] = { src: value.src, alt: value.alt };
		} else if (value.type === 'image-blob') {
			target[field] = { src: await blobToDataURL(value.blob), alt: value.alt };
		}
	}
}
