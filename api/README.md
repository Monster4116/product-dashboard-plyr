# `api`

This folder is for future server-side API entry points.

Purpose:

- receive requests from the frontend
- validate inputs
- apply access rules
- call backend services safely

In the long-term target architecture, the browser should ask this layer for dashboard data instead of making privileged database calls directly.

Important security boundary:

- this folder represents future server-side code, not static frontend code
- real secrets must live in a real server-side environment
- examples include a hosting provider, Supabase Edge Functions, Vercel functions, Netlify functions, Cloudflare Workers, or a future internal backend
- `service_role` keys must only live server-side
- static hosting alone is not a safe place for privileged secrets
- this is where auth, permissions, validation, and database adapter calls should happen
- frontend code must not import server-side code from this folder directly

This folder is intentionally documentation-only for now.
