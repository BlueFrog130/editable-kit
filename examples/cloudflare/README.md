# editable-kit × Cloudflare example

Admin + public site backed by **D1** (content) and **R2 or Cloudflare Images** (images),
rendering either **dynamically** or as **SSG**. Built on `@editable-kit/cloudflare`.

## Layout

- `/` — public site. Reads the `home` record from D1 and renders it with `Renderer` (no TipTap).
- `/admin` — dynamic editor. Loads the record, edits inline, saves via the content API.
- `/api/[...path]` — the content API (`@editable-kit/cloudflare/server`) mounted on `platform.env`.

## Setup

```bash
# 1. Create the D1 database and paste its id into wrangler.jsonc (database_id)
wrangler d1 create editable-kit

# 2. Apply the schema locally (migrations/0001_init.sql)
pnpm db:migrate

# 3. Create the R2 bucket used for images
wrangler r2 bucket create editable-kit-images

# 4. Local secrets
cp .dev.vars.example .dev.vars   # sets ADMIN_TOKEN

# 5. Run
pnpm dev
```

Open `/admin`, click **Edit**, change the title/body/image, **Save**. The write uploads any
cropped image to R2 (served back through `/api/images/*`) and upserts the record in D1.
Open `/` to see it rendered.

## Image backend: R2 or Cloudflare Images

The backend is chosen explicitly in `src/routes/api/[...path]/+server.ts` — the library makes
no assumptions about your binding names.

- **R2 (default here):** pass the bucket instance as `images: env.BUCKET`. Images are stored
  and served back through this app's own `/api/images/:key` route (no public bucket domain
  needed). For a custom domain, set `imagePublicBase` in the config.
- **Cloudflare Images:** pass a store instead —
  `images: cloudflareImagesStore({ accountId, apiToken, deliveryUrl })`.

## Rendering: dynamic (default) vs SSG

- **Dynamic** — `src/routes/+page.server.ts` has `prerender = false`; it reads D1 through the
  binding on every request. Simplest; content is always current.
- **SSG** — set `prerender = true` and change the load to fetch the deployed content API
  (`loadFromApi(PUBLIC_API_URL, HOME_KEY)`) instead of the binding. Then set `DEPLOY_HOOK_URL`
  so each admin save POSTs your Pages/Workers deploy hook and rebuilds the static public site.
  The admin + API routes stay dynamic; only the public pages are prerendered.

## Auth

Writes require `Authorization: Bearer <ADMIN_TOKEN>` (`bearerAuth`). This demo hands the token
to the authenticated admin page — **protect `/admin`** in production (Cloudflare Access, a
session, etc.). Public reads are unauthenticated.
