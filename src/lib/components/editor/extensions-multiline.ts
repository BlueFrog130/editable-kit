import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import History from '@tiptap/extension-history';
import Placeholder from '@tiptap/extension-placeholder';

export const extensions = [
	Document.extend({
		content: 'paragraph+'
	}),
	Paragraph,
	Text,
	History,
	Placeholder.configure({ placeholder: 'Type something\u2026' })
];
