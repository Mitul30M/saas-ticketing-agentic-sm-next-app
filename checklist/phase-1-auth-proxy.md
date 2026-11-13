# Phase 1 — Auth + proxy

Read: `01-app/01-getting-started/16-proxy.md`, `03-api-reference/03-file-conventions/proxy.md`,
`15-route-handlers.md`, `02-guides/authentication-with-cache-components.md`.

## Checklist

- [x] `proxy.ts` matches `/dashboard/:path*`; missing `nimbus_operator` → `/login?next=<path>`;
      existing cookie on `/login` → `/dashboard`. Cookie presence only, never "verified".
- [x] Server actions (`lib/auth-actions.ts`): `signIn` validates 1–100 chars, trimmed, no newlines,
      sets httpOnly / sameSite=lax / secure-in-prod `nimbus_operator`; `signOut` clears it.
- [x] `/login` page: single audit-label field, honest copy ("audit label, not a password"),
      error state, redirect to sanitised `next` or `/dashboard`.
- [x] `/logout` action reachable from the console shell.
- [x] `app/api/submit/route.ts` — public, forwards only `POST /api/tickets`, passes
      `Idempotency-Key`, no operator cookie, no token leak, status passthrough.
- [x] `app/api/console/[...path]/route.ts` — allow-list (`tickets`, `tickets/:id`,
      `tickets/:id/trace`, `tickets/:id/run`, `approvals/pending`,
      `approvals/:kind/:ref/decide`, `customers/:id`, `kb/articles`, `kb/articles/:id`,
      `kb/search`, `metrics/summary`); injects `Authorization` + `X-Operator` from cookie;
      passes `Idempotency-Key`; `no-store`; same-origin POST check; status/body passthrough;
      never `admin/*`.
- [x] `lib/nimbus.ts` reads token server-side; missing env → typed `ApiError` 503, never a crash.
- [x] `components/system/backend-banner.tsx` + `app/(console)/layout.tsx` scaffold:
      401/503 -> "backend token missing / not configured" banner linking to settings.
- [x] Console shell: sidebar nav (Dashboard, Approvals, Metrics, KB, Settings), operator chip
      ("signed in as …"), approvals pending count, mobile sheet, keyboard focus.

## Evidence / DoD

- curl console proxy without cookie → redirect/401 from proxy; with cookie → 200.
- `curl /api/console/admin/seed` → 404 from the allow-list (backend never called).
- `grep -r "demo-token" .next/static` → nothing.
- `git grep NEXT_PUBLIC_AGENT_TOKEN` → nothing.

## Commit

`phase-1: add operator session, auth guard and allow-listed API proxy`
