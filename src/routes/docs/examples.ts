export const GETTING_STARTED = `<script lang="ts">
  import * as Editable from 'editable-kit';
  import type { ProseMirrorJSON, ImageState } from 'editable-kit';

  type PageData = {
    title: ProseMirrorJSON;
    body: ProseMirrorJSON;
    image: ImageState;
  };

  let data: PageData = $state({ ... });
  let editing = $state(false);

  async function handleSave(allData) {
    const page = allData.get('page');
    if (page) {
      // Send to your API, save to IndexedDB, etc.
      console.log(page.title, page.body, page.image);
    }
    editing = false;
  }
</script>

<button onclick={() => editing = !editing}>
  {editing ? 'Cancel' : 'Edit'}
</button>

<Editable.Root {editing} onsave={handleSave}>
  {#snippet children({ state, save, editing })}
    <Editable.Data key="page" {data}>
      {#snippet children({ text, rich, image })}
        <h1>{@render text('title')}</h1>
        <div>{@render rich('body')}</div>
        {@render image('image', { maxWidth: 800, maxHeight: 500, quality: 0.85 })}
      {/snippet}
    </Editable.Data>

    {#if editing}
      <button onclick={save}>Save</button>
    {/if}
  {/snippet}
</Editable.Root>`;

// Overview page — Core Concepts
export const CORE_CONCEPTS = `<script lang="ts">
  import * as Editable from 'editable-kit';
  import type { ProseMirrorJSON, ImageState } from 'editable-kit';

  type PageData = {
    title: ProseMirrorJSON;
    body: ProseMirrorJSON;
    image: ImageState;
  };

  let data: PageData = $state({ ... });
  let editing = $state(false);
</script>

<Editable.Root {editing} onsave={handleSave}>
  {#snippet children({ state, save, editing })}
    <Editable.Data key="page" {data}>
      {#snippet children({ text, rich, image })}
        <h1>{@render text('title')}</h1>
        <div>{@render rich('body')}</div>
        {@render image('image', { maxWidth: 800, maxHeight: 500, quality: 0.85 })}
      {/snippet}
    </Editable.Data>
  {/snippet}
</Editable.Root>`;

// Editors page
export const EDITOR_PLAIN_TEXT = `<Editable.Data key="hero" {data}>
  {#snippet children({ text })}
    <h1>{@render text('title')}</h1>
  {/snippet}
</Editable.Data>`;

export const EDITOR_MULTILINE = `<Editable.Data key="hero" {data}>
  {#snippet children({ multiline })}
    <div class="text-muted-foreground">
      {@render multiline('subtitle')}
    </div>
  {/snippet}
</Editable.Data>`;

export const EDITOR_RICH = `<Editable.Data key="post" {data}>
  {#snippet children({ rich })}
    <article class="prose">
      {@render rich('body')}
    </article>
  {/snippet}
</Editable.Data>`;

export const EDITOR_IMAGE = `<Editable.Data key="hero" {data}>
  {#snippet children({ image })}
    <div class="aspect-video overflow-hidden rounded-lg">
      {@render image('image', {
        maxWidth: 1200,
        maxHeight: 675,
        quality: 0.85,
        aspect: 16 / 9
      })}
    </div>
  {/snippet}
</Editable.Data>`;

export const EDITOR_MULTIPLE_DATA = `<Editable.Root {editing} onsave={handleSave}>
  {#snippet children({ state, save })}
    <Editable.Data key="hero" data={hero}>
      {#snippet children({ text, image })}
        <h1>{@render text('title')}</h1>
        {@render image('cover', { maxWidth: 1200, maxHeight: 675, quality: 0.85 })}
      {/snippet}
    </Editable.Data>

    {#each notes as note, i}
      <Editable.Data key={\`notes-\${i}\`} data={note}>
        {#snippet children({ text, multiline })}
          <h3>{@render text('title')}</h3>
          <p>{@render multiline('body')}</p>
        {/snippet}
      </Editable.Data>
    {/each}
  {/snippet}
</Editable.Root>`;

// Saving page
export const SAVE_HANDLER = `<script lang="ts">
  import * as Editable from 'editable-kit';
  import type { EditorContent } from 'editable-kit';

  // Each key in the Map matches the "key" prop on Editable.Data.
  // Each value is a record of field names to EditorContent.
  //
  // EditorContent is one of:
  //   { type: 'text', content: ProseMirrorJSON }
  //   { type: 'image-src', src: string, alt: string }
  //   { type: 'image-blob', blob: Blob, alt: string }

  async function handleSave(allData: Map<string, Record<string, EditorContent>>) {
    const hero = allData.get('hero');
    if (hero) {
      const title = hero.title; // { type: 'text', content: ProseMirrorJSON }
      const image = hero.image; // { type: 'image-src', src: string, alt } | { type: 'image-blob', blob: Blob, alt }

      // Send to your API, save to IndexedDB, etc.
      await fetch('/api/hero', {
        method: 'POST',
        body: JSON.stringify({ title: title.content })
      });
    }
  }
</script>

<Editable.Root {editing} onsave={handleSave}>
  ...
</Editable.Root>`;

export const TYPE_SAFETY = `import type { ProseMirrorJSON, ImageState } from 'editable-kit';

type HeroData = {
  title: ProseMirrorJSON;    // ← text('title') ✓, image('title') ✗
  subtitle: ProseMirrorJSON; // ← multiline('subtitle') ✓
  cover: ImageState;         // ← image('cover') ✓, text('cover') ✗
};

// Utility types available:
// JSONKeys<T>   — keys where value extends ProseMirrorJSON
// ImageKeys<T>  — keys where value extends ImageState`;

// Toolbar page
export const TOOLBAR_BASIC = `<Editable.Root {editing} onsave={handleSave}>
  {#snippet children({ state, save })}
    {#if editing && state}
      <Toolbar {state} onsave={save} />
    {/if}
    <!-- editors... -->
  {/snippet}
</Editable.Root>`;

export const TOOLBAR_COMMAND_API = `const bold = state.command('bold', (e) => e.chain().focus().toggleBold().run());

// bold.isActive — reactive, true when cursor is in bold text
// bold.has      — true if the bold extension is loaded
// bold.run()    — toggles bold on the active editor`;

// Extensions page
export const EXT_PLACEHOLDER = `{@render text('title', {
  placeholder: 'Enter a title…'
})}`;

export const EXT_EXTEND_DEFAULTS = `{@render rich('body', {
  extensions: async (defaults) => {
    const [{ default: CodeBlock }, { default: TaskList }, { default: TaskItem }] =
      await Promise.all([
        import('@tiptap/extension-code-block'),
        import('@tiptap/extension-task-list'),
        import('@tiptap/extension-task-item')
      ]);
    return [...defaults, CodeBlock, TaskList, TaskItem];
  }
})}`;

export const EXT_REPLACE_ALL = `{@render rich('body', {
  extensions: async () => {
    const { default: StarterKit } = await import('@tiptap/starter-kit');
    const { default: Highlight } = await import('@tiptap/extension-highlight');
    return [StarterKit, Highlight.configure({ multicolor: true })];
  }
})}`;

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
{@render rich('body', {
  extensions: (defaults) =>
    defaults.map((ext) => (ext.name === 'heading' ? CustomHeading : ext))
})}`;

// Extensions page — dynamic import tip
export const EXT_STATIC_IMPORT = `<script lang="ts">
  // ✗ Static import — pulled into the page's initial bundle
  import CodeBlock from '@tiptap/extension-code-block';
  import TaskList from '@tiptap/extension-task-list';
  import TaskItem from '@tiptap/extension-task-item';
</script>

{@render rich('body', {
  extensions: (defaults) => [...defaults, CodeBlock, TaskList, TaskItem]
})}`;

export const EXT_DYNAMIC_IMPORT = `{@render rich('body', {
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
})}`;

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
  <a href={mark.attrs.href} class="text-blue-600 underline" target="_blank">
    {@render children()}
  </a>
{/snippet}

<Renderer doc={post.body} overrides={{ nodes: { heading }, marks: { link } }} />`;

// Low-Level Editors page
export const LOW_LEVEL_STANDALONE = `<script lang="ts">
  import { PlainText, RichText } from 'editable-kit/editors';
  import type { ProseMirrorJSON } from 'editable-kit';

  let editing = $state(false);

  let title: ProseMirrorJSON = $state({
    type: 'doc',
    content: [{ type: 'text', text: 'My Title' }]
  });

  let body: ProseMirrorJSON = $state({
    type: 'doc',
    content: [
      { type: 'paragraph', content: [{ type: 'text', text: 'Body text here.' }] }
    ]
  });
</script>

<button onclick={() => editing = !editing}>
  {editing ? 'Done' : 'Edit'}
</button>

<h1><PlainText bind:value={title} {editing} /></h1>
<div><RichText bind:value={body} {editing} /></div>`;

export const LOW_LEVEL_WITH_ROOT = `<script lang="ts">
  import * as Editable from 'editable-kit';
  import { PlainText, RichText } from 'editable-kit/editors';
  import type { ProseMirrorJSON } from 'editable-kit';

  let editing = $state(false);
  let title: ProseMirrorJSON = $state({ ... });
  let body: ProseMirrorJSON = $state({ ... });

  async function handleSave(allData) {
    // Standalone editors register with their key
    const title = allData.get('title'); // { title: EditorContent }
    const body = allData.get('body');   // { body: EditorContent }
  }
</script>

<Editable.Root {editing} onsave={handleSave}>
  {#snippet children({ state, save })}
    <Toolbar {state} />
    <h1><PlainText bind:value={title} {editing} key="title" /></h1>
    <div><RichText bind:value={body} {editing} key="body" /></div>
    <button onclick={save}>Save</button>
  {/snippet}
</Editable.Root>`;

// API Reference examples
export const API_SAVE_RESULT = `\
// SaveResult is a Map<string, Record<string, EditorContent>>
// Each key matches a Data component's key prop

async function handleSave(data: SaveResult) {
  for (const [key, fields] of data) {
    for (const [name, content] of Object.entries(fields)) {
      if (content.type === 'text') {
        // content.content is ProseMirrorJSON
        await saveText(key, name, content.content);
      } else if (content.type === 'image-src') {
        // Image unchanged — content.src is the original URL
        await saveImageUrl(key, name, content.src, content.alt);
      } else if (content.type === 'image-blob') {
        // Image was cropped/replaced — content.blob is the new image
        const url = await uploadBlob(content.blob);
        await saveImageUrl(key, name, url, content.alt);
      }
    }
  }
}`;

export const API_EDITOR_CONTENT = `\
// EditorContent is a discriminated union:

type EditorContent =
  | { type: 'text'; content: ProseMirrorJSON }
  | { type: 'image-src'; src: string; alt: string }
  | { type: 'image-blob'; blob: Blob; alt: string };

// Use the type field to narrow:
if (content.type === 'text') {
  content.content // ProseMirrorJSON
} else if (content.type === 'image-blob') {
  content.blob // Blob — upload this
}`;

export const API_EDITABLE_STATE = `\
// Access EditableState from Root's children snippet
<Editable.Root editing={true}>
  {#snippet children({ state })}
    {#if state}
      <!-- Check what's focused -->
      {state.isText}  <!-- boolean -->
      {state.isImage}  <!-- boolean -->

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
      <button onclick={() => state.text(
        (editor) => editor.chain().focus().toggleItalic().run()
      )}>Italic</button>

      <!-- Image controls (when isImage is true) -->
      {#if state.isImage}
        <button onclick={() => state.replaceImage()}>Replace</button>
        <input value={state.getImageAlt()}
          oninput={(e) => state.setImageAlt(e.currentTarget.value)} />
      {/if}
    {/if}
  {/snippet}
</Editable.Root>`;

export const API_EACH_COMPONENT = `\
<!-- Editable.Each manages arrays of items -->
<Editable.Each key="notes" data={notes} onsave={(items) => {
  // items is EditorSaveData<Note>[]
  items.forEach((item, i) => {
    if (item.title.type === 'text') notes[i].title = item.title.content;
    if (item.body.type === 'text') notes[i].body = item.body.content;
  });
}}>
  {#snippet each(item, index, { text, multiline })}
    <div class="rounded-lg border p-4">
      <h3>{@render text('title')}</h3>
      <div>{@render multiline('body')}</div>
    </div>
  {/snippet}
</Editable.Each>`;

export const API_DATA_ONSAVE = `\
<!-- Per-section onsave on Data components -->
<Editable.Data key="profile" data={profile} onsave={(d) => {
  // d is EditorSaveData<typeof profile>
  // Type-safe: d.name is { type: 'text', content: ProseMirrorJSON }
  if (d.name.type === 'text') profile.name = d.name.content;
  if (d.avatar.type === 'image-blob') {
    uploadImage(d.avatar.blob).then(url => profile.avatar.src = url);
  }
}}>
  {#snippet children({ text, image })}
    <h2>{@render text('name')}</h2>
    {@render image('avatar', { maxWidth: 200, maxHeight: 200, aspect: 1 })}
  {/snippet}
</Editable.Data>`;

// Array page examples
export const ARRAY_BASIC = `\
<script lang="ts">
  import * as Editable from 'editable-kit/editable';
  import type { ProseMirrorJSON } from 'editable-kit';

  type Note = { title: ProseMirrorJSON; body: ProseMirrorJSON };

  let editing = $state(false);
  let notes: Note[] = $state([
    {
      title: { type: 'doc', content: [{ type: 'text', text: 'First Note' }] },
      body: {
        type: 'doc',
        content: [{ type: 'paragraph',
          content: [{ type: 'text', text: 'Content here.' }] }]
      }
    }
  ]);
</script>

<Editable.Root {editing}>
  {#snippet children({ save })}
    <Editable.Each key="notes" data={notes} onsave={(items) => {
      items.forEach((item, i) => {
        if (item.title.type === 'text') notes[i].title = item.title.content;
        if (item.body.type === 'text') notes[i].body = item.body.content;
      });
    }}>
      {#snippet each(item, index, { text, multiline })}
        <div class="border rounded-lg p-4">
          <h3>{@render text('title')}</h3>
          <div>{@render multiline('body')}</div>
        </div>
      {/snippet}
    </Editable.Each>
  {/snippet}
</Editable.Root>`;

export const ARRAY_ADD_REMOVE = `\
<script lang="ts">
  // ... type Note and imports ...

  function addNote() {
    notes = [...notes, {
      title: { type: 'doc', content: [{ type: 'text', text: 'New Note' }] },
      body: {
        type: 'doc',
        content: [{ type: 'paragraph',
          content: [{ type: 'text', text: '' }] }]
      }
    }];
  }

  function removeNote(index: number) {
    notes = notes.filter((_, i) => i !== index);
  }
</script>

<Editable.Root {editing}>
  {#snippet children({ save })}
    <Editable.Each key="notes" data={notes}>
      {#snippet each(item, index, { text, multiline })}
        <div class="border rounded-lg p-4 relative">
          {#if editing}
            <button onclick={() => removeNote(index)}
              class="absolute top-2 right-2">&times;</button>
          {/if}
          <h3>{@render text('title')}</h3>
          <div>{@render multiline('body')}</div>
        </div>
      {/snippet}
    </Editable.Each>
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
  <Editable.Root {editing}>
    {#snippet children({ save })}
      <Editable.Data key="themed" data={data}>
        {#snippet children({ text, image })}
          <h2>{@render text('title')}</h2>
          {@render image('cover', { maxWidth: 800, aspect: 16/9 })}
        {/snippet}
      </Editable.Data>
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
    --ek-focus-ring-width: 1px;
    --ek-placeholder-color: #6b7280;
    --ek-placeholder-font-style: normal;
    --ek-image-placeholder-color: #6b7280;
    --ek-image-placeholder-bg: #1e293b;
    --ek-crop-overlay-color: rgba(0, 0, 0, 0.7);
    --ek-crop-grid-color: rgba(255, 255, 255, 0.3);
    --ek-crop-grid-width: 1px;
  }
}`;

export const THEMING_ALL_VARIABLES = `\
/* All available CSS custom properties */
.my-editor {
  /* Text editors */
  --ek-placeholder-color: #94a3b8;        /* Placeholder text color */
  --ek-placeholder-font-style: italic;    /* Placeholder font style */

  /* Image editor */
  --ek-focus-ring-color: #6366f1;         /* Focus/hover ring color */
  --ek-focus-ring-width: 2px;             /* Focus/hover ring thickness */
  --ek-image-placeholder-color: #94a3b8;  /* Empty image placeholder text */
  --ek-image-placeholder-bg: #f1f5f9;    /* Empty image placeholder background */

  /* Image cropper */
  --ek-crop-overlay-color: rgba(0, 0, 0, 0.6);    /* Crop dark overlay */
  --ek-crop-grid-color: rgba(255, 255, 255, 0.4);  /* Crop grid line color */
  --ek-crop-grid-width: 2px;                       /* Crop grid line thickness */
}`;

export const THEMING_IMAGE_CUSTOM = `\
/* Custom image editor styling */
.gallery-editor {
  --ek-focus-ring-color: #f59e0b;
  --ek-focus-ring-width: 2px;
  --ek-image-placeholder-color: #9ca3af;
  --ek-image-placeholder-bg: #f3f4f6;
  --ek-crop-overlay-color: rgba(0, 0, 0, 0.7);
  --ek-crop-grid-color: rgba(255, 255, 255, 0.6);
  --ek-crop-grid-width: 2px;
}`;

// Patterns page examples
export const PATTERN_IMAGE_UPLOAD = `\
async function handleSave(data: SaveResult) {
  for (const [key, fields] of data) {
    for (const [name, content] of Object.entries(fields)) {
      if (content.type === 'image-blob') {
        // Upload the cropped image blob to your backend
        const formData = new FormData();
        formData.append('file', content.blob, 'image.webp');
        formData.append('alt', content.alt);

        const res = await fetch('/api/images/upload', {
          method: 'POST',
          body: formData
        });
        const { url } = await res.json();

        // Update local state with the new URL
        myData.image = { src: url, alt: content.alt };
      }
    }
  }
}`;

export const PATTERN_BACKEND_SAVE = `\
<script lang="ts">
  import * as Editable from 'editable-kit/editable';
  import type { SaveResult } from 'editable-kit';

  let editing = $state(false);

  async function handleSave(allData: SaveResult) {
    const payload: Record<string, unknown> = {};

    for (const [key, fields] of allData) {
      const section: Record<string, unknown> = {};
      for (const [name, content] of Object.entries(fields)) {
        if (content.type === 'text') {
          section[name] = content.content; // ProseMirrorJSON
        } else if (content.type === 'image-blob') {
          // Upload blob, get URL back
          const url = await uploadImage(content.blob);
          section[name] = { src: url, alt: content.alt };
        } else if (content.type === 'image-src') {
          section[name] = { src: content.src, alt: content.alt };
        }
      }
      payload[key] = section;
    }

    // Save to your backend
    await fetch('/api/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    editing = false;
  }
</script>

<Editable.Root {editing} onsave={handleSave}>
  <!-- your editors here -->
</Editable.Root>`;

export const PATTERN_LOCALSTORAGE = `\
// Working localStorage demo pattern
function loadData<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : fallback;
}

function saveData(key: string, data: unknown) {
  localStorage.setItem(key, JSON.stringify(data));
}

async function handleSave(allData: SaveResult) {
  for (const [key, fields] of allData) {
    const section: Record<string, unknown> = {};
    for (const [name, content] of Object.entries(fields)) {
      if (content.type === 'text') {
        section[name] = content.content;
      } else if (content.type === 'image-src') {
        section[name] = { src: content.src, alt: content.alt };
      } else if (content.type === 'image-blob') {
        // Convert blob to data URL for localStorage
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(content.blob);
        });
        section[name] = { src: dataUrl, alt: content.alt };
      }
    }
    saveData(key, section);
  }
}`;

export const PATTERN_ERROR_HANDLING = `\
async function handleSave(allData: SaveResult) {
  try {
    for (const [key, fields] of allData) {
      for (const [name, content] of Object.entries(fields)) {
        if (content.type === 'image-blob') {
          const url = await uploadImage(content.blob);
          // Update local state on success
          myData[name] = { src: url, alt: content.alt };
        }
      }
    }
    editing = false;
  } catch (error) {
    // Show error to user — don't exit editing mode
    console.error('Save failed:', error);
    showToast('Failed to save. Please try again.');
    // User can retry or cancel manually
  }
}`;

// Low-level expansion examples
export const LOW_LEVEL_CUSTOM_LAYOUT = `\
<script lang="ts">
  import * as Editable from 'editable-kit/editable';
  import { PlainText, RichText, EditableImage } from 'editable-kit/editors';
  import type { ProseMirrorJSON, ImageState } from 'editable-kit';

  let editing = $state(false);
  let title: ProseMirrorJSON = $state({
    type: 'doc',
    content: [{ type: 'text', text: 'Page Title' }]
  });
  let sidebar: ProseMirrorJSON = $state({
    type: 'doc',
    content: [{ type: 'paragraph',
      content: [{ type: 'text', text: 'Sidebar content' }] }]
  });
  let body: ProseMirrorJSON = $state({
    type: 'doc',
    content: [{ type: 'paragraph',
      content: [{ type: 'text', text: 'Main content' }] }]
  });
  let hero: ImageState = $state({ src: '/hero.jpg', alt: 'Hero image' });
</script>

<Editable.Root {editing}>
  {#snippet children({ state, save })}
    <!-- Editors can go anywhere in the layout -->
    <header>
      <h1><PlainText bind:value={title} {editing} key="title" /></h1>
      <EditableImage bind:value={hero} {editing} key="hero"
        maxWidth={1200} aspect={21/9} />
    </header>

    <div class="grid grid-cols-3 gap-8">
      <aside>
        <RichText bind:value={sidebar} {editing} key="sidebar" />
      </aside>
      <main class="col-span-2">
        <RichText bind:value={body} {editing} key="body" />
      </main>
    </div>
  {/snippet}
</Editable.Root>`;

export const LOW_LEVEL_STANDALONE_FORM = `\
<script lang="ts">
  import { PlainText, MultilineText } from 'editable-kit/editors';
  import type { ProseMirrorJSON } from 'editable-kit';

  let name: ProseMirrorJSON = $state({
    type: 'doc',
    content: [{ type: 'text', text: '' }]
  });
  let bio: ProseMirrorJSON = $state({
    type: 'doc',
    content: [{ type: 'paragraph',
      content: [{ type: 'text', text: '' }] }]
  });

  // No Editable.Root needed — editors manage their own state
  // Values update on blur
</script>

<form>
  <label>
    Name
    <PlainText bind:value={name} editing={true} placeholder="Your name" />
  </label>
  <label>
    Bio
    <MultilineText bind:value={bio} editing={true}
      placeholder="Tell us about yourself" />
  </label>
</form>`;

// Extension expansion examples
export const EXT_CODE_BLOCK = `\
{@render rich('body', {
  extensions: async (defaults) => {
    const { CodeBlock } = await import('@tiptap/extension-code-block');
    return [...defaults, CodeBlock];
  }
})}`;

export const EXT_HIGHLIGHT = `\
{@render rich('body', {
  extensions: async (defaults) => {
    const { Highlight } = await import('@tiptap/extension-highlight');
    return [...defaults, Highlight.configure({ multicolor: true })];
  }
})}`;

export const EXT_BOLD_ONLY = `\
<!-- Restrict to bold only — no other formatting -->
{@render rich('body', {
  extensions: (defaults) => {
    // Filter to keep only structure + bold
    return defaults.filter(ext =>
      ['document', 'paragraph', 'text', 'history', 'bold']
        .includes(ext.name)
    );
  }
})}`;
