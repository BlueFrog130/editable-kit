import type { ProjectData } from './types';

// place files you want to import through the `$lib` alias in this folder.
export function createDefaultProject(): ProjectData {
	return {
		title: {
			type: 'doc',
			content: [{ type: 'text', text: 'Untitled Project' }]
		},
		desc: {
			type: 'doc',
			content: [
				{
					type: 'paragraph',
					content: [{ type: 'text', text: 'Describe this project...' }]
				}
			]
		},
		image: {
			src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=450&fit=crop',
			alt: 'Project image'
		}
	};
}
