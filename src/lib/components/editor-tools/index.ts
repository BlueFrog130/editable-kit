import type { EditorState } from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view';

export { default as CreateLink } from './create-link.svelte';
export { default as Divider } from './divider.svelte';
export { default as Reset } from './reset.svelte';
export { default as ToggleBlockquote } from './toggle-blockquote.svelte';
export { default as ToggleBulletList } from './toggle-bullet-list.svelte';
export { default as ToggleHeading } from './toggle-heading.svelte';
export { default as ToggleEmMark } from './toggle-em-mark.svelte';
export { default as ToggleOrderedList } from './toggle-ordered-list.svelte';
export { default as ToggleStrongMark } from './toggle-strong-mark.svelte';

export type EditorToolProps = {
	view: EditorView;
	state: EditorState;
};
