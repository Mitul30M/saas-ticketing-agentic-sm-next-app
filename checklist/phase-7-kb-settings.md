# Phase 7 — KB browser + settings + state polish

Read: API guide §4.10–4.12; PLAN §4.6–4.7. Note: KB search is Postgres FTS for humans, not the
agent's retriever.

## Checklist

- [ ] `/dashboard/kb`: master/detail split (list left, article right), browse `GET /kb/articles`.
- [ ] Search `GET /kb/search?q=` only at ≥ 3 chars, 300 ms debounce, results as chunk hits with
      kb id + title + snippet; clearing search returns to browse.
- [ ] Article view renders Markdown via `react-markdown` + `remark-gfm` (no raw HTML), with
      category/updated; safe loading/empty/404 states.
- [ ] Explicit copy: "full-text search for humans — not what the agent retrieved".
- [ ] `/dashboard/settings`: backend host only (no token), token configured yes/no, operator label
      with "audit label, not authentication", `/healthz` status, links to backend VERIFY/EVAL docs.
- [ ] Route-level `loading.tsx`, `error.tsx`, `not-found.tsx` for every segment
      (portal, dashboard, ticket detail, approvals, metrics, kb, login).
- [ ] Global not-found + global error with token-safe copy.
- [ ] Skeleton/empty/error parity across all screens; no layout shift on refresh.

## Evidence / DoD

- `pnpm build` clean; every route has a defined loading, empty and error state.
- KB search under 3 chars never calls the backend; 422 handled.

## Commit

`phase-7: add KB browser, settings diagnostics and route-level states`
