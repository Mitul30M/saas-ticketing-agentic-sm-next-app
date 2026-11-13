# Phase 2 — Customer portal (`/submit`)

Read: API guide §4.2, §9.1; PLAN §4.1. Safety: idempotency key per intent, duplicate-aware success.

## Checklist

- [x] `(portal)` layout: centred marketing-light shell, no sidebar, product name + reassurance.
- [x] Form fields with backend limits: `from_name` ≤ 200 optional, `from_email` required + regex
      `^[^@\s]+@[^@\s]+\.[^@\s]+$`, `subject` 1–200, `body` 1–10 000 with live counter.
- [x] Client-side validation mirrors backend intent; errors inline via `Field`/`FieldError`.
- [x] One `crypto.randomUUID()` in a ref per submit attempt; reused on retry, regenerated only
      after success or field change to a new intent.
- [x] Submit disabled + `Spinner` in flight; prevents double POST.
- [x] `201 duplicate:false` → success panel with ticket id + "a human reviews every request".
- [x] `201 duplicate:true` → "we already have this message", same id, no second-ticket claim.
- [x] `422` → map `detail[].loc[1]` (`subject`/`body`/`from_email`/`from_name`) to fields;
      string-detail 422 → inline alert.
- [x] `413` → "message too long"; `400` missing key → retry with same key once + alert;
      `409` + `Retry-After` → honour delay, same key; `503` → friendly backend-unavailable alert.
- [x] Empty/loading/error states; phone-width layout (≤ 380 px) verified.
- [x] No status polling, no customer-id field, no Markdown/HTML rendering, no operator cookie.

## Evidence / DoD

- Manual matrix rows 1–2: valid refund question → success + id; same body again → duplicate true,
  same id. Exercised at phone width.

## Commit

`phase-2: add idempotent customer submission portal`

## Runtime note (2026-11-13)

Verified against the running backend: row 1 returned a ticket id, row 2 returned
`duplicate: true` with the same id through `POST /api/submit`.
