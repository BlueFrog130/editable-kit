import type { DemoSiteData, NoteCardData, BlogPostData } from './types.js';
import type { ProseMirrorJSON } from '$lib/types/prosemirror.js';

/** Helper: inline text (no paragraph wrapper) — used for text() fields */
export function text(str: string): ProseMirrorJSON {
	return { type: 'doc', content: [{ type: 'text', text: str }] };
}

/** Helper: paragraph-wrapped text — used for multiline() and rich() fields */
export function paragraph(str: string): ProseMirrorJSON {
	return {
		type: 'doc',
		content: [{ type: 'paragraph', content: [{ type: 'text', text: str }] }]
	};
}

/** Helper: multiple paragraphs */
function paragraphs(...strs: string[]): ProseMirrorJSON {
	return {
		type: 'doc',
		content: strs.map((s) => ({
			type: 'paragraph' as const,
			content: [{ type: 'text' as const, text: s }]
		}))
	};
}

export function createDefaultNote(): NoteCardData {
	return {
		title: text('Untitled'),
		body: paragraph('Start writing here...'),
		image: {
			src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=500&fit=crop',
			alt: 'New note'
		}
	};
}

export function createDefaultBlogPost(): BlogPostData {
	return {
		id: crypto.randomUUID(),
		createdAt: new Date().toISOString(),
		title: text('Untitled Post'),
		body: paragraph('Start writing here...'),
		image: {
			src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=500&fit=crop',
			alt: 'New blog post'
		}
	};
}

export const DEFAULT_DATA: DemoSiteData = {
	hero: {
		title: text('Inline Editing for Svelte 5'),
		subtitle: paragraph(
			'editable-kit adds inline text, rich text, and image editing to any Svelte app. No admin panels, no CMS \u2014 your users edit content right where it lives. Click \u2018Edit Page\u2019 above to try it.'
		),
		image: {
			src: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=675&fit=crop',
			alt: 'Code editor on a screen showing clean, modern code'
		}
	},

	blog: [
		{
			id: 'b0a1c2d3-e4f5-6789-abcd-ef0123456789',
			createdAt: '2025-12-15T10:00:00.000Z',
			title: text('Getting Started'),
			body: paragraphs(
				'Wrap your page in an Editable.Root to enable editing, then use Editable.Data to mark regions of content. Each region exposes snippet helpers \u2014 text(), multiline(), rich(), and image() \u2014 that replace static markup with live editors when editing is active.',
				'The library handles the rest: registering editors, collecting changes on save, and lazy-loading heavy dependencies like TipTap so your initial bundle stays small.'
			),
			image: {
				src: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=600&fit=crop',
				alt: 'Developer workspace with multiple monitors'
			}
		},
		{
			id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
			createdAt: '2025-12-10T08:30:00.000Z',
			title: text('The Context Architecture'),
			body: paragraphs(
				'editable-kit uses a context hierarchy built on Svelte 5 runes. Editable.Root provides global editing state, while each Editable.Data region tracks its own editors in a SvelteMap and coordinates saves through the root context.',
				'This means you can nest editable regions freely \u2014 a page with cards, a list of posts, a settings panel \u2014 and each region manages its own state while the root handles orchestration.'
			),
			image: {
				src: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=500&fit=crop',
				alt: 'Network of connected nodes representing architecture'
			}
		},
		{
			id: 'c3d4e5f6-a7b8-9012-cdef-ab3456789012',
			createdAt: '2025-12-05T14:15:00.000Z',
			title: text('Type-Safe Editing'),
			body: paragraphs(
				'Editable.Data is generic over your data shape. When you pass data of type T, the snippet helpers are constrained to only accept valid property names \u2014 text() and multiline() for ProseMirrorJSON fields, image() for ImageState fields.',
				'Mistakes are caught at build time, not at runtime. Rename a field and the compiler tells you everywhere it needs updating.'
			),
			image: {
				src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop',
				alt: 'Abstract data visualization with structured patterns'
			}
		}
	],

	notes: [
		{
			title: text('Plain Text Editing'),
			body: paragraph(
				'Click-to-edit text fields for headings, labels, and short content. Renders as a simple contenteditable with ProseMirror under the hood for consistent cursor behavior and undo/redo support.'
			),
			image: {
				src: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=500&fit=crop',
				alt: 'Pen writing on paper representing text editing'
			}
		},
		{
			title: text('Rich Text with TipTap'),
			body: paragraph(
				'Full rich text editing powered by TipTap \u2014 bold, italic, headings, links, lists, and blockquotes. The editor and all extensions are lazy-loaded so they only add to your bundle when editing is active.'
			),
			image: {
				src: 'https://images.unsplash.com/photo-1542435503-956c469947f6?w=800&h=500&fit=crop',
				alt: 'Notebook with formatted text and annotations'
			}
		},
		{
			title: text('Image Cropping'),
			body: paragraph(
				'Built-in image editor with pan, zoom, and aspect-ratio cropping. Images are exported as optimized WebP via OffscreenCanvas, keeping file sizes small without sacrificing quality.'
			),
			image: {
				src: 'https://images.unsplash.com/photo-1554080353-a576cf803bda?w=800&h=500&fit=crop',
				alt: 'Camera lens representing image editing and cropping'
			}
		}
	]
};
