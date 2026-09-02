---
'@editable-kit/core': minor
'@editable-kit/svelte': minor
---

`options.extensions` now takes an array or a promise of one, and it **replaces** the variant defaults instead of being merged over them by name. The `(defaults) => …` callback form is gone, and with it the round trip it cost — a promise you pass starts loading in parallel with TipTap.

Building on the defaults is now explicit: the new `defaultExtensions(variant)` export returns the (cached, lazily loaded) default list, so `Promise.all([defaultExtensions('rich'), import('…')])` keeps everything in flight at once.

```diff
- options={{ extensions: [Highlight] }}
+ options={{
+   extensions: Promise.all([
+     defaultExtensions('rich'),
+     import('@tiptap/extension-highlight')
+   ]).then(([defaults, { Highlight }]) => [...defaults, Highlight])
+ }}
```

`resolveExtensions` is no longer exported.
