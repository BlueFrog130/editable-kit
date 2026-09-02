---
'@editable-kit/core': minor
'@editable-kit/svelte': minor
---

Add `doc()`, `heading()`, `codeBlock()`, `list()` and `textContent()` to the document
helpers. `textContent()` reads a document’s plain text the way ProseMirror’s own
`textBetween()` does, without mounting an editor. `doc()`
flattens the documents `text()`/`paragraphs()`/`image()` return, so multi-block defaults
compose instead of being hand-written as ProseMirror JSON.
