import { describe, it, expect, vi } from 'vitest';
import { pickFile } from './pick-file.js';

/** pickFile never appends the input, so hand it back the one it just created. */
function spyInput() {
	const input = document.createElement('input');
	input.click = vi.fn();
	vi.spyOn(document, 'createElement').mockReturnValueOnce(input);
	return input;
}

describe('pickFile', () => {
	it('resolves with the chosen file', async () => {
		const input = spyInput();
		const pending = pickFile();

		const file = new File(['x'], 'a.png', { type: 'image/png' });
		Object.defineProperty(input, 'files', { value: [file] });
		input.onchange!(new Event('change'));

		expect(await pending).toBe(file);
	});

	it('resolves undefined when the dialog is dismissed', async () => {
		const input = spyInput();
		const pending = pickFile();

		input.oncancel!(new Event('cancel'));
		expect(await pending).toBeUndefined();
	});

	it('opens an image-only picker', () => {
		const input = spyInput();
		void pickFile();

		expect([input.type, input.accept]).toEqual(['file', 'image/*']);
		expect(input.click).toHaveBeenCalledOnce();
	});
});
