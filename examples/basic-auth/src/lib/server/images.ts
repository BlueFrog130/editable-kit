import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const CACHE_DIR = path.join('node_modules', '.cache', 'editable-kit', 'images');

async function ensureDir() {
	await fs.mkdir(CACHE_DIR, { recursive: true });
}

export async function saveImage(buffer: ArrayBuffer): Promise<string> {
	await ensureDir();
	const filename = `${crypto.randomUUID()}.webp`;
	await fs.writeFile(path.join(CACHE_DIR, filename), Buffer.from(buffer));
	return `/api/images/${filename}`;
}

export async function readImage(filename: string): Promise<Buffer | null> {
	try {
		return await fs.readFile(path.join(CACHE_DIR, filename));
	} catch {
		return null;
	}
}
