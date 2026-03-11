import { render, screen, cleanup, waitFor, fireEvent } from '@testing-library/svelte';
import { afterEach, describe, it, expect, vi } from 'vitest';
import TestComponent from './editable-data.test.svelte';
import type { ProseMirrorJSON } from '$lib/types/prosemirror.js';

afterEach(() => cleanup());

describe('Editable.Data', () => {
	describe('read-only mode (editing=false)', () => {
		it('renders text content via Renderer', () => {
			render(TestComponent, { editing: false, variant: 'text-only' });

			const field = screen.getByTestId('text-field');
			expect(field.textContent).toContain('Hello World');
		});

		it('renders multiline content via Renderer', () => {
			render(TestComponent, { editing: false, variant: 'multiline' });

			const field = screen.getByTestId('multiline-field');
			expect(field.textContent).toContain('Body text');
		});

		it('renders rich content via Renderer', () => {
			render(TestComponent, { editing: false, variant: 'rich' });

			const field = screen.getByTestId('rich-field');
			expect(field.textContent).toContain('Body text');
		});

		it('renders multiple fields', () => {
			render(TestComponent, { editing: false, variant: 'multi-field' });

			expect(screen.getByTestId('title-field').textContent).toContain('Hello World');
			expect(screen.getByTestId('body-field').textContent).toContain('Body text');
		});

		it('renders text content as paragraphs in read-only mode', () => {
			const data = {
				title: {
					type: 'doc' as const,
					content: [
						{
							type: 'paragraph' as const,
							content: [{ type: 'text' as const, text: 'Hello World' }]
						}
					]
				},
				body: { type: 'doc' as const, content: [] }
			};
			render(TestComponent, { editing: false, variant: 'text-only', data });

			const field = screen.getByTestId('text-field');
			const paragraph = field.querySelector('p');
			expect(paragraph).not.toBeNull();
			expect(paragraph!.textContent).toBe('Hello World');
		});

		it('renders image in read-only mode', () => {
			render(TestComponent, { editing: false, variant: 'with-image' });

			const imageField = screen.getByTestId('image-field');
			const img = imageField.querySelector('img[data-ek-image]');
			expect(img).not.toBeNull();
			expect(img!.getAttribute('src')).toBe('test.jpg');
			expect(img!.getAttribute('alt')).toBe('Test image');
		});

		it('renders text alongside image', () => {
			render(TestComponent, { editing: false, variant: 'with-image' });

			expect(screen.getByTestId('title-field').textContent).toContain('Title');
			const img = screen.getByTestId('image-field').querySelector('img');
			expect(img).not.toBeNull();
		});
	});

	describe('rich text rendering', () => {
		it('renders bold text with <strong> tags', () => {
			const data = {
				title: { type: 'doc' as const, content: [] },
				body: {
					type: 'doc' as const,
					content: [
						{
							type: 'paragraph' as const,
							content: [
								{
									type: 'text' as const,
									text: 'bold text',
									marks: [{ type: 'bold' as const }]
								}
							]
						}
					]
				}
			};
			render(TestComponent, { editing: false, variant: 'rich', data });

			const field = screen.getByTestId('rich-field');
			const strong = field.querySelector('strong');
			expect(strong).not.toBeNull();
			expect(strong!.textContent).toBe('bold text');
		});

		it('renders italic text with <em> tags', () => {
			const data = {
				title: { type: 'doc' as const, content: [] },
				body: {
					type: 'doc' as const,
					content: [
						{
							type: 'paragraph' as const,
							content: [
								{
									type: 'text' as const,
									text: 'italic text',
									marks: [{ type: 'italic' as const }]
								}
							]
						}
					]
				}
			};
			render(TestComponent, { editing: false, variant: 'rich', data });

			const field = screen.getByTestId('rich-field');
			const em = field.querySelector('em');
			expect(em).not.toBeNull();
			expect(em!.textContent).toBe('italic text');
		});

		it('renders links with <a> tags', () => {
			const data = {
				title: { type: 'doc' as const, content: [] },
				body: {
					type: 'doc' as const,
					content: [
						{
							type: 'paragraph' as const,
							content: [
								{
									type: 'text' as const,
									text: 'click here',
									marks: [
										{
											type: 'link' as const,
											attrs: { href: 'https://example.com' }
										}
									]
								}
							]
						}
					]
				}
			};
			render(TestComponent, { editing: false, variant: 'rich', data });

			const field = screen.getByTestId('rich-field');
			const link = field.querySelector('a');
			expect(link).not.toBeNull();
			expect(link!.textContent).toBe('click here');
			expect(link!.getAttribute('href')).toBe('https://example.com');
		});

		it('renders headings correctly', () => {
			const data = {
				title: {
					type: 'doc' as const,
					content: [
						{
							type: 'heading' as const,
							attrs: { level: 2 as const },
							content: [{ type: 'text' as const, text: 'Section Title' }]
						}
					]
				},
				body: { type: 'doc' as const, content: [] }
			};
			render(TestComponent, {
				editing: false,
				variant: 'text-only',
				data
			});

			const field = screen.getByTestId('text-field');
			const heading = field.querySelector('h2');
			expect(heading).not.toBeNull();
			expect(heading!.textContent).toBe('Section Title');
		});

		it('renders lists correctly', () => {
			const data = {
				title: { type: 'doc' as const, content: [] },
				body: {
					type: 'doc' as const,
					content: [
						{
							type: 'bulletList' as const,
							content: [
								{
									type: 'listItem' as const,
									content: [
										{
											type: 'paragraph' as const,
											content: [{ type: 'text' as const, text: 'Item A' }]
										}
									]
								},
								{
									type: 'listItem' as const,
									content: [
										{
											type: 'paragraph' as const,
											content: [{ type: 'text' as const, text: 'Item B' }]
										}
									]
								}
							]
						}
					]
				}
			};
			render(TestComponent, { editing: false, variant: 'multiline', data });

			const field = screen.getByTestId('multiline-field');
			const ul = field.querySelector('ul');
			expect(ul).not.toBeNull();
			const items = field.querySelectorAll('li');
			expect(items).toHaveLength(2);
			expect(items[0].textContent).toContain('Item A');
			expect(items[1].textContent).toContain('Item B');
		});

		it('renders nested bold+italic marks', () => {
			const data = {
				title: { type: 'doc' as const, content: [] },
				body: {
					type: 'doc' as const,
					content: [
						{
							type: 'paragraph' as const,
							content: [
								{
									type: 'text' as const,
									text: 'styled',
									marks: [{ type: 'bold' as const }, { type: 'italic' as const }]
								}
							]
						}
					]
				}
			};
			render(TestComponent, { editing: false, variant: 'rich', data });

			const field = screen.getByTestId('rich-field');
			const strong = field.querySelector('strong');
			expect(strong).not.toBeNull();
			const em = strong!.querySelector('em');
			expect(em).not.toBeNull();
			expect(em!.textContent).toBe('styled');
		});

		it('renders empty doc without errors', () => {
			const data = {
				title: { type: 'doc' as const },
				body: { type: 'doc' as const }
			};
			render(TestComponent, { editing: false, variant: 'multi-field', data });

			expect(screen.getByTestId('title-field')).toBeDefined();
			expect(screen.getByTestId('body-field')).toBeDefined();
		});
	});

	describe('context integration', () => {
		it('passes editing state from Root to children', () => {
			render(TestComponent, { editing: false });

			const rootState = screen.getByTestId('root-state');
			expect(rootState.getAttribute('data-editing')).toBe('false');
		});

		it('reflects editing=true in root state', () => {
			render(TestComponent, { editing: true });

			const rootState = screen.getByTestId('root-state');
			expect(rootState.getAttribute('data-editing')).toBe('true');
		});
	});

	describe('saving functionality', () => {
		it('saves text editor data on save click', async () => {
			const onsave = vi.fn();

			render(TestComponent, { editing: true, variant: 'text-only', onsave });

			// Wait for TipTap editor to load (async import)
			await waitFor(() => {
				expect(document.querySelector('[data-ek-editor]')).not.toBeNull();
			});

			await fireEvent.click(screen.getByTestId('save-btn'));

			await waitFor(() => {
				expect(onsave).toHaveBeenCalledOnce();
			});

			const saveData = onsave.mock.calls[0][0];
			expect(saveData).toHaveProperty('title');
			expect(saveData.title.type).toBe('text');
			expect(saveData.title.content).toHaveProperty('type', 'doc');
		});

		it('saves multiline editor data on save click', async () => {
			const onsave = vi.fn();

			render(TestComponent, { editing: true, variant: 'multiline', onsave });

			await waitFor(() => {
				expect(document.querySelector('[data-ek-editor]')).not.toBeNull();
			});

			await fireEvent.click(screen.getByTestId('save-btn'));

			await waitFor(() => {
				expect(onsave).toHaveBeenCalledOnce();
			});

			const saveData = onsave.mock.calls[0][0];
			expect(saveData).toHaveProperty('body');
			expect(saveData.body.type).toBe('text');
			expect(saveData.body.content).toHaveProperty('type', 'doc');
		});

		it('saves rich editor data on save click', async () => {
			const onsave = vi.fn();

			render(TestComponent, { editing: true, variant: 'rich', onsave });

			await waitFor(() => {
				expect(document.querySelector('[data-ek-editor]')).not.toBeNull();
			});

			await fireEvent.click(screen.getByTestId('save-btn'));

			await waitFor(() => {
				expect(onsave).toHaveBeenCalledOnce();
			});

			const saveData = onsave.mock.calls[0][0];
			expect(saveData).toHaveProperty('body');
			expect(saveData.body.type).toBe('text');
			expect(saveData.body.content).toHaveProperty('type', 'doc');
		});

		it('saves multiple fields on save click', async () => {
			const onsave = vi.fn();

			render(TestComponent, { editing: true, variant: 'multi-field', onsave });

			await waitFor(() => {
				const editors = document.querySelectorAll('[data-ek-editor]');
				expect(editors.length).toBe(2);
			});

			await fireEvent.click(screen.getByTestId('save-btn'));

			await waitFor(() => {
				expect(onsave).toHaveBeenCalledOnce();
			});

			const saveData = onsave.mock.calls[0][0];
			expect(saveData).toHaveProperty('title');
			expect(saveData).toHaveProperty('body');
			expect(saveData.title.type).toBe('text');
			expect(saveData.body.type).toBe('text');
		});

		it('root onsave receives Map with correct key', async () => {
			const onrootsave = vi.fn();

			render(TestComponent, { editing: true, variant: 'text-only', onrootsave });

			await waitFor(() => {
				expect(document.querySelector('[data-ek-editor]')).not.toBeNull();
			});

			await fireEvent.click(screen.getByTestId('save-btn'));

			await waitFor(() => {
				expect(onrootsave).toHaveBeenCalledOnce();
			});

			const rootData = onrootsave.mock.calls[0][0];
			expect(rootData).toBeInstanceOf(Map);
			expect(rootData.has('blog')).toBe(true);
		});

		it('both onsave and onrootsave are called during save', async () => {
			const onsave = vi.fn();
			const onrootsave = vi.fn();

			render(TestComponent, { editing: true, variant: 'text-only', onsave, onrootsave });

			await waitFor(() => {
				expect(document.querySelector('[data-ek-editor]')).not.toBeNull();
			});

			await fireEvent.click(screen.getByTestId('save-btn'));

			await waitFor(() => {
				expect(onsave).toHaveBeenCalledOnce();
				expect(onrootsave).toHaveBeenCalledOnce();
			});
		});

		it('saved content preserves initial text', async () => {
			const onsave = vi.fn();

			// Use multiline variant because the plain variant schema doesn't include
			// paragraph nodes, so it can't parse paragraph-based ProseMirrorJSON
			render(TestComponent, { editing: true, variant: 'multiline', onsave });

			await waitFor(() => {
				expect(document.querySelector('[data-ek-editor]')).not.toBeNull();
			});

			await fireEvent.click(screen.getByTestId('save-btn'));

			await waitFor(() => {
				expect(onsave).toHaveBeenCalledOnce();
			});

			const doc = onsave.mock.calls[0][0].body.content;
			expect(doc.type).toBe('doc');
			// The multiline editor preserves paragraph content
			expect(JSON.stringify(doc)).toContain('Body text');
		});
	});

	describe('data reactivity', () => {
		it('renders updated data when props change', async () => {
			const initialData = {
				title: {
					type: 'doc' as const,
					content: [
						{ type: 'paragraph' as const, content: [{ type: 'text' as const, text: 'Initial' }] }
					]
				},
				body: { type: 'doc' as const, content: [] }
			};

			const { rerender } = render(TestComponent, {
				editing: false,
				variant: 'text-only',
				data: initialData
			});

			expect(screen.getByTestId('text-field').textContent).toContain('Initial');

			const updatedData = {
				title: {
					type: 'doc' as const,
					content: [
						{ type: 'paragraph' as const, content: [{ type: 'text' as const, text: 'Updated' }] }
					]
				},
				body: { type: 'doc' as const, content: [] }
			};

			await rerender({ data: updatedData });
			expect(screen.getByTestId('text-field').textContent).toContain('Updated');
		});
	});
});
