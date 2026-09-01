import { render, cleanup } from '@testing-library/svelte';
import { afterEach, describe, it, expect, vi } from 'vitest';
import Renderer, { mergeOverrides } from './renderer.svelte';
import PlainText from './plain-text.svelte';
import type { SomeNodeSnippet } from './types.js';
import { markDefaults, nodeDefaults } from '@editable-kit/core';
import type { JSONContent } from '@editable-kit/core';

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

describe('Renderer defaults, remaining entries', () => {
	const block = (node: JSONContent) => html({ type: 'doc', content: [node] });

	it('renders the list, quote and rule nodes', () => {
		expect(
			block({
				type: 'bulletList',
				content: [{ type: 'listItem', content: [{ type: 'paragraph' }] }]
			})
		).toContain('<ul><li><p></p></li></ul>');
		expect(block({ type: 'blockquote', content: [{ type: 'paragraph' }] })).toContain(
			'<blockquote><p></p></blockquote>'
		);
		expect(block({ type: 'horizontalRule' })).toContain('<hr>');
	});

	it('carries an ordered list start and a code block language', () => {
		expect(block({ type: 'orderedList', attrs: { start: 3 } })).toContain('start="3"');
		expect(block({ type: 'codeBlock', attrs: { language: 'ts' } })).toContain('data-language="ts"');
	});

	it('omits attributes the node did not set', () => {
		expect(block({ type: 'orderedList' })).toBe('<ol></ol>');
		expect(block({ type: 'codeBlock' })).toBe('<pre></pre>');
	});

	it('renders the remaining marks', () => {
		expect(html(para('x', [{ type: 'underline' }]))).toContain('<u>x</u>');
		expect(html(para('x', [{ type: 'strike' }]))).toContain('<s>x</s>');
		expect(html(para('x', [{ type: 'code' }]))).toContain('<code>x</code>');
	});

	it('defaults a heading with no attrs to h1', () => {
		expect(block({ type: 'heading' })).toContain('<h1>');
		expect(block({ type: 'heading', attrs: { level: 0 } })).toContain('<h1>');
		expect(block({ type: 'heading', attrs: { level: 'oops' } })).toContain('<h1>');
	});

	it('gives an image an empty alt and lazy loading, and drops absent dimensions', () => {
		const out = block({ type: 'image', attrs: { src: 'a.png' } });
		expect(out).toContain('alt=""');
		expect(out).toContain('loading="lazy"');
		expect(out).not.toContain('width');
	});

	it('keeps an explicit link rel instead of deriving one', () => {
		expect(
			html(para('x', [{ type: 'link', attrs: { href: '/a', target: '_blank', rel: 'me' } }]))
		).toContain('rel="me"');
	});

	it('renders a document with no content as nothing', () => {
		expect(html({ type: 'doc' })).toBe('');
		expect(html({ type: 'doc', content: [] })).toBe('');
	});
});

describe('mergeOverrides', () => {
	const a = (() => {}) as unknown as SomeNodeSnippet;
	const b = (() => {}) as unknown as SomeNodeSnippet;

	it('returns the other side when one is missing', () => {
		const own = { nodes: { paragraph: a } };
		expect(mergeOverrides(undefined, own)).toBe(own);
		expect(mergeOverrides(own, undefined)).toBe(own);
		expect(mergeOverrides(undefined, undefined)).toBeUndefined();
	});

	// A field replacing one snippet must not discard the set Root configured.
	it('merges per type, with the later side winning', () => {
		const merged = mergeOverrides(
			{ nodes: { paragraph: a, heading: a }, marks: { bold: a } },
			{ nodes: { heading: b } }
		);

		expect(merged?.nodes).toEqual({ paragraph: a, heading: b });
		expect(merged?.marks).toEqual({ bold: a });
	});

	it('does not mutate either side', () => {
		const base = { nodes: { paragraph: a } };
		mergeOverrides(base, { nodes: { paragraph: b } });
		expect(base.nodes.paragraph).toBe(a);
	});
});

describe('PlainText', () => {
	function plain(doc: JSONContent | undefined, separator?: string) {
		const { container } = render(PlainText, separator === undefined ? { doc } : { doc, separator });
		return container.textContent;
	}

	it('flattens a document to its text', () => {
		expect(plain(para('hello'))).toBe('hello');
	});

	it('separates siblings so paragraphs do not run together', () => {
		const doc: JSONContent = {
			type: 'doc',
			content: [
				{ type: 'paragraph', content: [{ type: 'text', text: 'one' }] },
				{ type: 'paragraph', content: [{ type: 'text', text: 'two' }] }
			]
		};

		expect(plain(doc)).toBe('one two');
		expect(plain(doc, ' — ')).toBe('one — two');
	});

	it('descends through nested nodes', () => {
		expect(
			plain({
				type: 'doc',
				content: [
					{
						type: 'bulletList',
						content: [
							{
								type: 'listItem',
								content: [{ type: 'paragraph', content: [{ type: 'text', text: 'a' }] }]
							}
						]
					}
				]
			})
		).toBe('a');
	});

	it('renders nothing for an empty or missing document', () => {
		expect(plain(undefined)).toBe('');
		expect(plain({ type: 'doc' })).toBe('');
	});
});
