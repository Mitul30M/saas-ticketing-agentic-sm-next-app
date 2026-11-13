# Phase 3 — Console ticket list (`/dashboard`)

Read: API guide §3.6–3.7, §4.3, §9.2; PLAN §4.2, §5.4.

## Checklist

- [x] Server first paint: `GET /api/tickets` through `lib/nimbus.ts` inside `Suspense`
      (skeleton table fallback); client view seeded with initial data.
- [x] URL is the state: `?tab=awaiting_approval&q=refund&page=2&queue=&priority=`.
      Tabs: All / Needs approval / Needs human / Triaging / Resolved / Failed.
- [x] Search `q` debounced ~300 ms → `router.replace`; filter changes reset `page=1`.
- [x] Filter selects for queue + priority (only values the backend accepts).
- [x] Table: subject (+ sender email when the list contract provides it), status badge, queue,
      category, priority, sentiment, relative `received_at`, escalated marker.
      Real table semantics + caption; row click → detail; ↑/↓ + Enter keyboard support.
- [x] Pagination prev/next only; next disabled when `items.length < limit`; prev disabled at page 1;
      no total count rendered.
- [x] Empty states distinguish "no matches for this filter" (clear filters) from "no tickets yet".
- [x] 401/503 → backend banner; network → non-destructive alert with manual retry.
- [x] `hooks/use-polling.ts`: immediate run, 5 s interval, visibility pause/resume, abort previous +
      unmount, keep last good data, stale indicator after 2 failures, stop on hidden.
- [x] Background refresh never shows a spinner and never resets scroll/filters.
- [x] Header: title, operator chip, refresh button, approvals link with pending count.
- [x] `aria-live="polite"` announcement for poll updates (not per row).

## Evidence / DoD

- Matrix row 3: submitted ticket appears in "Needs approval" within 5 s.
- Tab switch is instant, shareable via URL, no layout shift.

## Commit

`phase-3: add polled ticket list with URL-driven filters`

## Runtime note (2026-11-13)

Verified against the running backend: the server-rendered list contains seeded tickets, the
`awaiting_approval` tab query returns the pending reply, and a newly submitted ticket appeared in
the list and reached `awaiting_human` with `LOW_CONFIDENCE` (stub/limited model path).
