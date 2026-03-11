import { fail, redirect } from '@sveltejs/kit';
import { AUTH_USERNAME, AUTH_PASSWORD } from '$env/static/private';
import { createSessionToken, COOKIE_NAME } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		redirect(303, '/admin');
	}
};

export const actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const username = formData.get('username');
		const password = formData.get('password');

		if (typeof username !== 'string' || typeof password !== 'string') {
			return fail(400, { error: 'Username and password are required', username: '' });
		}

		if (username !== AUTH_USERNAME || password !== AUTH_PASSWORD) {
			return fail(401, { error: 'Invalid credentials', username });
		}

		const token = createSessionToken(username);

		cookies.set(COOKIE_NAME, token, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production',
			maxAge: 60 * 60 * 24 // 24 hours
		});

		redirect(303, '/admin');
	}
} satisfies Actions;
