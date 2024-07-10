import { markApplies, canInsert } from '$lib/editor/util.js';
import type { EditorState, TextSelection } from 'prosemirror-state';

export function createLink(state: EditorState) {
	const schema = state.schema;
	const markType = schema.marks.link;
	if (!markType) return false;
	const { $cursor, ranges, from, to } = state.selection as TextSelection;
	const allowed = markApplies(state.doc, ranges, markType);
	const hasLink = state.doc.rangeHasMark(from, to, markType);
	// Disable if either the cursor is collapsed, the mark does not apply or is already present
	if ($cursor || !allowed || hasLink) return false;
	return true;
}

export function insertImage(state: EditorState) {
	const nodeType = state.schema.nodes.image;
	if (!nodeType) return false;
	if (!canInsert(state, nodeType)) return false;
	return true;
}
