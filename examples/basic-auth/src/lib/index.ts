import { text, paragraphs, image } from 'editable-kit';
import type { ProjectData } from './types';

// place files you want to import through the `$lib` alias in this folder.
export function createDefaultProject(): ProjectData {
	return {
		title: text('Untitled Project'),
		desc: paragraphs('Describe this project...'),
		image: image(
			'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=450&fit=crop',
			{
				alt: 'Project image'
			}
		)
	};
}

export async function upload(file: File) {
	const form = new FormData();
	form.append('file', file);
	const res = await fetch('/api/images', { method: 'POST', body: form });
	if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
	return (await res.json()).url as string;
}
