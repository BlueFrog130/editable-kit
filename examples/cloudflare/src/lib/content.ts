import { text, paragraphs, image, type ProseMirrorJSON } from '@editable-kit/svelte';
import type { D1Database } from '@cloudflare/workers-types';

export type Content = {
	title: ProseMirrorJSON;
	tagline: ProseMirrorJSON;
	hero: ProseMirrorJSON;
	body: ProseMirrorJSON;
};

const KEY = 'page';

export function defaults(): Content {
	return {
		title: text('editable-kit on Cloudflare'),
		tagline: paragraphs('Edit this page in place. Text lands in D1, images in R2.'),
		hero: image(
			'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=500&fit=crop',
			{
				alt: 'Earth at night'
			}
		),
		body: paragraphs(
			'Every field on this page is a ProseMirror document. They are stored together as one JSON row in D1.',
			'Sign in with the admin token to edit. Uploaded images go to R2, content-addressed, and are served back through /api/assets/<key>.'
		)
	};
}

export async function load(db: D1Database): Promise<Content> {
	const row = await db.prepare('select json from content where key = ?').bind(KEY).first<{
		json: string;
	}>();
	return row ? (JSON.parse(row.json) as Content) : defaults();
}

export async function save(db: D1Database, content: Content) {
	await db
		.prepare(
			`insert into content (key, json) values (?, ?)
			 on conflict(key) do update set json = excluded.json, updated_at = unixepoch()`
		)
		.bind(KEY, JSON.stringify(content))
		.run();
}

/** Constant-time-ish bearer check. Writes are the trust boundary — never skip it. */
export function authorized(request: Request, token: string | undefined) {
	return !!token && request.headers.get('authorization') === `Bearer ${token}`;
}
