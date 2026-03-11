import type { ProseMirrorJSON, ImageState } from 'editable-kit';
import * as v from 'valibot';

export type ProjectData = {
	title: ProseMirrorJSON;
	desc: ProseMirrorJSON;
	image: ImageState;
};

export type Data = {
	// Hero
	name: ProseMirrorJSON;
	tagline: ProseMirrorJSON;
	avatar: ImageState;
	bio: ProseMirrorJSON;

	// About
	about: ProseMirrorJSON;

	// Featured Work
	projects: ProjectData[];

	// Footer
	footer: ProseMirrorJSON;
};

export const JSONSchema = v.record(v.string(), v.any());
export const ImageSchema = v.union([
	v.object({
		image: v.instance(ArrayBuffer),
		alt: v.string()
	}),
	v.object({
		src: v.string(),
		alt: v.string()
	})
]);

export const projectSchema = v.object({
	title: JSONSchema,
	desc: JSONSchema,
	image: ImageSchema
});

export const dataSchema = v.object({
	// Hero
	name: JSONSchema,
	tagline: JSONSchema,
	avatar: ImageSchema,
	bio: JSONSchema,

	// About
	about: JSONSchema,

	// Featured Work
	projects: v.array(projectSchema),

	// Footer
	footer: JSONSchema
});
