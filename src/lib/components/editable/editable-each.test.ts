import { render, screen, cleanup, waitFor, fireEvent } from '@testing-library/svelte';
import { afterEach, describe, it, expect, vi } from 'vitest';
import TestComponent from './editable-each.test.svelte';
import type { ProseMirrorJSON } from '$lib/types/prosemirror.js';

afterEach(() => cleanup());

function makeNote(title: string, body: string) {
	return {
		title: {
			type: 'doc' as const,
			content: [{ type: 'text' as const, text: title }]
		},
		body: {
			type: 'doc' as const,
			content: [{ type: 'paragraph' as const, content: [{ type: 'text' as const, text: body }] }]
		}
	};
}

describe('Editable.Each', () => {
	describe('read-only rendering', () => {
		it('renders all items in the array', () => {
			const data = [makeNote('Note 1', 'Body 1'), makeNote('Note 2', 'Body 2')];

			render(TestComponent, { editing: false, data });

			expect(screen.getByTestId('note-0')).toBeDefined();
			expect(screen.getByTestId('note-1')).toBeDefined();
		});

		it('renders title and body for each item', () => {
			const data = [makeNote('First', 'Content A'), makeNote('Second', 'Content B')];

			render(TestComponent, { editing: false, data });

			expect(screen.getByTestId('note-title-0').textContent).toContain('First');
			expect(screen.getByTestId('note-body-0').textContent).toContain('Content A');
			expect(screen.getByTestId('note-title-1').textContent).toContain('Second');
			expect(screen.getByTestId('note-body-1').textContent).toContain('Content B');
		});

		it('renders empty array without errors', () => {
			render(TestComponent, { editing: false, data: [] });

			expect(screen.queryByTestId('note-0')).toBeNull();
		});

		it('renders single item', () => {
			const data = [makeNote('Only Note', 'Only Body')];

			render(TestComponent, { editing: false, data });

			expect(screen.getByTestId('note-0')).toBeDefined();
			expect(screen.getByTestId('note-title-0').textContent).toContain('Only Note');
			expect(screen.queryByTestId('note-1')).toBeNull();
		});

		it('renders many items', () => {
			const data = Array.from({ length: 5 }, (_, i) => makeNote(`Note ${i}`, `Body ${i}`));

			render(TestComponent, { editing: false, data });

			for (let i = 0; i < 5; i++) {
				expect(screen.getByTestId(`note-${i}`)).toBeDefined();
				expect(screen.getByTestId(`note-title-${i}`).textContent).toContain(`Note ${i}`);
				expect(screen.getByTestId(`note-body-${i}`).textContent).toContain(`Body ${i}`);
			}
		});
	});

	describe('rich text in each items', () => {
		it('renders text with marks correctly per item', () => {
			const data = [
				{
					title: {
						type: 'doc' as const,
						content: [
							{
								type: 'paragraph' as const,
								content: [
									{
										type: 'text' as const,
										text: 'Bold Title',
										marks: [{ type: 'bold' as const }]
									}
								]
							}
						]
					},
					body: {
						type: 'doc' as const,
						content: [
							{
								type: 'paragraph' as const,
								content: [{ type: 'text' as const, text: 'Plain body' }]
							}
						]
					}
				}
			];

			render(TestComponent, { editing: false, data });

			const titleField = screen.getByTestId('note-title-0');
			const strong = titleField.querySelector('strong');
			expect(strong).not.toBeNull();
			expect(strong!.textContent).toBe('Bold Title');
		});

		it('renders paragraphs as <p> elements', () => {
			const data = [makeNote('Title', 'Body')];

			render(TestComponent, { editing: false, data });

			const bodyField = screen.getByTestId('note-body-0');
			const p = bodyField.querySelector('p');
			expect(p).not.toBeNull();
			expect(p!.textContent).toBe('Body');
		});
	});

	describe('data reactivity', () => {
		it('renders updated data when array changes', async () => {
			const initial = [makeNote('A', 'Body A')];

			const { rerender } = render(TestComponent, {
				editing: false,
				data: initial
			});

			expect(screen.getByTestId('note-title-0').textContent).toContain('A');
			expect(screen.queryByTestId('note-1')).toBeNull();

			const updated = [makeNote('A', 'Body A'), makeNote('B', 'Body B')];
			await rerender({ data: updated });

			expect(screen.getByTestId('note-1')).toBeDefined();
			expect(screen.getByTestId('note-title-1').textContent).toContain('B');
		});

		it('removes items when array shrinks', async () => {
			const initial = [makeNote('A', 'a'), makeNote('B', 'b'), makeNote('C', 'c')];

			const { rerender } = render(TestComponent, {
				editing: false,
				data: initial
			});

			expect(screen.getByTestId('note-2')).toBeDefined();

			const shrunk = [makeNote('A', 'a')];
			await rerender({ data: shrunk });

			expect(screen.getByTestId('note-0')).toBeDefined();
			expect(screen.queryByTestId('note-1')).toBeNull();
			expect(screen.queryByTestId('note-2')).toBeNull();
		});
	});

	describe('saving functionality', () => {
		it('saves array of editor data on save click', async () => {
			const onsave = vi.fn();
			const data = [makeNote('Note 1', 'Body 1'), makeNote('Note 2', 'Body 2')];

			render(TestComponent, { editing: true, data, onsave });

			// Each item has 2 fields (title=text, body=multiline) → 4 editors total
			await waitFor(() => {
				const editors = document.querySelectorAll('[data-ek-editor]');
				expect(editors.length).toBe(4);
			});

			await fireEvent.click(screen.getByTestId('save-btn'));

			await waitFor(() => {
				expect(onsave).toHaveBeenCalledOnce();
			});

			const saveData = onsave.mock.calls[0][0];
			expect(Array.isArray(saveData)).toBe(true);
			expect(saveData).toHaveLength(2);
		});

		it('each save item contains title and body fields', async () => {
			const onsave = vi.fn();
			const data = [makeNote('N1', 'B1')];

			render(TestComponent, { editing: true, data, onsave });

			await waitFor(() => {
				const editors = document.querySelectorAll('[data-ek-editor]');
				expect(editors.length).toBe(2);
			});

			await fireEvent.click(screen.getByTestId('save-btn'));

			await waitFor(() => {
				expect(onsave).toHaveBeenCalledOnce();
			});

			const saveData = onsave.mock.calls[0][0];
			expect(saveData[0]).toHaveProperty('title');
			expect(saveData[0]).toHaveProperty('body');
			expect(saveData[0].title.type).toBe('text');
			expect(saveData[0].body.type).toBe('text');
		});

		it('save items contain doc-type content', async () => {
			const onsave = vi.fn();
			const data = [makeNote('Title', 'Content')];

			render(TestComponent, { editing: true, data, onsave });

			await waitFor(() => {
				expect(document.querySelector('[data-ek-editor]')).not.toBeNull();
			});

			await fireEvent.click(screen.getByTestId('save-btn'));

			await waitFor(() => {
				expect(onsave).toHaveBeenCalledOnce();
			});

			const item = onsave.mock.calls[0][0][0];
			expect(item.title.content).toHaveProperty('type', 'doc');
			expect(item.body.content).toHaveProperty('type', 'doc');
		});

		it('root onsave receives Map with notes key', async () => {
			const onrootsave = vi.fn();
			const data = [makeNote('N1', 'B1')];

			render(TestComponent, { editing: true, data, onrootsave });

			await waitFor(() => {
				expect(document.querySelector('[data-ek-editor]')).not.toBeNull();
			});

			await fireEvent.click(screen.getByTestId('save-btn'));

			await waitFor(() => {
				expect(onrootsave).toHaveBeenCalledOnce();
			});

			const rootData = onrootsave.mock.calls[0][0];
			expect(rootData).toBeInstanceOf(Map);
			expect(rootData.has('notes')).toBe(true);
		});

		it('both onsave and onrootsave are called during save', async () => {
			const onsave = vi.fn();
			const onrootsave = vi.fn();
			const data = [makeNote('N1', 'B1')];

			render(TestComponent, { editing: true, data, onsave, onrootsave });

			await waitFor(() => {
				expect(document.querySelector('[data-ek-editor]')).not.toBeNull();
			});

			await fireEvent.click(screen.getByTestId('save-btn'));

			await waitFor(() => {
				expect(onsave).toHaveBeenCalledOnce();
				expect(onrootsave).toHaveBeenCalledOnce();
			});
		});

		it('saved content preserves initial text per item', async () => {
			const onsave = vi.fn();
			const data = [makeNote('Alpha', 'Beta'), makeNote('Gamma', 'Delta')];

			render(TestComponent, { editing: true, data, onsave });

			await waitFor(() => {
				const editors = document.querySelectorAll('[data-ek-editor]');
				expect(editors.length).toBe(4);
			});

			await fireEvent.click(screen.getByTestId('save-btn'));

			await waitFor(() => {
				expect(onsave).toHaveBeenCalledOnce();
			});

			// Check body fields (multiline variant) which support paragraph content.
			// Title fields use the plain variant whose schema can't parse paragraphs.
			const saveData = onsave.mock.calls[0][0];
			expect(JSON.stringify(saveData[0].body)).toContain('Beta');
			expect(JSON.stringify(saveData[1].body)).toContain('Delta');
		});
	});

	describe('context integration', () => {
		it('passes editing state from Root', () => {
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
});
