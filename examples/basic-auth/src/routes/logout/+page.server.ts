import { redirect } from '@sveltejs/kit';
import { COOKIE_NAME } from '$lib/server/auth';
import type { Actions } from './$types';

export const actions = {
	default: async ({ cookies }) => {
		cookies.delete(COOKIE_NAME, { path: '/' });
		redirect(303, '/');
	}
} satisfies Actions;
