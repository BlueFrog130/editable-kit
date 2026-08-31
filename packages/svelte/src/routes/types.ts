import type { ProseMirrorJSON } from '$lib/index.js';

export type HeroData = {
	title: ProseMirrorJSON;
	subtitle: ProseMirrorJSON;
	image: ProseMirrorJSON;
};

export type BlogPostData = {
	id: string;
	createdAt: string;
	title: ProseMirrorJSON;
	body: ProseMirrorJSON;
	image: ProseMirrorJSON;
};

export type NoteCardData = {
	title: ProseMirrorJSON;
	body: ProseMirrorJSON;
	image: ProseMirrorJSON;
};

export type DemoSiteData = {
	hero: HeroData;
	blog: BlogPostData[];
	notes: NoteCardData[];
};
