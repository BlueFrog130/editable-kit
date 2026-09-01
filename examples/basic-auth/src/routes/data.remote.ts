import { command, getRequestEvent, query } from '$app/server';
import { verifySessionToken, COOKIE_NAME } from '$lib/server/auth';
import { load, save } from '$lib/server/db';
import { dataSchema, type Data } from '$lib/types';

export const getData = query(async () => load());

export const updateData = command(dataSchema, async (data) => {
	const { cookies } = getRequestEvent();

	const token = cookies.get(COOKIE_NAME);
	if (!token || !verifySessionToken(token)) {
		throw new Error('Unauthorized');
	}

	// Images are uploaded via /api/images when picked, so every field is already a URL.
	// Every field is a ProseMirror document now, images included — nothing to remap.
	await save(data as Data);

	await getData().refresh();
});
