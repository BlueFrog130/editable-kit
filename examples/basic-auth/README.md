# Basic Auth Example

A portfolio site built with [editable-kit](https://github.com/adamgiebl/editable-kit) demonstrating basic authentication for protected inline editing.

## Features

- Public portfolio page viewable by anyone
- Admin editing page protected by login
- Session-based auth using HMAC-signed cookies
- Defense-in-depth: both route-level and command-level auth checks

## Setup

1. Install dependencies:

   ```sh
   pnpm install
   ```

2. Copy the example env file and customize:

   ```sh
   cp .env.example .env
   ```

   Environment variables:

   | Variable        | Description                                           |
   | --------------- | ----------------------------------------------------- |
   | `AUTH_USERNAME` | Admin username                                        |
   | `AUTH_PASSWORD` | Admin password                                        |
   | `AUTH_SECRET`   | Secret key for signing session cookies (min 32 chars) |

3. Start the dev server:

   ```sh
   pnpm dev
   ```

4. Visit `http://localhost:5173` to see the public site, click "Edit" to log in.

   Default credentials: `admin` / `password`

## How It Works

1. **Public page** (`/`) — Displays the portfolio using `editable-kit` in read-only mode
2. **Login** (`/login`) — Form action validates credentials against env vars, sets an HttpOnly session cookie
3. **Admin** (`/admin`) — Protected by `hooks.server.ts`; enables inline editing with toolbar
4. **Save** — The `updateData` remote function verifies the session cookie before accepting mutations
5. **Logout** — Clears the session cookie and redirects to the public page
