import type { ProseMirrorJSON } from '$lib/types/prosemirror.js';
import type { ImageState } from '$lib/types.js';

export type HeroData = {
	title: ProseMirrorJSON;
	subtitle: ProseMirrorJSON;
	image: ImageState;
};

export type BlogPostData = {
	id: string;
	createdAt: string;
	title: ProseMirrorJSON;
	body: ProseMirrorJSON;
	image: ImageState;
};

export type NoteCardData = {
	title: ProseMirrorJSON;
	body: ProseMirrorJSON;
	image: ImageState;
};

export type DemoSiteData = {
	hero: HeroData;
	blog: BlogPostData[];
	notes: NoteCardData[];
};
