# editable-kit (deprecated)

Renamed to [`@editable-kit/svelte`](https://www.npmjs.com/package/@editable-kit/svelte). This
package is a thin re-export kept so existing installs keep working; it gets no new features.

```diff
- import * as Editable from 'editable-kit';
+ import * as Editable from '@editable-kit/svelte';
```

Two things do not come along automatically:

- `editable-kit/types` is now `@editable-kit/core`, and that is also where you augment
  `NodeTypes` / `MarkTypes` — `declare module '@editable-kit/core/types'`. Augmentation has to
  name the module that declares the interface, so re-exporting cannot forward it.
- `editable-kit/renderer` is now `@editable-kit/svelte/renderer`.

Import from one name or the other, not both: two specifiers means two copies of the components.
