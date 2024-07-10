import { Mark, Schema, type DOMOutputSpec, type MarkSpec } from 'prosemirror-model';

const DOM = {
	p: ['p', 0],
	blockquote: ['blockquote', 0],
	br: ['br'],
	ol: ['ol', 0],
	ul: ['ul', 0],
	li: ['li', 0],
	em: ['em', 0],
	strong: ['strong', 0]
} as const;

export const marks: Record<string, MarkSpec> = {
	link: {
		attrs: {
			href: {},
			title: { default: null }
		},
		inclusive: false,
		parseDOM: [
			{
				tag: 'a[href]',
				getAttrs(dom) {
					return {
						href: dom.getAttribute('href'),
						title: dom.getAttribute('title')
					};
				}
			}
		]
	},
	em: {
		parseDOM: [{ tag: 'i' }, { tag: 'em' }, { style: 'font-style=italic' }],
		toDOM() {
			return DOM.em;
		}
	},
	strong: {
		parseDOM: [
			{ tag: 'strong' },
			{ tag: 'b', getAttrs: (node) => node.style.fontWeight !== 'normal' && null },
			{ style: 'font-weight', getAttrs: (v) => /^(bold(er)?|[5-9]\d{2,})$/.test(v) && null }
		],
		toDOM() {
			return DOM.strong;
		}
	}
};

export const singleLinePlainTextSchema = new Schema({
	nodes: {
		doc: { content: 'text*' },
		text: {
			group: 'inline'
		}
	}
});

export const singleLineRichTextSchema = new Schema({
	nodes: {
		doc: { content: 'text*' },
		text: {
			group: 'inline'
		}
	},
	marks
});

export const multiLinePlainTextSchema = new Schema({
	nodes: {
		doc: {
			content: 'block+'
		},
		paragraph: {
			group: 'block',
			content: 'inline*',
			parseDOM: [{ tag: 'p' }],
			toDOM() {
				return DOM.p;
			}
		},
		text: {
			group: 'inline'
		},
		hard_break: {
			inline: true,
			group: 'inline',
			selectable: false,
			parseDOM: [{ tag: 'br' }],
			toDOM() {
				return DOM.br;
			}
		}
	}
});

export const multiLineRichTextSchema = new Schema({
	nodes: {
		doc: {
			content: 'block+'
		},
		paragraph: {
			group: 'block',
			content: 'inline*',
			parseDOM: [{ tag: 'p' }],
			toDOM() {
				return DOM.p;
			}
		},
		ordered_list: {
			group: 'block',
			content: 'list_item+',
			attrs: { order: { default: 1 } },
			parseDOM: [
				{
					tag: 'ol',
					getAttrs(dom) {
						const start = dom.hasAttribute('start');
						return { order: start ? +start : 1 };
					}
				}
			],
			toDOM(node) {
				return node.attrs.order === 1 ? DOM.ol : ['ol', { start: node.attrs.order }, 0];
			}
		},
		bullet_list: {
			group: 'block',
			content: 'list_item+',
			parseDOM: [{ tag: 'ul' }],
			toDOM() {
				return DOM.ul;
			}
		},
		list_item: {
			content: 'paragraph+',
			parseDOM: [{ tag: 'li' }],
			toDOM() {
				return DOM.li;
			},
			defining: true
		},
		blockquote: {
			content: 'paragraph+',
			group: 'block',
			defining: true,
			parseDOM: [{ tag: 'blockquote' }],
			toDOM() {
				return DOM.blockquote;
			}
		},
		heading: {
			attrs: { level: { default: 1 } },
			content: 'inline*',
			marks: '',
			group: 'block',
			defining: true,
			parseDOM: [
				{
					tag: 'h2',
					getAttrs() {
						return { level: 1 };
					}
				},
				{
					tag: 'h3',
					getAttrs() {
						return { level: 2 };
					}
				},
				{
					tag: 'h4',
					getAttrs() {
						return { level: 3 };
					}
				}
			],
			toDOM(node) {
				return ['h' + (parseInt(node.attrs.level) + 1), {}, 0];
			}
		},
		text: {
			group: 'inline'
		},
		image: {
			attrs: {
				src: {},
				width: {},
				height: {}
			},
			group: 'block',
			draggable: true,
			parseDOM: [
				{
					tag: 'img',
					getAttrs(dom) {
						return {
							src: dom.getAttribute('src'),
							width: dom.getAttribute('width'),
							height: dom.getAttribute('height')
						};
					}
				}
			],
			toDOM(node) {
				const { src, width, height } = node.attrs;

				return [
					'img',
					{
						src,
						width,
						height
					}
				];
			}
		},
		hard_break: {
			inline: true,
			group: 'inline',
			selectable: false,
			parseDOM: [{ tag: 'br' }],
			toDOM() {
				return DOM.br;
			}
		}
	},
	marks
});
