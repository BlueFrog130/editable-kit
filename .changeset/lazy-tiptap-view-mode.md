---
'@editable-kit/core': patch
---

View mode no longer ships TipTap. `@editable-kit/core` is now marked `"sideEffects": false`,
which lets bundlers drop the `EkImage` export when it is unused — it was the one eager
`@tiptap/*` import in the public entry, and it dragged TipTap and all of ProseMirror into
the initial chunk, defeating the lazy loading everywhere else.

Measured on a Vite app using `Root` + `Text`/`Rich`/`Image`, initial chunk:
**390 KB → 67 KB raw, 125 KB → 25 KB gzip**. TipTap now loads on first focus, as designed.
