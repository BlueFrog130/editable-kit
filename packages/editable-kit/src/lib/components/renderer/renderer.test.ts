import { render, cleanup } from '@testing-library/svelte';
import { afterEach, describe, it, expect, vi } from 'vitest';
import Renderer from './renderer.svelte';
import { markDefaults, nodeDefaults } from './defaults.js';
import type { JSONContent } from '$lib/types/prosemirror.js';

afterEach(() => cleanup());

function html(doc: JSONContent) {
	const { container } = render(Renderer, { doc });
	// Svelte's insertion anchors are comments; they only get in the way here.
	return container.innerHTML.replaceAll('<!---->', '');
}

const para = (text: string, marks?: JSONContent['marks']): JSONContent => ({
	type: 'doc',
	content: [{ type: 'paragraph', content: [{ type: 'text', text, marks }] }]
});

describe('Renderer defaults', () => {
	it('renders the built-in block nodes', () => {
		expect(html(para('hi'))).toContain('<p>hi</p>');
		expect(html({ type: 'doc', content: [{ type: 'heading', attrs: { level: 2 } }] })).toContain(
			'<h2>'
		);
		expect(html({ type: 'doc', content: [{ type: 'hardBreak' }] })).toContain('<br>');
	});

	it('clamps out-of-range heading levels to a real element', () => {
		const out = html({ type: 'doc', content: [{ type: 'heading', attrs: { level: 9 } }] });
		expect(out).toContain('<h6>');
	});

	it('nests marks', () => {
		expect(html(para('x', [{ type: 'bold' }, { type: 'italic' }]))).toContain(
			'<strong><em>x</em></strong>'
		);
	});

	it('emits the stored href verbatim', () => {
		// Documents are the consumer's data; the renderer does not filter them.
		expect(html(para('x', [{ type: 'link', attrs: { href: '/a?b=1&c' } }]))).toContain(
			'href="/a?b=1&amp;c"'
		);
	});

	it('adds rel to links that open in a new tab', () => {
		expect(html(para('x', [{ type: 'link', attrs: { href: '/a', target: '_blank' } }]))).toContain(
			'rel="noopener noreferrer"'
		);
	});

	it('renders no img for an image node with no src', () => {
		expect(html({ type: 'doc', content: [{ type: 'image', attrs: { src: '' } }] })).not.toContain(
			'<img'
		);
	});

	it('renders children of an unknown node and warns once', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const doc: JSONContent = {
			type: 'doc',
			content: [{ type: 'callout', content: [{ type: 'paragraph' }] }]
		};

		expect(html(doc)).toContain('<p>');
		expect(html(doc)).toContain('<p>');
		expect(warn).toHaveBeenCalledTimes(1);
		warn.mockRestore();
	});

	it('is extensible by table entry', () => {
		nodeDefaults.callout = () => ({ tag: 'aside', attrs: { 'data-kind': 'callout' } });
		markDefaults.highlight = () => ({ tag: 'mark' });
		try {
			const out = html({
				type: 'doc',
				content: [
					{
						type: 'callout',
						content: [{ type: 'text', text: 'note', marks: [{ type: 'highlight' }] }]
					}
				]
			});
			expect(out).toContain('<aside data-kind="callout"><mark>note</mark></aside>');
		} finally {
			delete nodeDefaults.callout;
			delete markDefaults.highlight;
		}
	});
});
