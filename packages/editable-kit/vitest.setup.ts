import { configure } from '@testing-library/svelte';

// ponytail: TipTap loads via dynamic import; 1s default waitFor is too tight under parallel workers
configure({ asyncUtilTimeout: 15000 });

// jsdom does no layout, so ProseMirror's `scrollToSelection` throws on every focus and
// never reaches TipTap's onFocus. Zero rects is the honest answer for an unlaid-out
// document and is enough for PM to skip scrolling.
// ponytail: flat zeroes, not a layout engine. Revisit only if a test needs real geometry.
const rects = () => Object.assign([] as unknown as DOMRectList, { item: () => null });
if (!Range.prototype.getClientRects) {
	Range.prototype.getClientRects = rects;
	Range.prototype.getBoundingClientRect = () => new DOMRect();
}
if (!Element.prototype.getClientRects) {
	Element.prototype.getClientRects = rects;
}
