# Phase 7 — KB browser + settings + state polish

Read: API guide §4.10–4.12; PLAN §4.6–4.7. Note: KB search is Postgres FTS for humans, not the
agent's retriever.

## Checklist

- [x] `/dashboard/kb`: master/detail split (list left, article right), browse `GET /kb/articles`.
- [x] Search `GET /kb/search?q=` only at ≥ 3 chars, 300 ms debounce, results as chunk hits with
      kb id + title + snippet; clearing search returns to browse.
- [x] Article view renders Markdown via `react-markdown` + `remark-gfm` (no raw HTML), with
      category/updated; safe loading/empty/404 states.
- [x] Explicit copy: "full-text search for humans — not what the agent retrieved".
- [x] `/dashboard/settings`: backend host only (no token), token configured yes/no, operator label
      with "audit label, not authentication", `/healthz` status, links to backend VERIFY/EVAL docs.
- [x] Route-level `loading.tsx`, `error.tsx`, `not-found.tsx` for every segment
      (portal, dashboard, ticket detail, approvals, metrics, kb, login).
- [x] Global not-found + global error with token-safe copy.
- [x] Skeleton/empty/error parity across all screens; no layout shift on refresh.

## Evidence / DoD

- `pnpm build` clean; every route has a defined loading, empty and error state.
- KB search under 3 chars never calls the backend; 422 handled.

## Commit

`phase-7: add KB browser, settings diagnostics and route-level states`

## Runtime note (2026-11-13)

Verified against the running backend: `/dashboard/kb` renders the index, the first article and the
"full-text search for humans" note; `/api/console/kb/search?q=refund window` returns hits and a
2-character query returns `422`. `/dashboard/settings` renders host, token-configured, health and
operator facts; the page contains no token value. Unknown console routes return the console 404.
Route-level loading/error files exist for portal, console, dashboard, ticket detail, approvals,
metrics, KB, settings and login, plus global not-found/error.
