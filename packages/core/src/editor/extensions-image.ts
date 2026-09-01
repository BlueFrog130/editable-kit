import Document from '@tiptap/extension-document';
import Text from '@tiptap/extension-text';
import History from '@tiptap/extension-history';
import { EkImage } from './image-extension.js';

// `image?` rather than `image` so a field with no src yet is still a valid document
export const extensions = [
	Document.extend({
		content: 'image?'
	}),
	// ProseMirror requires a `text` type in every schema, even one that can never hold text
	Text,
	EkImage,
	History
];
