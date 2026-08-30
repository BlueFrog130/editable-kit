/** Resolves to the picked file, or undefined if the dialog was dismissed. */
export function pickFile(): Promise<File | undefined> {
	return new Promise((resolve) => {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'image/*';
		// `cancel` is not universally supported; the input is garbage collected either way
		input.oncancel = () => resolve(undefined);
		input.onchange = () => resolve(input.files?.[0]);
		input.click();
	});
}
