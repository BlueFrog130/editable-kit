import type { DemoSiteData, NoteCardData, BlogPostData } from './types.js';
import { text, paragraphs, image } from '$lib/index.js';

export function createDefaultNote(): NoteCardData {
	return {
		title: text('Untitled'),
		body: paragraphs('Start writing here...'),
		image: image(
			'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=500&fit=crop',
			{ alt: 'New note' }
		)
	};
}

export function createDefaultBlogPost(): BlogPostData {
	return {
		id: crypto.randomUUID(),
		createdAt: new Date().toISOString(),
		title: text('Untitled Post'),
		body: paragraphs('Start writing here...'),
		image: image(
			'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=500&fit=crop',
			{ alt: 'New blog post' }
		)
	};
}

export const DEFAULT_DATA: DemoSiteData = {
	hero: {
		title: text('Inline Editing for Svelte 5'),
		subtitle: paragraphs(
			'editable-kit adds inline text, rich text, and image editing to any Svelte app. No admin panels, no CMS \u2014 your users edit content right where it lives. Click \u2018Edit Page\u2019 above to try it.'
		),
		image: image(
			'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=675&fit=crop',
			{ alt: 'Code editor on a screen showing clean, modern code' }
		)
	},

	blog: [
		{
			id: 'b0a1c2d3-e4f5-6789-abcd-ef0123456789',
			createdAt: '2025-12-15T10:00:00.000Z',
			title: text('Getting Started'),
			body: paragraphs(
				'Wrap your page in an Editable.Root to share editing state, then bind fields straight at your data: Editable.Text, Multiline, Rich, and Image each take bind:value and swap static markup for a live editor when editing is active.',
				'The library handles the rest: registering editors, collecting changes on save, and lazy-loading heavy dependencies like TipTap so your initial bundle stays small.'
			),
			image: image(
				'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=600&fit=crop',
				{ alt: 'Developer workspace with multiple monitors' }
			)
		},
		{
			id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
			createdAt: '2025-12-10T08:30:00.000Z',
			title: text('The Context Architecture'),
			body: paragraphs(
				'editable-kit is built on Svelte 5 runes. Editable.Root holds the editing flag, the toolbar state, and the dirty flag; fields write edits straight back through bind:value, so there is no registry and no save payload to unpack.',
				'This means you can nest editable regions freely \u2014 a page with cards, a list of posts, a settings panel \u2014 and each region manages its own state while the root handles orchestration.'
			),
			image: image(
				'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=500&fit=crop',
				{ alt: 'Network of connected nodes representing architecture' }
			)
		},
		{
			id: 'c3d4e5f6-a7b8-9012-cdef-ab3456789012',
			createdAt: '2025-12-05T14:15:00.000Z',
			title: text('Type-Safe Editing'),
			body: paragraphs(
				'Every field stores a ProseMirror document, images included \u2014 an image is simply a document holding one image node, exactly what TipTap keeps internally. The text(), paragraphs(), and image() helpers build each shape for you.',
				'Mistakes are caught at build time, not at runtime. Rename a field and the compiler tells you everywhere it needs updating.'
			),
			image: image(
				'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop',
				{ alt: 'Abstract data visualization with structured patterns' }
			)
		}
	],

	notes: [
		{
			title: text('Plain Text Editing'),
			body: paragraphs(
				'Click-to-edit text fields for headings, labels, and short content. Renders as a simple contenteditable with ProseMirror under the hood for consistent cursor behavior and undo/redo support.'
			),
			image: image(
				'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=500&fit=crop',
				{ alt: 'Pen writing on paper representing text editing' }
			)
		},
		{
			title: text('Rich Text with TipTap'),
			body: paragraphs(
				'Full rich text editing powered by TipTap \u2014 bold, italic, headings, links, lists, and blockquotes. The editor and all extensions are lazy-loaded so they only add to your bundle when editing is active.'
			),
			image: image(
				'https://images.unsplash.com/photo-1542435503-956c469947f6?w=800&h=500&fit=crop',
				{ alt: 'Notebook with formatted text and annotations' }
			)
		},
		{
			title: text('Image Fields'),
			body: paragraphs(
				'An image field is a document holding one image node. Its src is whatever URL you put there — pick a file, upload it your way, and point the node at the result. No picker, no cropper, no format conversion to work around.'
			),
			image: image(
				'https://images.unsplash.com/photo-1554080353-a576cf803bda?w=800&h=500&fit=crop',
				{ alt: 'Camera lens representing image fields' }
			)
		}
	]
};
