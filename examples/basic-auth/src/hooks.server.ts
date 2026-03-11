import { type Handle } from '@sveltejs/kit';
import { verifySessionToken, COOKIE_NAME } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get(COOKIE_NAME);
	event.locals.user = token ? verifySessionToken(token) : null;

	return resolve(event);
};
