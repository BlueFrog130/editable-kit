import { image, paragraphs, text } from '@editable-kit/svelte';
import type { ProseMirrorJSON } from '@editable-kit/svelte';

/** The single content record this example edits. */
export type HomeContent = {
	title: ProseMirrorJSON; // text()
	body: ProseMirrorJSON; // paragraphs()
	hero: ProseMirrorJSON; // image()
};

export const HOME_KEY = 'home';

export const DEFAULT_HOME: HomeContent = {
	title: text('Edit me on the admin page'),
	body: paragraphs(
		'This paragraph is stored as ProseMirror JSON in D1 and rendered without TipTap.'
	),
	hero: image('https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=675&fit=crop', {
		alt: 'Placeholder hero image'
	})
};
