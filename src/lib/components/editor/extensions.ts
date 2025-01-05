import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Link from '@tiptap/extension-link';
import Heading from '@tiptap/extension-heading';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Image from '@tiptap/extension-image';
import Dropcursor from '@tiptap/extension-dropcursor';
import Strike from '@tiptap/extension-strike';
import History from '@tiptap/extension-history';
import Blockquote from '@tiptap/extension-blockquote';
import HardBreak from '@tiptap/extension-hard-break';
import Gapcursor from '@tiptap/extension-gapcursor';
import Underline from '@tiptap/extension-underline';
import { Extension, posToDOMRect } from '@tiptap/core';
import { NodeSelection, Plugin, PluginKey } from '@tiptap/pm/state';

export const plain = [
	Document.extend({
		content: 'text*'
	}),
	Text,
	History
];

export const multiline = [
	Document.extend({
		content: 'paragraph+'
	}),
	Paragraph,
	Text,
	History
];

export const rich = [
	Document,
	Paragraph,
	Text,
	Bold,
	Italic,
	Underline,
	Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
	Heading.configure({ levels: [1, 2, 3] }),
	BulletList,
	OrderedList,
	ListItem,
	Image,
	Dropcursor,
	Strike,
	History,
	Blockquote,
	HardBreak,
	Gapcursor
];

export function linkMenuPlugin(key: string) {
	return new Plugin({
		key: new PluginKey(key),
		view(view) {
			return {
				update(view, prevState) {
					const { state } = view;
					const { from, to } = state.selection;
					const valid = from !== to;

					const selChanged = !prevState?.selection.eq(state.selection);
					const docChanged = !prevState?.doc.eq(state.doc);

					console.log({ selChanged, docChanged });

					if (!selChanged && !docChanged) return;

					let rect: DOMRect;
					if (isNodeSelection(state.selection)) {
						let node = view.nodeDOM(from) as HTMLElement;

						rect = node.getBoundingClientRect();
					} else {
						rect = posToDOMRect(view, from, to);
					}

					console.log('rect', rect);
				}
			};
		}
	});
}

function isNodeSelection(selection: any): selection is NodeSelection {
	return selection instanceof NodeSelection;
}
