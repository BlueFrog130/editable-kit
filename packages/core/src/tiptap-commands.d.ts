// Loading these modules' types is what registers their commands on TipTap's `Commands`
// interface — `editor.chain().toggleBold()` is only typed once they are in scope. This
// stays a hand-written .d.ts, copied into `dist` by the build: tsc elides an unused
// `import type` from declaration output, so the augmentations would not survive.
/// <reference types="@tiptap/extension-blockquote" />
/// <reference types="@tiptap/extension-bold" />
/// <reference types="@tiptap/extension-hard-break" />
/// <reference types="@tiptap/extension-heading" />
/// <reference types="@tiptap/extension-image" />
/// <reference types="@tiptap/extension-italic" />
/// <reference types="@tiptap/extension-link" />
/// <reference types="@tiptap/extension-paragraph" />
/// <reference types="@tiptap/extension-strike" />
/// <reference types="@tiptap/extension-underline" />

export type _TiptapCommands = true;
