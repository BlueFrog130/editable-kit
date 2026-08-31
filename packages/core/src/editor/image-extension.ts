import Image from '@tiptap/extension-image';

/**
 * Intrinsic dimensions are the only thing that stops an <img> from shifting layout
 * while it loads, so they have to survive a round trip through the document.
 */
export const EkImage = Image.extend({
	addAttributes() {
		return {
			...this.parent?.(),
			width: { default: null },
			height: { default: null }
		};
	}
});
