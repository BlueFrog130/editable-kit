import { command, getRequestEvent, query } from '$app/server';
import { verifySessionToken, COOKIE_NAME } from '$lib/server/auth';
import { load, save } from '$lib/server/db';
import { saveImage } from '$lib/server/images';
import { dataSchema, ImageSchema, type Data, type ProjectData } from '$lib/types';
import type { ProseMirrorJSON } from 'editable-kit';
import type { InferInput } from 'valibot';

export const getData = query(async () => {
	const data = await load();
	console.log(data);
	return data;
});

export const updateData = command(dataSchema, async (data) => {
	const { cookies } = getRequestEvent();

	const token = cookies.get(COOKIE_NAME);
	if (!token || !verifySessionToken(token)) {
		throw new Error('Unauthorized');
	}

	await save({
		...(data as Data),
		avatar: await handleImg(data.avatar),
		projects: await Promise.all(
			data.projects.map(async (project) => ({
				image: await handleImg(project.image),
				title: project.title as ProseMirrorJSON,
				desc: project.desc as ProseMirrorJSON
			}))
		)
	});

	await getData().refresh();
});

async function handleImg(img: InferInput<typeof ImageSchema>) {
	if ('image' in img) {
		return {
			src: await saveImage(img.image),
			alt: img.alt
		};
	}

	return {
		src: img.src,
		alt: img.alt
	};
}
