import type { ProseMirrorJSON } from '@editable-kit/svelte';
import * as v from 'valibot';

export type ProjectData = {
	title: ProseMirrorJSON;
	desc: ProseMirrorJSON;
	image: ProseMirrorJSON;
};

export type Data = {
	// Hero
	name: ProseMirrorJSON;
	tagline: ProseMirrorJSON;
	avatar: ProseMirrorJSON;
	bio: ProseMirrorJSON;

	// About
	about: ProseMirrorJSON;

	// Featured Work
	projects: ProjectData[];

	// Footer
	footer: ProseMirrorJSON;
};

export const JSONSchema = v.record(v.string(), v.any());
export const projectSchema = v.object({
	title: JSONSchema,
	desc: JSONSchema,
	image: JSONSchema
});

export const dataSchema = v.object({
	// Hero
	name: JSONSchema,
	tagline: JSONSchema,
	avatar: JSONSchema,
	bio: JSONSchema,

	// About
	about: JSONSchema,

	// Featured Work
	projects: v.array(projectSchema),

	// Footer
	footer: JSONSchema
});
