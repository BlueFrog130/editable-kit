import { describe, it, expect, vi } from 'vitest';
import { EditableState } from './editable-state.svelte.js';
import type { Editable, ImageEditable } from '$lib/types.js';
import type { Editor } from '@tiptap/core';
import type ImageEditor from '../image/image-editor.svelte';

function mockTextEditor(overrides: Record<string, unknown> = {}): Editable {
	return {
		type: 'text',
		editor: {
			isActive: vi.fn().mockReturnValue(false),
			state: {
				schema: {
					marks: { bold: {}, italic: {} },
					nodes: { paragraph: {}, heading: {} }
				}
			},
			on: vi.fn(),
			off: vi.fn(),
			...overrides
		} as any
	};
}

function mockImageEditor(): Editable {
	return {
		type: 'image',
		editor: {
			replaceImage: vi.fn(),
			setImageSrc: vi.fn(),
			getAlt: vi.fn().mockReturnValue('alt text'),
			setAlt: vi.fn()
		}
	};
}

describe('EditableState', () => {
	describe('active getter/setter', () => {
		it('starts with active as undefined', () => {
			const state = new EditableState();
			expect(state.active).toBeUndefined();
		});

		it('sets active to a text editor', () => {
			const state = new EditableState();
			const editor = mockTextEditor();
			state.active = editor;
			expect(state.active).toStrictEqual(editor);
		});

		it('sets active to an image editor', () => {
			const state = new EditableState();
			const editor = mockImageEditor();
			state.active = editor;
			expect(state.active).toStrictEqual(editor);
		});

		it('sets active to undefined', () => {
			const state = new EditableState();
			state.active = mockTextEditor();
			state.active = undefined;
			expect(state.active).toBeUndefined();
		});

		it('wires up transaction handler on text editor activation', () => {
			const state = new EditableState();
			const editor = mockTextEditor();
			state.active = editor;

			expect((editor.editor as Editor).on).toHaveBeenCalledWith(
				'transaction',
				expect.any(Function)
			);
		});

		it('removes transaction handler from previous text editor when switching', () => {
			const state = new EditableState();

			const editor1 = mockTextEditor();
			state.active = editor1;

			const editor2 = mockTextEditor();
			state.active = editor2;

			expect((editor1.editor as Editor).off).toHaveBeenCalledWith(
				'transaction',
				expect.any(Function)
			);
			expect((editor2.editor as Editor).on).toHaveBeenCalledWith(
				'transaction',
				expect.any(Function)
			);
		});

		it('removes transaction handler when deactivating', () => {
			const state = new EditableState();
			const editor = mockTextEditor();
			state.active = editor;
			state.active = undefined;

			expect((editor.editor as Editor).off).toHaveBeenCalledWith(
				'transaction',
				expect.any(Function)
			);
		});

		it('does not wire transaction handler for image editors', () => {
			const state = new EditableState();
			const editor = mockImageEditor();
			state.active = editor;

			// Image editors don't have on/off
			expect(editor.editor).not.toHaveProperty('on');
		});
	});

	describe('isText', () => {
		it('returns false when no active editor', () => {
			const state = new EditableState();
			expect(state.isText).toBe(false);
		});

		it('returns true when active is a text editor', () => {
			const state = new EditableState();
			state.active = mockTextEditor();
			expect(state.isText).toBe(true);
		});

		it('returns false when active is an image editor', () => {
			const state = new EditableState();
			state.active = mockImageEditor();
			expect(state.isText).toBe(false);
		});
	});

	describe('isImage', () => {
		it('returns false when no active editor', () => {
			const state = new EditableState();
			expect(state.isImage).toBe(false);
		});

		it('returns true when active is an image editor', () => {
			const state = new EditableState();
			state.active = mockImageEditor();
			expect(state.isImage).toBe(true);
		});

		it('returns false when active is a text editor', () => {
			const state = new EditableState();
			state.active = mockTextEditor();
			expect(state.isImage).toBe(false);
		});
	});

	describe('isActive()', () => {
		it('returns false when no active editor', () => {
			const state = new EditableState();
			expect(state.isActive('bold')).toBe(false);
		});

		it('returns false when active is an image editor', () => {
			const state = new EditableState();
			state.active = mockImageEditor();
			expect(state.isActive('bold')).toBe(false);
		});

		it('delegates to editor.isActive() for text editors', () => {
			const state = new EditableState();
			const isActiveMock = vi.fn().mockReturnValue(true);
			state.active = mockTextEditor({ isActive: isActiveMock });

			expect(state.isActive('bold')).toBe(true);
			expect(isActiveMock).toHaveBeenCalledWith('bold', undefined);
		});

		it('passes attributes to editor.isActive()', () => {
			const state = new EditableState();
			const isActiveMock = vi.fn().mockReturnValue(true);
			state.active = mockTextEditor({ isActive: isActiveMock });

			state.isActive('heading', { level: 1 });
			expect(isActiveMock).toHaveBeenCalledWith('heading', { level: 1 });
		});
	});

	describe('has()', () => {
		it('returns false when no active editor', () => {
			const state = new EditableState();
			expect(state.has('bold')).toBe(false);
		});

		it('returns false when active is an image editor', () => {
			const state = new EditableState();
			state.active = mockImageEditor();
			expect(state.has('bold')).toBe(false);
		});

		it('returns true for marks in schema', () => {
			const state = new EditableState();
			state.active = mockTextEditor();
			expect(state.has('bold')).toBe(true);
			expect(state.has('italic')).toBe(true);
		});

		it('returns true for nodes in schema', () => {
			const state = new EditableState();
			state.active = mockTextEditor();
			expect(state.has('paragraph')).toBe(true);
			expect(state.has('heading')).toBe(true);
		});

		it('returns false for non-existent extensions', () => {
			const state = new EditableState();
			state.active = mockTextEditor();
			expect(state.has('nonexistent')).toBe(false);
		});
	});

	describe('text()', () => {
		it('returns undefined when no active editor', () => {
			const state = new EditableState();
			expect(state.text((e) => e)).toBeUndefined();
		});

		it('returns undefined when active is an image editor', () => {
			const state = new EditableState();
			state.active = mockImageEditor();
			expect(state.text((e) => 'result')).toBeUndefined();
		});

		it('calls fn with the editor and returns result', () => {
			const state = new EditableState();
			const editor = mockTextEditor();
			state.active = editor;

			const result = state.text((e) => 'hello');
			expect(result).toBe('hello');
		});

		it('passes the actual editor instance to fn', () => {
			const state = new EditableState();
			const editor = mockTextEditor();
			state.active = editor;

			const fn = vi.fn();
			state.text(fn);
			expect(fn).toHaveBeenCalledWith(editor.editor);
		});
	});

	describe('command()', () => {
		it('returns an EditableCommand with isActive, has, and run', () => {
			const state = new EditableState();
			const cmd = state.command('bold', vi.fn());

			expect(cmd).toHaveProperty('isActive');
			expect(cmd).toHaveProperty('has');
			expect(cmd).toHaveProperty('run');
			expect(typeof cmd.run).toBe('function');
		});

		it('command.isActive delegates to state.isActive()', () => {
			const state = new EditableState();
			const isActiveMock = vi.fn().mockReturnValue(true);
			state.active = mockTextEditor({ isActive: isActiveMock });

			const cmd = state.command('bold', vi.fn());
			expect(cmd.isActive).toBe(true);
			expect(isActiveMock).toHaveBeenCalledWith('bold', undefined);
		});

		it('command.has delegates to state.has()', () => {
			const state = new EditableState();
			state.active = mockTextEditor(); // schema has bold and italic

			const boldCmd = state.command('bold', vi.fn());
			expect(boldCmd.has).toBe(true);

			const unknownCmd = state.command('unknown', vi.fn());
			expect(unknownCmd.has).toBe(false);
		});

		it('command.run() calls fn with the active text editor', () => {
			const state = new EditableState();
			const editor = mockTextEditor();
			state.active = editor;

			const fn = vi.fn();
			const cmd = state.command('bold', fn);
			cmd.run();

			expect(fn).toHaveBeenCalledWith(editor.editor);
		});

		it('command.run() is no-op when no text editor is active', () => {
			const state = new EditableState();
			const fn = vi.fn();
			const cmd = state.command('bold', fn);
			cmd.run();

			expect(fn).not.toHaveBeenCalled();
		});

		it('command.run() is no-op when image editor is active', () => {
			const state = new EditableState();
			state.active = mockImageEditor();
			const fn = vi.fn();
			const cmd = state.command('bold', fn);
			cmd.run();

			expect(fn).not.toHaveBeenCalled();
		});

		it('command passes attributes to isActive', () => {
			const state = new EditableState();
			const isActiveMock = vi.fn().mockReturnValue(false);
			state.active = mockTextEditor({ isActive: isActiveMock });

			const cmd = state.command('heading', vi.fn(), { level: 2 });
			void cmd.isActive;

			expect(isActiveMock).toHaveBeenCalledWith('heading', { level: 2 });
		});
	});

	describe('image methods', () => {
		it('replaceImage() calls editor.replaceImage() when image is active', () => {
			const state = new EditableState();
			const editor = mockImageEditor();
			state.active = editor;

			state.replaceImage();
			expect((editor as ImageEditable).editor.replaceImage).toHaveBeenCalledOnce();
		});

		it('replaceImage() is no-op when no editor is active', () => {
			const state = new EditableState();
			expect(() => state.replaceImage()).not.toThrow();
		});

		it('replaceImage() is no-op when text editor is active', () => {
			const state = new EditableState();
			state.active = mockTextEditor();
			expect(() => state.replaceImage()).not.toThrow();
		});

		it('setImageSrc() calls editor.setImageSrc()', () => {
			const state = new EditableState();
			const editor = mockImageEditor();
			state.active = editor;

			state.setImageSrc('new.jpg');
			expect((editor as ImageEditable).editor.setImageSrc).toHaveBeenCalledWith('new.jpg');
		});

		it('setImageSrc() is no-op when not an image editor', () => {
			const state = new EditableState();
			expect(() => state.setImageSrc('test.jpg')).not.toThrow();
		});

		it('getImageAlt() returns alt from editor', () => {
			const state = new EditableState();
			const editor = mockImageEditor();
			state.active = editor;

			expect(state.getImageAlt()).toBe('alt text');
		});

		it('getImageAlt() returns undefined when not an image editor', () => {
			const state = new EditableState();
			expect(state.getImageAlt()).toBeUndefined();
		});

		it('getImageAlt() returns undefined when text editor is active', () => {
			const state = new EditableState();
			state.active = mockTextEditor();
			expect(state.getImageAlt()).toBeUndefined();
		});

		it('setImageAlt() calls editor.setAlt()', () => {
			const state = new EditableState();
			const editor = mockImageEditor();
			state.active = editor;

			state.setImageAlt('new alt');
			expect((editor as ImageEditable).editor.setAlt).toHaveBeenCalledWith('new alt');
		});

		it('setImageAlt() is no-op when not an image editor', () => {
			const state = new EditableState();
			expect(() => state.setImageAlt('test')).not.toThrow();
		});
	});

	describe('edge cases', () => {
		it('rapid switching wires only the final editor', () => {
			const state = new EditableState();
			const e1 = mockTextEditor();
			const e2 = mockTextEditor();
			const e3 = mockTextEditor();

			state.active = e1;
			state.active = e2;
			state.active = e3;

			expect((e1.editor as any).off).toHaveBeenCalledWith('transaction', expect.any(Function));
			expect((e2.editor as any).off).toHaveBeenCalledWith('transaction', expect.any(Function));
			expect((e3.editor as any).on).toHaveBeenCalledWith('transaction', expect.any(Function));
			expect((e3.editor as any).off).not.toHaveBeenCalled();
		});

		it('command().run() is no-op after deactivating editor', () => {
			const state = new EditableState();
			const editor = mockTextEditor();
			state.active = editor;

			const fn = vi.fn();
			const cmd = state.command('bold', fn);

			state.active = undefined;
			cmd.run();

			expect(fn).not.toHaveBeenCalled();
		});
	});
});
