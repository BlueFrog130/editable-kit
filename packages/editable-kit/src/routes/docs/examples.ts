export const GETTING_STARTED = `<script lang="ts">
  import * as Editable from 'editable-kit';
  import type { ProseMirrorJSON } from 'editable-kit';

  // Every field stores a ProseMirror document, images included.
  type PageData = {
    title: ProseMirrorJSON;
    body: ProseMirrorJSON;
    image: ProseMirrorJSON;
  };

  let data: PageData = $state({} as PageData); // your data here
  let editing = $state(false);

  // 'saved' is a plain snapshot of 'data' — already flushed, ready to serialize.
  async function handleSave(saved: PageData) {
    await fetch('/api/page', { method: 'PUT', body: JSON.stringify(saved) });
    editing = false;
  }
</script>

<button onclick={() => editing = !editing}>
  {editing ? 'Cancel' : 'Edit'}
</button>

<Editable.Root bind:data {editing} onsave={handleSave}>
  {#snippet children({ save, reset, dirty })}
    <h1><Editable.Text bind:value={data.title} /></h1>
    <div><Editable.Rich bind:value={data.body} /></div>
    <Editable.Image bind:value={data.image} />

    {#if editing}
      <button onclick={save} disabled={!dirty}>Save</button>
      <button onclick={reset}>Discard</button>
    {/if}
  {/snippet}
</Editable.Root>`;

// Overview page — Core Concepts
export const CORE_CONCEPTS = `<script lang="ts">
  import * as Editable from 'editable-kit';
  import type { ProseMirrorJSON } from 'editable-kit';

  // Every field stores a ProseMirror document, images included.
  type PageData = {
    title: ProseMirrorJSON;
    body: ProseMirrorJSON;
    image: ProseMirrorJSON;
  };

  let data: PageData = $state({} as PageData); // your data here
  let editing = $state(false);
</script>

<!-- One Root for shared editing state. Fields bind straight at your data. -->
<Editable.Root bind:data {editing} onsave={handleSave}>
  {#snippet children({ state, save })}
    <h1><Editable.Text bind:value={data.title} /></h1>
    <div><Editable.Rich bind:value={data.body} /></div>
    <Editable.Image bind:value={data.image} />
  {/snippet}
</Editable.Root>`;

// Editors page
export const EDITOR_PLAIN_TEXT = `<h1><Editable.Text bind:value={data.title} /></h1>`;

export const EDITOR_MULTILINE = `<div class="text-muted-foreground">
  <Editable.Multiline bind:value={data.subtitle} />
</div>`;

export const EDITOR_RICH = `<article class="prose">
  <Editable.Rich bind:value={data.body} />
</article>`;

export const EDITOR_IMAGE = `<div class="aspect-video overflow-hidden rounded-lg">
  <Editable.Image bind:value={data.image} />
</div>`;

export const EDITOR_MULTIPLE_DATA = `<Editable.Root bind:data={page} {editing} onsave={handleSave}>
  {#snippet children({ state, save })}
    <h1><Editable.Text bind:value={page.hero.title} /></h1>
    <Editable.Image bind:value={page.hero.cover} />

    <!-- Arrays are an ordinary {#each} — no wrapper, no keys. -->
    {#each page.notes as note (note)}
      <h3><Editable.Text bind:value={note.title} /></h3>
      <p><Editable.Multiline bind:value={note.body} /></p>
    {/each}
  {/snippet}
</Editable.Root>`;

// Saving page
export const SAVE_HANDLER = `<script lang="ts">
  import * as Editable from 'editable-kit';
  import type { ProseMirrorJSON } from 'editable-kit';

  type Hero = { title: ProseMirrorJSON; image: ProseMirrorJSON };

  let hero: Hero = $state({} as Hero);
  let editing = $state(false);

  // No payload to unpack: fields already wrote into 'hero', and 'saved' is a plain
  // snapshot of it. The focused field is flushed before this runs.
  async function handleSave(saved: Hero) {
    await fetch('/api/hero', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(saved)
    });
  }
</script>

<Editable.Root bind:data={hero} {editing} onsave={handleSave}>
  ...
</Editable.Root>`;

export const TYPE_SAFETY = `import { text, paragraphs, image } from 'editable-kit';
import type { ProseMirrorJSON } from 'editable-kit';

// One value type for every variant: a ProseMirror document.
type HeroData = {
  title: ProseMirrorJSON;
  subtitle: ProseMirrorJSON;
  cover: ProseMirrorJSON;
};

// The helpers build each variant's shape, so defaults stay readable:
const hero: HeroData = {
  title: text('Inline editing for Svelte 5'),
  subtitle: paragraphs('Edit content where it lives.'),
  cover: image('/hero.jpg', { alt: 'Hero', width: 1200, height: 675 })
};`;

// Toolbar page
export const TOOLBAR_BASIC = `<Editable.Root bind:data {editing} onsave={handleSave}>
  {#snippet children({ state, save })}
    {#if editing && state}
      <Toolbar {state} onsave={save} />
    {/if}
    <!-- fields... -->
  {/snippet}
</Editable.Root>`;

export const TOOLBAR_COMMAND_API = `const bold = state.command('bold', (e) => e.chain().focus().toggleBold().run());

// bold.isActive — reactive, true when cursor is in bold text
// bold.has      — true if the bold extension is loaded
// bold.run()    — toggles bold on the active editor`;

// Extensions page
export const EXT_PLACEHOLDER = `<Editable.Text
  bind:value={data.title}
  options={{ placeholder: 'Enter a title…' }}
/>`;

export const EXT_EXTEND_DEFAULTS = `<Editable.Rich
  bind:value={data.body}
  options={{
    extensions: async (defaults) => {
      const [{ default: CodeBlock }, { default: TaskList }, { default: TaskItem }] =
        await Promise.all([
          import('@tiptap/extension-code-block'),
          import('@tiptap/extension-task-list'),
          import('@tiptap/extension-task-item')
        ]);
      return [...defaults, CodeBlock, TaskList, TaskItem];
    }
  }}
/>`;

export const EXT_REPLACE_ALL = `<Editable.Rich
  bind:value={data.body}
  options={{
    extensions: async () => {
      const { default: StarterKit } = await import('@tiptap/starter-kit');
      const { default: Highlight } = await import('@tiptap/extension-highlight');
      return [StarterKit, Highlight.configure({ multicolor: true })];
    }
  }}
/>`;

export const EXT_CUSTOM = `import Heading from '@tiptap/extension-heading';

const CustomHeading = Heading.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      id: {
        default: null,
        parseHTML: (el) => el.getAttribute('id'),
        renderHTML: (attrs) => (attrs.id ? { id: attrs.id } : {})
      }
    };
  }
});

// Then use it:
<Editable.Rich
  bind:value={data.body}
  options={{
    extensions: (defaults) =>
      defaults.map((ext) => (ext.name === 'heading' ? CustomHeading : ext))
  }}
/>`;

// Extensions page — dynamic import tip
export const EXT_STATIC_IMPORT = `<script lang="ts">
  // ✗ Static import — pulled into the page's initial bundle
  import CodeBlock from '@tiptap/extension-code-block';
  import TaskList from '@tiptap/extension-task-list';
  import TaskItem from '@tiptap/extension-task-item';
</script>

<Editable.Rich
  bind:value={data.body}
  options={{ extensions: (defaults) => [...defaults, CodeBlock, TaskList, TaskItem] }}
/>`;

export const EXT_DYNAMIC_IMPORT = `<Editable.Rich
  bind:value={data.body}
  options={{
    extensions: async (defaults) => {
      // ✓ Dynamic import — loaded only when the editor mounts
      const [{ default: CodeBlock }, { default: TaskList }, { default: TaskItem }] =
        await Promise.all([
          import('@tiptap/extension-code-block'),
          import('@tiptap/extension-task-list'),
          import('@tiptap/extension-task-item')
        ]);
      return [...defaults, CodeBlock, TaskList, TaskItem];
    }
  }}
/>`;

// Renderer page
export const RENDERER_BASIC = `<script lang="ts">
  import { Renderer } from 'editable-kit';
</script>

<article class="prose">
  <Renderer doc={post.body} />
</article>`;

export const RENDERER_OVERRIDES = `{#snippet heading(node, children)}
  <h2 id={node.content?.[0]?.text?.toLowerCase().replaceAll(' ', '-')}>
    {@render children()}
  </h2>
{/snippet}

{#snippet link(mark, children)}
  <a href={mark.attrs.href} rel="noopener" target="_blank">
    {@render children()}
  </a>
{/snippet}

<Renderer
  doc={post.body}
  overrides={{ nodes: { heading }, marks: { link } }}
/>`;

export const RENDERER_NODE_SIGNATURES = `<!-- Each node snippet receives the node data and a children snippet -->

{#snippet paragraph(node: ParagraphNode, children: Snippet)}
  <p class="my-4">{@render children()}</p>
{/snippet}

{#snippet heading(node: HeadingNode, children: Snippet)}
  <!-- node.attrs.level is 1-6 -->
  {#if node.attrs.level === 1}
    <h1>{@render children()}</h1>
  {:else}
    <h2>{@render children()}</h2>
  {/if}
{/snippet}

{#snippet image(node: ImageNode)}
  <!-- node.attrs: { src, alt, title } — no children -->
  <img src={node.attrs.src} alt={node.attrs.alt} loading="lazy" />
{/snippet}

{#snippet bulletList(node: BulletListNode, children: Snippet)}
  <ul class="list-disc pl-6">{@render children()}</ul>
{/snippet}

{#snippet listItem(node: ListItemNode, children: Snippet)}
  <li>{@render children()}</li>
{/snippet}

{#snippet blockquote(node: BlockquoteNode, children: Snippet)}
  <blockquote class="border-l-4 pl-4 italic">{@render children()}</blockquote>
{/snippet}

{#snippet hardBreak(node: HardBreakNode)}
  <br />
{/snippet}`;

export const RENDERER_MARK_SIGNATURES = `<!-- Each mark snippet receives the mark data and a children snippet -->

{#snippet bold(mark: BoldMark, children: Snippet)}
  <strong class="font-semibold">{@render children()}</strong>
{/snippet}

{#snippet italic(mark: ItalicMark, children: Snippet)}
  <em>{@render children()}</em>
{/snippet}

{#snippet underline(mark: UnderlineMark, children: Snippet)}
  <u>{@render children()}</u>
{/snippet}

{#snippet strike(mark: StrikeMark, children: Snippet)}
  <s>{@render children()}</s>
{/snippet}

{#snippet link(mark: LinkMark, children: Snippet)}
  <!-- mark.attrs: { href, target?, rel? } -->
  <a href={mark.attrs.href} target={mark.attrs.target} rel={mark.attrs.rel}>
    {@render children()}
  </a>
{/snippet}`;

export const RENDERER_EDITABLE_DATA = `<script lang="ts">
  import * as Editable from 'editable-kit';
  import type { ProseMirrorJSON } from 'editable-kit';

  type Post = {
    title: ProseMirrorJSON;
    body: ProseMirrorJSON;
  };

  let data: Post = $state({
    title: Editable.text('My Post Title'),
    body: Editable.paragraphs('Rich text body content.')
  });

  let editing = $state(false);
</script>

<!-- Define snippet overrides -->
{#snippet heading(node, children)}
  <h1 class="text-3xl font-bold tracking-tight">
    {@render children()}
  </h1>
{/snippet}

{#snippet link(mark, children)}
  <a href={mark.attrs.href} class="text-blue-600 underline">
    {@render children()}
  </a>
{/snippet}

<!-- Set overrides once on Root; every field inside inherits them -->
<Editable.Root
  bind:data
  {editing}
  overrides={{ nodes: { heading }, marks: { link } }}
>
  {#snippet children({ save })}
    <Editable.Text bind:value={data.title} />
    <Editable.Rich bind:value={data.body} />
  {/snippet}
</Editable.Root>`;

// Standalone Fields page
export const LOW_LEVEL_STANDALONE = `<script lang="ts">
  import * as Editable from 'editable-kit';
  import type { ProseMirrorJSON } from 'editable-kit';

  let editing = $state(false);

  let title: ProseMirrorJSON = $state(Editable.text('My Title'));
  let body: ProseMirrorJSON = $state(Editable.paragraphs('Body text here.'));
</script>

<button onclick={() => editing = !editing}>
  {editing ? 'Done' : 'Edit'}
</button>

<h1><Editable.Text bind:value={title} {editing} /></h1>
<div><Editable.Rich bind:value={body} {editing} /></div>`;

export const LOW_LEVEL_WITH_ROOT = `<script lang="ts">
  import * as Editable from 'editable-kit';
  import type { ProseMirrorJSON } from 'editable-kit';

  type Post = { title: ProseMirrorJSON; body: ProseMirrorJSON };

  let editing = $state(false);
  let post: Post = $state({} as Post); // your data here

  // Bind Root at the object and the same fields gain save(), reset() and dirty.
  function handleSave(saved: Post) {
    console.log(saved.title, saved.body);
  }
</script>

<Editable.Root bind:data={post} {editing} onsave={handleSave}>
  {#snippet children({ state, save })}
    <Toolbar {state} />
    <h1><Editable.Text bind:value={post.title} /></h1>
    <div><Editable.Rich bind:value={post.body} /></div>
    <button onclick={save}>Save</button>
  {/snippet}
</Editable.Root>`;

// API Reference examples
export const API_ROOT_SAVE = `\
// onsave receives a plain snapshot of the object you bound to Root.
// The focused field is flushed into it first, so it is always current.

async function handleSave(saved: PageData) {
  await fetch('/api/page', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(saved)
  });
}

<Editable.Root bind:data {editing} onsave={handleSave}>...</Editable.Root>`;

export const API_FIELD_VALUE = `\
// Every variant reads and writes the same thing: a ProseMirror document.
// Nothing is projected in or out, so what you store is what TipTap holds.

<Editable.Rich bind:value={post.body} />
// { type: 'doc', content: [{ type: 'paragraph', content: [...] }] }

<Editable.Image bind:value={post.cover} />
// { type: 'doc', content: [{ type: 'image', attrs: { src, alt, width, height } }] }

// Reading a stored image outside a field:
import { imageAttrs } from 'editable-kit';
const { src, alt } = imageAttrs(post.cover);`;

export const API_EDITABLE_STATE = `\
// Access EditableState from Root's children snippet
<Editable.Root editing={true}>
  {#snippet children({ state })}
    {#if state}
      <!-- Check what's focused -->
      {state.isActive('image')}  <!-- boolean -->

      <!-- Create reactive toolbar commands -->
      {@const bold = state.command('toggleBold',
        (e) => e.chain().focus().toggleBold().run())}
      <button
        class:active={bold.isActive}
        disabled={!bold.has}
        onclick={bold.run}
        aria-label="Bold"
        aria-pressed={bold.isActive}>Bold</button>

      <!-- Run arbitrary TipTap commands -->
      <button onclick={() => state.run(
        (editor) => editor.chain().focus().toggleItalic().run()
      )}>Italic</button>

      <!-- Image controls: plain TipTap commands -->
      {#if state.isActive('image')}
        <button onclick={async () => {
          const file = await pickFile();
          if (file) state.run((e) =>
            e.chain().focus().setImage({ src: await upload(file) }).run());
        }}>Replace</button>
      {/if}
    {/if}
  {/snippet}
</Editable.Root>`;

export const API_DIRTY_RESET = `\
<Editable.Root bind:data {editing} onsave={handleSave}>
  {#snippet children({ save, reset, dirty, saveStatus })}
    <button onclick={save} disabled={!dirty || saveStatus === 'saving'}>
      {saveStatus === 'saving' ? 'Saving…' : 'Save'}
    </button>

    <!-- reset() restores the snapshot Root took when editing turned on -->
    <button onclick={() => { reset(); editing = false; }}>Cancel</button>

    <!-- Guard navigation while there are unsaved edits -->
    <svelte:window onbeforeunload={(e) => dirty && e.preventDefault()} />
  {/snippet}
</Editable.Root>`;

// Array page examples
export const ARRAY_BASIC = `\
<script lang="ts">
  import * as Editable from 'editable-kit';
  import type { ProseMirrorJSON } from 'editable-kit';

  type Note = { title: ProseMirrorJSON; body: ProseMirrorJSON };

  let editing = $state(false);
  let notes: Note[] = $state([
    { title: Editable.text('First Note'), body: Editable.paragraphs('Content here.') }
  ]);
</script>

<Editable.Root bind:data={notes} {editing}>
  {#snippet children({ save })}
    <!-- Key by item identity, not index: reordering keeps each editor on its row. -->
    {#each notes as note (note)}
      <div class="border rounded-lg p-4">
        <h3><Editable.Text bind:value={note.title} /></h3>
        <div><Editable.Multiline bind:value={note.body} /></div>
      </div>
    {/each}
  {/snippet}
</Editable.Root>`;

export const ARRAY_ADD_REMOVE = `\
<script lang="ts">
  // ... type Note and imports ...

  // text() and paragraphs() build valid empty documents for you — a hand-written
  // { type: 'text', text: '' } is rejected by ProseMirror once the editor mounts.
  function addNote() {
    notes.push({ title: text('New Note'), body: paragraphs() });
  }

  function removeNote(index: number) {
    notes.splice(index, 1);
  }
</script>

<Editable.Root bind:data={notes} {editing}>
  {#snippet children({ save })}
    {#each notes as note, index (note)}
      <div class="border rounded-lg p-4 relative">
        {#if editing}
          <button onclick={() => removeNote(index)}
            class="absolute top-2 right-2">&times;</button>
        {/if}
        <h3><Editable.Text bind:value={note.title} /></h3>
        <div><Editable.Multiline bind:value={note.body} /></div>
      </div>
    {/each}
    {#if editing}
      <button onclick={addNote}>+ Add Note</button>
    {/if}
  {/snippet}
</Editable.Root>`;

// Theming examples
export const THEMING_CSS_VARS = `\
/* Override CSS custom properties on any parent element */
.my-editor {
  --ek-focus-ring-color: #6366f1;                  /* Image editor focus ring */
  --ek-focus-ring-width: 2px;                      /* Image editor ring width */
  --ek-placeholder-color: #94a3b8;                 /* Empty editor placeholder text */
  --ek-placeholder-font-style: italic;             /* Placeholder font style */
  --ek-image-placeholder-color: #94a3b8;           /* Image placeholder text */
  --ek-image-placeholder-bg: #f1f5f9;             /* Image placeholder background */
  --ek-crop-overlay-color: rgba(0, 0, 0, 0.6);    /* Image crop dark overlay */
  --ek-crop-grid-color: rgba(255, 255, 255, 0.4); /* Image crop grid lines */
  --ek-crop-grid-width: 2px;                      /* Image crop grid width */
}`;

export const THEMING_SCOPED = `\
<!-- Scope theme to a specific section -->
<div style="--ek-focus-ring-color: #6366f1; --ek-placeholder-color: #94a3b8;">
  <Editable.Root bind:data {editing}>
    {#snippet children({ save })}
      <h2><Editable.Text bind:value={data.title} /></h2>
      <Editable.Image bind:value={data.cover} />
    {/snippet}
  </Editable.Root>
</div>`;

export const THEMING_DARK_MODE = `\
/* Tailwind v4 dark mode with CSS custom properties */
:root {
  --ek-focus-ring-color: #3b82f6;
  --ek-focus-ring-width: 1px;
  --ek-placeholder-color: #9ca3af;
  --ek-placeholder-font-style: normal;
  --ek-image-placeholder-color: #9ca3af;
  --ek-image-placeholder-bg: #f1f5f9;
  --ek-crop-overlay-color: rgba(0, 0, 0, 0.5);
  --ek-crop-grid-color: rgba(255, 255, 255, 0.5);
  --ek-crop-grid-width: 1px;
}

@media (prefers-color-scheme: dark) {
  :root {
    --ek-focus-ring-color: #60a5fa;
    --ek-placeholder-color: #6b7280;
    --ek-image-placeholder-color: #6b7280;
    --ek-image-placeholder-bg: #1f2937;
    --ek-crop-overlay-color: rgba(0, 0, 0, 0.7);
    --ek-crop-grid-color: rgba(255, 255, 255, 0.3);
  }
}`;

export const THEMING_ALL_VARIABLES = `\
/* Every variable editable-kit reads, with its default */
--ek-focus-ring-color: #39f;
--ek-focus-ring-width: 1px;
--ek-placeholder-color: #adb5bd;
--ek-placeholder-font-style: italic;
--ek-image-placeholder-color: #adb5bd;
--ek-image-placeholder-bg: #f1f3f5;
--ek-crop-overlay-color: rgba(0, 0, 0, 0.5);
--ek-crop-grid-color: rgba(255, 255, 255, 0.5);
--ek-crop-grid-width: 1px;`;

export const THEMING_IMAGE_CUSTOM = `\
/* The field element is the same node in both modes — style it once */
[data-ek-field] {
  outline: none;
}

[data-ek-field][contenteditable='true']:focus {
  outline: 2px solid var(--ek-focus-ring-color);
  outline-offset: 2px;
}`;

export const PATTERN_IMAGE_UPLOAD = `\
// Nothing uploads for you: pick the file, upload it, set the image node.
// This is the handler your toolbar button calls.
async function upload(file: File): Promise<string> {
  const body = new FormData();
  body.append('file', file);

  const res = await fetch('/api/images/upload', { method: 'POST', body });
  if (!res.ok) throw new Error('Upload failed');

  const { url } = await res.json();
  return url;
}

// In your toolbar, wired to the field's editor via EditableState:
state.run(async (e) => {
  const file = await pickFile();
  if (file) e.chain().focus().setImage({ src: await upload(file) }).run();
});`;

export const PATTERN_BACKEND_SAVE = `\
<script lang="ts">
  import * as Editable from 'editable-kit';
  import type { ProseMirrorJSON } from 'editable-kit';

  type Page = { title: ProseMirrorJSON; body: ProseMirrorJSON };

  let page: Page = $state({} as Page);
  let editing = $state(false);

  // Nothing to unpack — the fields already wrote into 'page'.
  async function handleSave(saved: Page) {
    const res = await fetch('/api/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(saved)
    });
    if (!res.ok) throw new Error(res.statusText);
    editing = false;
  }
</script>

<Editable.Root bind:data={page} {editing} onsave={handleSave}>
  <!-- your fields here -->
</Editable.Root>`;

export const PATTERN_LOCALSTORAGE = `\
function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : fallback;
}

let page = $state(load('page', DEFAULT_PAGE));
let editing = $state(false);

function handleSave(saved: typeof page) {
  localStorage.setItem('page', JSON.stringify(saved));
  editing = false;
}`;

export const PATTERN_ERROR_HANDLING = `\
// Root sets saveStatus to 'error' and rethrows, so the user stays in editing mode
// and 'dirty' stays true — nothing is lost and they can retry.
async function handleSave(saved: Page) {
  const res = await fetch('/api/content', {
    method: 'PUT',
    body: JSON.stringify(saved)
  });
  if (!res.ok) throw new Error('Save failed: ' + res.status);
  editing = false;
}

<Editable.Root bind:data={page} {editing} onsave={handleSave}>
  {#snippet children({ save, saveStatus })}
    <button onclick={() => save().catch(() => {})}>Save</button>
    {#if saveStatus === 'error'}
      <p role="alert">Failed to save. Please try again.</p>
    {/if}
  {/snippet}
</Editable.Root>`;

// Standalone-fields expansion examples
export const LOW_LEVEL_CUSTOM_LAYOUT = `\
<script lang="ts">
  import * as Editable from 'editable-kit';
  import { text, paragraphs, image } from 'editable-kit';

  let editing = $state(false);
  let page = $state({
    title: text('Page Title'),
    sidebar: paragraphs('Sidebar content'),
    body: paragraphs('Main content'),
    hero: image('/hero.jpg', { alt: 'Hero image' })
  });
</script>

<Editable.Root bind:data={page} {editing}>
  {#snippet children({ state, save })}
    <!-- Fields go anywhere in the layout — nesting and order do not matter -->
    <header>
      <h1><Editable.Text bind:value={page.title} /></h1>
      <Editable.Image bind:value={page.hero} />
    </header>

    <div class="grid grid-cols-3 gap-8">
      <aside>
        <Editable.Rich bind:value={page.sidebar} />
      </aside>
      <main class="col-span-2">
        <Editable.Rich bind:value={page.body} />
      </main>
    </div>
  {/snippet}
</Editable.Root>`;

export const LOW_LEVEL_STANDALONE_FORM = `\
<script lang="ts">
  import * as Editable from 'editable-kit';
  import type { ProseMirrorJSON } from 'editable-kit';

  let name: ProseMirrorJSON = $state(Editable.text());
  let bio: ProseMirrorJSON = $state(Editable.paragraphs());

  // No Editable.Root needed — pass editing yourself. Values update on blur.
</script>

<form>
  <label>
    Name
    <Editable.Text bind:value={name} editing={true}
      options={{ placeholder: 'Your name' }} />
  </label>
  <label>
    Bio
    <Editable.Multiline bind:value={bio} editing={true}
      options={{ placeholder: 'Tell us about yourself' }} />
  </label>
</form>`;

// Extension expansion examples
export const EXT_CODE_BLOCK = `\
<Editable.Rich
  bind:value={data.body}
  options={{
    extensions: async (defaults) => {
      const { CodeBlock } = await import('@tiptap/extension-code-block');
      return [...defaults, CodeBlock];
    }
  }}
/>`;

export const EXT_HIGHLIGHT = `\
<Editable.Rich
  bind:value={data.body}
  options={{
    extensions: async (defaults) => {
      const { Highlight } = await import('@tiptap/extension-highlight');
      return [...defaults, Highlight.configure({ multicolor: true })];
    }
  }}
/>`;

export const EXT_COMPOSED_DEMO = `<script lang="ts">
  import * as Editable from 'editable-kit';
  import type { Extensions, Editor } from '@tiptap/core';
  import type { JSONContent } from 'editable-kit/types';
  import { highlight } from '$lib/highlight.js';

  let editing = $state(false);
  let doc = $state(post.body);

  // One async callback, three extensions — all code-split with the editor.
  async function extensions(defaults: Extensions): Promise<Extensions> {
    const [{ CodeBlockShiki }, { DragHandle }, { FileHandler }] = await Promise.all([
      import('tiptap-extension-code-block-shiki'),
      import('@tiptap/extension-drag-handle'),
      import('@tiptap/extension-file-handler')
    ]);

    return [
      ...defaults,
      // Same theme as the view-mode override below, so nothing shifts on click.
      CodeBlockShiki.configure({ defaultTheme: 'github-light', defaultLanguage: 'typescript' }),
      DragHandle.configure({
        render: () => {
          const el = document.createElement('div');
          el.className = 'my-drag-handle'; // a CSS hook, nothing more
          return el;
        }
      }),
      FileHandler.configure({
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
        onDrop: (editor, files, pos) => insert(editor, files, pos),
        onPaste: (editor, files) => insert(editor, files)
      })
    ];
  }

  // Swap createObjectURL for a real upload to persist the file.
  function insert(editor: Editor, files: File[], pos?: number) {
    const content = files.map((file) => ({
      type: 'image',
      attrs: { src: URL.createObjectURL(file), alt: file.name }
    }));
    editor.chain().focus().insertContentAt(pos ?? editor.state.selection.anchor, content).run();
  }
</script>

<!-- View mode never mounts TipTap, so the editor's Shiki extension cannot reach it.
     This snippet is the view-mode half — same highlighter, same theme. -->
{#snippet codeBlock(node: JSONContent)}
  {@const code = node.content?.map((c) => c.text ?? '').join('') ?? ''}
  {#await highlight(code, node.attrs?.language ?? 'typescript')}
    <pre><code>{code}</code></pre>
  {:then html}
    {@html html}
  {:catch}
    <pre><code>{code}</code></pre>
  {/await}
{/snippet}

<Editable.Rich
  bind:value={doc}
  {editing}
  options={{ extensions }}
  overrides={{ nodes: { codeBlock } }}
/>`;

export const EXT_AUGMENT_TYPES = `// src/app.d.ts — or any module file in your project
import type { PMNode } from 'editable-kit';

type CalloutNode = {
  type: 'callout';
  attrs: { tone: 'info' | 'warn' };
  content?: PMNode[];
};

declare module 'editable-kit/types' {
  interface NodeTypes {
    callout: CalloutNode;
  }
  interface MarkTypes {
    highlight: { type: 'highlight'; attrs: { color: string } };
  }
}`;

export const EXT_AUGMENT_USE = `<script lang="ts">
  import * as Editable from 'editable-kit';
</script>

{#snippet callout(node, children)}
  <!-- node is a CalloutNode: node.attrs.tone is 'info' | 'warn' -->
  <aside class="callout callout-{node.attrs.tone}">{@render children()}</aside>
{/snippet}

{#snippet highlight(mark, children)}
  <mark style="background: {mark.attrs.color}">{@render children()}</mark>
{/snippet}

<Editable.Root {editing} overrides={{ nodes: { callout }, marks: { highlight } }}>
  <Editable.Rich bind:value={data.body} options={{ extensions: withCallout }} />
</Editable.Root>`;

export const EXT_BOLD_ONLY = `\
<!-- Restrict to bold only — no other formatting -->
<Editable.Rich
  bind:value={data.body}
  options={{
    extensions: (defaults) =>
      defaults.filter((ext) =>
        ['document', 'paragraph', 'text', 'history', 'bold'].includes(ext.name)
      )
  }}
/>`;

export const API_DOC_HELPERS = `import { text, paragraphs } from 'editable-kit';

// A Text field's document — bare inline text, no paragraph wrapper
text('Untitled');   // { type: 'doc', content: [{ type: 'text', text: 'Untitled' }] }
text();             // empty document

// A Multiline / Rich field's document — one paragraph per argument
paragraphs('First', 'Second');
paragraphs();       // one empty paragraph

// An Image field's document — a single image node, TipTap's own shape
image('/hero.jpg', { alt: 'Hero', width: 1200, height: 675 });
image();            // empty document, nothing picked yet

// Which is all a default-item factory needs:
function newNote(): Note {
  return { title: text('Untitled'), body: paragraphs(), image: image() };
}`;
