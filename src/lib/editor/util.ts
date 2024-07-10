import {
	DOMSerializer,
	DOMParser,
	Schema,
	Mark,
	NodeType,
	Node,
	NodeRange,
	MarkType
} from 'prosemirror-model';
import { EditorState, SelectionRange } from 'prosemirror-state';

/**
 * Convert HTML to an HTML string
 */
export function toHTML(editorState: EditorState) {
	const serializer = DOMSerializer.fromSchema(editorState.schema);
	const fragment = serializer.serializeFragment(editorState.doc.content);
	const div = document.createElement('div');
	div.append(fragment);
	return div.innerHTML;
}

/**
 * Convert the editor state to plain text
 */
export function toPlainText(editorState: EditorState) {
	if (editorState.doc.childCount === 0) {
		return '';
	} else if (editorState.doc.childCount === 1) {
		return editorState.doc.textContent;
	} else {
		let paragraphs = [];
		for (let i = 0; i < editorState.doc.childCount; i++) {
			paragraphs.push(editorState.doc.child(i).textContent);
		}
		return paragraphs.join('\n');
	}
}

/**
 * Creates a node from a content string
 */
export function fromHTML(schema: Schema, content: string) {
	const doc = document.implementation.createHTMLDocument();
	doc.body.innerHTML = content;
	return DOMParser.fromSchema(schema).parse(doc.body);
}

export function markActive(type: MarkType) {
	return function (state: EditorState) {
		const { from, $from, to, empty } = state.selection;
		if (!type) return false; // mark might not be available in current schema
		if (empty) return type.isInSet(state.storedMarks || $from.marks());
		else return state.doc.rangeHasMark(from, to, type);
	};
}

export function canInsert(state: EditorState, nodeType: NodeType) {
	const $from = state.selection.$from;
	for (let d = $from.depth; d >= 0; d--) {
		const index = $from.index(d);
		if ($from.node(d).canReplaceWith(index, index, nodeType)) return true;
	}
	return false;
}

export function markApplies(doc: Node, ranges: readonly SelectionRange[], type: MarkType) {
	for (let i = 0; i < ranges.length; i++) {
		const { $from, $to } = ranges[i];
		let can = $from.depth === 0 ? doc.type.allowsMarkType(type) : false;
		doc.nodesBetween($from.pos, $to.pos, (node) => {
			if (can) return false;
			can = node.inlineContent && node.type.allowsMarkType(type);
		});
		if (can) return true;
	}
	return false;
}

// Returns true when cursor (collapsed or not) is inside a link
export function linkActive(type: MarkType) {
	return function (state: EditorState) {
		const { from, to } = state.selection;
		return state.doc.rangeHasMark(from, to, type);
	};
}

export function blockTypeActive(type: NodeType, attrs: Record<string, any>) {
	return function (state: EditorState) {
		// HACK: we fill in the id attribute if present, so the comparison works
		const dynAttrs = Object.assign({}, attrs);
		// @ts-expect-error: node is not defined -- not sure why its in here
		const { $from, to, node } = state.selection;
		if (node) {
			if (node.attrs.id) {
				dynAttrs.id = node.attrs.id;
			}
			return node.hasMarkup(type, dynAttrs);
		}
		if ($from.parent && $from.parent.attrs.id) {
			dynAttrs.id = $from.parent.attrs.id;
		}
		const result = to <= $from.end() && $from.parent.hasMarkup(type, dynAttrs);
		return result;
	};
}

// Returns the first mark found for a given type
// TODO: currently this doesn't covers the case where a link has just one character
export function getMarkAtCurrentSelection(type: MarkType) {
	return function (state: EditorState) {
		const { $from } = state.selection;
		return $from.marks().find((m) => m.type === type);
	};
}
