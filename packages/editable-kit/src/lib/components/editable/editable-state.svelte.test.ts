import { describe, it, expect, vi } from 'vitest';
import { EditableState } from './editable-state.svelte.js';
import type { Editor } from '@tiptap/core';

type Schema = { marks: Record<string, object>; nodes: Record<string, object> };

const textSchema: Schema = {
	marks: { bold: {}, italic: {} },
	nodes: { paragraph: {}, heading: {} }
};

const imageSchema: Schema = { marks: {}, nodes: { doc: {}, image: {} } };

function mockEditor(overrides: Record<string, unknown> = {}): Editor {
	return {
		isActive: vi.fn().mockReturnValue(false),
		state: { schema: textSchema },
		on: vi.fn(),
		off: vi.fn(),
		...overrides
	} as unknown as Editor;
}

describe('EditableState', () => {
	describe('editor getter/setter', () => {
		it('starts undefined', () => {
			expect(new EditableState().editor).toBeUndefined();
		});

		it('sets and clears the active editor', () => {
			const state = new EditableState();
			const editor = mockEditor();
			state.editor = editor;
			expect(state.editor).toStrictEqual(editor);

			state.editor = undefined;
			expect(state.editor).toBeUndefined();
		});

		it('wires up a transaction handler on activation', () => {
			const state = new EditableState();
			const editor = mockEditor();
			state.editor = editor;

			expect(editor.on).toHaveBeenCalledWith('transaction', expect.any(Function));
		});

		it('removes the transaction handler from the previous editor when switching', () => {
			const state = new EditableState();
			const first = mockEditor();
			const second = mockEditor();

			state.editor = first;
			state.editor = second;

			expect(first.off).toHaveBeenCalledWith('transaction', expect.any(Function));
			expect(second.on).toHaveBeenCalledWith('transaction', expect.any(Function));
		});

		it('removes the transaction handler when deactivating', () => {
			const state = new EditableState();
			const editor = mockEditor();
			state.editor = editor;
			state.editor = undefined;

			expect(editor.off).toHaveBeenCalledWith('transaction', expect.any(Function));
		});
	});

	describe('isActive()', () => {
		it('returns false when no editor is active', () => {
			expect(new EditableState().isActive('bold')).toBe(false);
		});

		it('delegates to editor.isActive()', () => {
			const state = new EditableState();
			const isActive = vi.fn().mockReturnValue(true);
			state.editor = mockEditor({ isActive });

			expect(state.isActive('bold')).toBe(true);
			expect(isActive).toHaveBeenCalledWith('bold', undefined);
		});

		it('passes attributes through', () => {
			const state = new EditableState();
			const isActive = vi.fn().mockReturnValue(true);
			state.editor = mockEditor({ isActive });

			state.isActive('heading', { level: 1 });
			expect(isActive).toHaveBeenCalledWith('heading', { level: 1 });
		});
	});

	describe('has()', () => {
		it('returns false when no editor is active', () => {
			expect(new EditableState().has('bold')).toBe(false);
		});

		it('returns true for marks and nodes in the schema', () => {
			const state = new EditableState();
			state.editor = mockEditor();

			expect(state.has('bold')).toBe(true);
			expect(state.has('paragraph')).toBe(true);
			expect(state.has('nonexistent')).toBe(false);
		});

		it('reflects the active editor schema', () => {
			const state = new EditableState();
			state.editor = mockEditor({ state: { schema: imageSchema } });

			expect(state.has('image')).toBe(true);
			expect(state.has('bold')).toBe(false);
		});
	});

	describe('run()', () => {
		it('returns undefined when no editor is active', () => {
			expect(new EditableState().run((e) => e)).toBeUndefined();
		});

		it('calls fn with the active editor and returns its result', () => {
			const state = new EditableState();
			const editor = mockEditor();
			state.editor = editor;

			const fn = vi.fn().mockReturnValue('hello');
			expect(state.run(fn)).toBe('hello');
			expect(fn).toHaveBeenCalledWith(editor);
		});
	});

	describe('command()', () => {
		it('returns isActive, has, and run', () => {
			const cmd = new EditableState().command('bold', vi.fn());

			expect(cmd).toHaveProperty('isActive');
			expect(cmd).toHaveProperty('has');
			expect(typeof cmd.run).toBe('function');
		});

		it('isActive delegates to state.isActive()', () => {
			const state = new EditableState();
			const isActive = vi.fn().mockReturnValue(true);
			state.editor = mockEditor({ isActive });

			expect(state.command('bold', vi.fn()).isActive).toBe(true);
			expect(isActive).toHaveBeenCalledWith('bold', undefined);
		});

		it('has delegates to state.has()', () => {
			const state = new EditableState();
			state.editor = mockEditor();

			expect(state.command('bold', vi.fn()).has).toBe(true);
			expect(state.command('unknown', vi.fn()).has).toBe(false);
		});

		it('run() calls fn with the active editor', () => {
			const state = new EditableState();
			const editor = mockEditor();
			state.editor = editor;

			const fn = vi.fn();
			state.command('bold', fn).run();

			expect(fn).toHaveBeenCalledWith(editor);
		});

		it('run() is a no-op when no editor is active', () => {
			const fn = vi.fn();
			new EditableState().command('bold', fn).run();

			expect(fn).not.toHaveBeenCalled();
		});

		it('passes attributes to isActive', () => {
			const state = new EditableState();
			const isActive = vi.fn().mockReturnValue(false);
			state.editor = mockEditor({ isActive });

			void state.command('heading', vi.fn(), { level: 2 }).isActive;

			expect(isActive).toHaveBeenCalledWith('heading', { level: 2 });
		});
	});

	describe('edge cases', () => {
		it('rapid switching wires only the final editor', () => {
			const state = new EditableState();
			const [e1, e2, e3] = [mockEditor(), mockEditor(), mockEditor()];

			state.editor = e1;
			state.editor = e2;
			state.editor = e3;

			expect(e1.off).toHaveBeenCalledWith('transaction', expect.any(Function));
			expect(e2.off).toHaveBeenCalledWith('transaction', expect.any(Function));
			expect(e3.on).toHaveBeenCalledWith('transaction', expect.any(Function));
			expect(e3.off).not.toHaveBeenCalled();
		});

		it('command().run() is a no-op after the editor is deactivated', () => {
			const state = new EditableState();
			state.editor = mockEditor();

			const fn = vi.fn();
			const cmd = state.command('bold', fn);

			state.editor = undefined;
			cmd.run();

			expect(fn).not.toHaveBeenCalled();
		});
	});
});
