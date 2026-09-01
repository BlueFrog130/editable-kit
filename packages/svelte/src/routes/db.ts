import type { BlogPostData, DemoSiteData } from '@routes/types.js';
import { DEFAULT_DATA } from '@routes/defaults.js';

const DB_NAME = 'editable-demo';
const STORE_NAME = 'records';
const DB_VERSION = 3;
const DATA_KEY = 'site';

function openDB(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);
		request.onupgradeneeded = () => {
			const db = request.result;
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				db.createObjectStore(STORE_NAME);
			}
		};
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}

async function seed(db: IDBDatabase): Promise<void> {
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, 'readwrite');
		tx.objectStore(STORE_NAME).put(structuredClone(DEFAULT_DATA), DATA_KEY);
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
}

export async function load(): Promise<DemoSiteData> {
	const db = await openDB();
	try {
		const record = await new Promise<DemoSiteData | undefined>((resolve, reject) => {
			const tx = db.transaction(STORE_NAME, 'readonly');
			const request = tx.objectStore(STORE_NAME).get(DATA_KEY);
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
		if (record) return { ...structuredClone(DEFAULT_DATA), ...record };
		await seed(db);
		return structuredClone(DEFAULT_DATA);
	} finally {
		db.close();
	}
}

export async function save(data: DemoSiteData): Promise<void> {
	const db = await openDB();
	try {
		return new Promise((resolve, reject) => {
			const tx = db.transaction(STORE_NAME, 'readwrite');
			tx.objectStore(STORE_NAME).put(data, DATA_KEY);
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error);
		});
	} finally {
		db.close();
	}
}

export async function reset(): Promise<DemoSiteData> {
	const db = await openDB();
	try {
		await new Promise<void>((resolve, reject) => {
			const tx = db.transaction(STORE_NAME, 'readwrite');
			tx.objectStore(STORE_NAME).delete(DATA_KEY);
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error);
		});
		await seed(db);
		return structuredClone(DEFAULT_DATA);
	} finally {
		db.close();
	}
}

export async function loadBlogPost(id: string): Promise<BlogPostData | undefined> {
	const data = await load();
	return data.blog.find((p) => p.id === id);
}

export async function saveBlogPost(post: BlogPostData): Promise<void> {
	const data = await load();
	const index = data.blog.findIndex((p) => p.id === post.id);
	if (index >= 0) {
		data.blog[index] = post;
	} else {
		data.blog.unshift(post);
	}
	await save(data);
}

export async function deleteBlogPost(id: string): Promise<void> {
	const data = await load();
	data.blog = data.blog.filter((p) => p.id !== id);
	await save(data);
}
