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
import Placeholder from '@tiptap/extension-placeholder';

export const extensions = [
	Document,
	Paragraph,
	Text,
	Bold,
	Italic,
	Underline,
	Link.configure({
		openOnClick: false,
		autolink: true,
		linkOnPaste: true,
		HTMLAttributes: { rel: 'noopener noreferrer' }
	}),
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
	Gapcursor,
	Placeholder.configure({ placeholder: 'Type something\u2026' })
];
