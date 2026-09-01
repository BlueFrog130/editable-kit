# editable-kit × Cloudflare example

Admin + public site backed by **D1** (content records) and **R2** (assets), rendering either
**dynamically** or as **SSG**. Built on `@editable-kit/adapter-cloudflare`.

## Layout

- `/` — public site. Reads the `home` record from D1 and renders it with `Renderer` (no TipTap).
- `/admin` — dynamic editor. Loads the record, edits inline, saves via the content API.
  Image replacement is wired here with `pickFile` + `uploadAsset` — the library ships no
  toolbar, so this button is the example's own.
- `/assets/[key]` — R2, content-addressed. `key` is the file's SHA-256.
- `/api/content/[key]` — the content API, mounted on `platform.env`.

## Setup

```bash
# 1. Create the D1 database and paste its id into wrangler.jsonc (database_id)
wrangler d1 create editable-kit

# 2. Apply the schema locally (migrations/0001_init.sql)
pnpm db:migrate

# 3. Create the R2 bucket used for assets
wrangler r2 bucket create editable-kit-assets

# 4. Local secrets
cp .dev.vars.example .dev.vars   # sets ADMIN_TOKEN

# 5. Run
pnpm dev
```

Open `/admin`, click **Edit**, change the title or body, then **Save** — the record is upserted
in D1. Open `/` to see it rendered.

## How images are handled

Click the hero, hit **Replace image**, pick a file. The browser hashes it, `PUT`s it to
`/assets/<sha256>`, and points the field at that path; **Save** then writes a small JSON
record that mentions the path. Three things fall out of naming a file after its own contents:

- **Uploading twice is free.** The same file — re-picked, or already uploaded by someone else —
  hits the same key, and the route answers `200 {"deduped":true}` without transferring bytes.
- **A cache-forever header is honest.** `/assets/<hash>` can never mean different bytes, so it
  is served `immutable`, and repeat views come back `304` straight from R2's own conditional get.
- **Uploading is not a commitment.** Nothing is bound to the record until you save, so cancelling
  is free — see below.

The button acts on whichever field has focus, so it inserts into the body when the body is
focused instead.

## Cleaning up abandoned images

A user cancels an edit, or replaces the same image twice: those uploads are orphans. Rather
than trying to spot deletions, `asset_refs` is rewritten from the record's own JSON on every
save — derived state, so it cannot drift — and `sweepAssets` deletes what nothing references.

It never deletes on first sight. An asset uploaded a second ago and one orphaned a year ago
look identical, so the sweeper **marks** an unreferenced asset with the time it first saw it
that way, and only deletes on a later run once it has stayed unreferenced for the grace period
(7 days by default). An asset that gets referenced again in the meantime is unmarked, and its
clock restarts if it is ever orphaned again.

This example is on Pages, which has no Cron Triggers, so `/api/content/[key]` calls
`maybeSweepAssets` under `waitUntil` — at most one sweep a day, after the response, riding
along with editing. On Workers, delete that and add a `scheduled` handler instead:

```jsonc
// wrangler.jsonc
"triggers": { "crons": ["0 4 * * *"] }
```

```ts
// custom entrypoint
import handler from '../.svelte-kit/cloudflare/_worker.js';
import { sweepAssets } from '@editable-kit/adapter-cloudflare/gc';

export default {
	fetch: handler.fetch,
	scheduled: (_controller, env) => sweepAssets(env.DB, env.BUCKET)
};
```

## Serving assets in production

The `/assets/[key]` route exists so local dev needs no public bucket. In production, bind an
**R2 custom domain** and route `/assets/*` to it: the bytes then never touch a Worker, and
because records store the path and not an absolute URL, nothing in D1 changes when you do it.
Image variants come from `/cdn-cgi/image/` transformations in front of that domain — there is
no second storage backend to configure.

## Concurrent edits

The admin page loads a record's `version` and sends it back as `If-Match`. If someone else
saved in between, the write is refused with **409** instead of silently overwriting them.

## Rendering: dynamic (default) vs SSG

- **Dynamic** — `src/routes/+page.server.ts` has `prerender = false`; it reads D1 through the
  binding on every request. Simplest; content is always current.
- **SSG** — set `prerender = true` and change the load to fetch the deployed content API
  (`loadFromApi(HOME_KEY, { contentBase })`) instead of the binding. Then set `DEPLOY_HOOK_URL`
  so each admin save POSTs your Pages/Workers deploy hook and rebuilds the static public site.
  The admin + API routes stay dynamic; only the public pages are prerendered.

## Auth

Writes require `Authorization: Bearer <ADMIN_TOKEN>` (`bearerAuth`). This demo hands the token
to the authenticated admin page — **protect `/admin`** in production (Cloudflare Access, a
session, etc.). Better still, drop the token: `authorize` gets the whole `RequestEvent`, so
`(event) => !!event.locals.user` works once you have a session, and nothing secret reaches the
browser. Public reads are unauthenticated.
