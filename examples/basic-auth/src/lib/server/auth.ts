import { AUTH_SECRET } from '$env/static/private';
import crypto from 'node:crypto';

const COOKIE_NAME = 'session';
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

interface SessionPayload {
	user: string;
	exp: number;
}

function sign(payload: string): string {
	return crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('base64url');
}

export function createSessionToken(username: string): string {
	const payload: SessionPayload = {
		user: username,
		exp: Date.now() + SESSION_DURATION_MS
	};
	const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
	const signature = sign(encoded);
	return `${encoded}.${signature}`;
}

export function verifySessionToken(token: string): string | null {
	const [encoded, signature] = token.split('.');
	if (!encoded || !signature) return null;

	const expectedSignature = sign(encoded);
	const sigBuf = Buffer.from(signature);
	const expectedBuf = Buffer.from(expectedSignature);
	if (sigBuf.length !== expectedBuf.length) return null;
	if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;

	try {
		const payload: SessionPayload = JSON.parse(Buffer.from(encoded, 'base64url').toString());
		if (payload.exp < Date.now()) return null;
		return payload.user;
	} catch {
		return null;
	}
}

export { COOKIE_NAME };
