# Cloudflare example

editable-kit on Workers. **Content JSON in D1, image bytes in R2** — three route handlers,
no adapter package.

| Route                   | What it does                                             |
| ----------------------- | -------------------------------------------------------- |
| `PUT /api/content`      | Upserts the page's JSON row in D1. Bearer `ADMIN_TOKEN`. |
| `POST /api/assets`      | Uploads an image to R2, keyed by its SHA-256. Same auth. |
| `GET /api/assets/[key]` | Streams it back, immutable-cached. Public.               |

`/` renders the content; `/admin` edits it in place. The admin token is entered once and
kept in `sessionStorage` — it only ever travels as an `Authorization` header.

The `content` table is `(key, json, updated_at)` with one row per page, keyed `'page'`
here. Every field is a ProseMirror document; they are stored together as one JSON blob,
which is what the editor binds to.

## Setup

```bash
wrangler d1 create editable-kit          # paste the id into wrangler.jsonc
wrangler r2 bucket create editable-kit-assets
pnpm db:migrate                          # --local; drop the flag for remote
echo 'ADMIN_TOKEN = "dev-token"' > .dev.vars   # local only, git-ignored
pnpm dev
```

Deploy:

```bash
wrangler d1 migrations apply editable-kit --remote
wrangler secret put ADMIN_TOKEN
pnpm build && pnpm deploy
```

## Notes

- Assets are content-addressed, so re-uploading the same file is free. Nothing deletes
  orphans — if that ever matters, add an R2 lifecycle rule rather than a sweeper.
- Images are served through the Worker. In production, bind an R2 custom domain and point
  `src` at it so the bytes skip the Worker entirely.
- The JSON blob is queried whole. Split fields into columns only if you ever need to
  query inside them — for rendering one page, one row is one read.
