# Phase 4 — Ticket detail (the main screen)

Read: API guide §4.4–4.6, §5, §9.3–9.4; PLAN §4.3. Safety: plain-text ticket body, evidence first.

## Checklist

- [x] Server first paint: ticket + trace (+ customer when `customer_id`) inside `Suspense`;
      client detail view polls 2 s while `new`/`triaging`, else 10 s.
- [x] Header: subject, status badge, priority, queue, `received_at`, re-run button.
- [x] Sender card: `from_name`, `from_email`, customer plan/status/external ref when present;
      honest "unknown sender" state when `customer_id` is null.
- [x] Body card: pre-wrapped plain text; no HTML/Markdown; no content-derived labels/navigation.
- [x] Triage chips with `triage_reasons` tooltips (category/priority/sentiment).
- [x] Injection banner when `injection_suspected || flags.length > 0`, lists flags, says the agent
      will not act without a human; Approve stays possible.
- [x] Escalation card: friendly `escalationCopy` + raw code chip; unknown codes shown raw.
- [x] `kb_supported === false` + draft → "not grounded in the KB" warning.
- [x] Draft panel: `draft_reply` as text, `[KB-xxx]` → clickable buttons opening citation sheet;
      "not sent — awaiting a human" label; no draft → normal "needs a human" state.
- [x] Citation sheet (right-side Sheet, works at phone width): `GET /kb/articles/{id}`, title/category/updated/Markdown via
      `react-markdown` + `remark-gfm` (no raw HTML), module-level cache, 404-safe id display.
- [x] Proposed action cards: kind, status, currency amount, invoice/plan ids + effective,
      `evidence` as definition list with `kb_ids` chips; unknown evidence keys shown generically.
- [x] `sent_reply`: "Sent {relative} by {approved_by}" with exact body; visually distinct from draft.
- [x] Trace timeline grouped by `trace_id`, collapsible, node/kind/status/duration/tokens/cost/error;
      stub-mode zeros labelled, not hidden.
- [x] Re-run: confirm `alert-dialog`, fresh idempotency key, hidden/disabled at `awaiting_approval`,
      `202` → poll, `409` → explain.
- [x] `not-found.tsx` for 404 and `error.tsx` for other failures at the segment.
- [x] Small components (≤ ~250 lines each), one per file.

## Evidence / DoD

- Matrix rows 4, 6, 7 pass. Every field in PLAN §4.3 is visible somewhere.
- No `dangerouslySetInnerHTML` in the repo; ticket body never rendered as Markdown.

## Commit

`phase-4: add grounded ticket detail with citations, evidence and trace`

## Runtime note (2026-11-13)

Verified against the running backend: detail renders triage, draft with `KB-006`, approval gate and
trace; the injection ticket shows the banner with `instruction_override` and no refund proposal; the
quantum-fax ticket is `awaiting_human` / `LOW_CONFIDENCE` with no draft. Re-run returned `202` on a
resolved ticket and `409 ticket already has an active run` on the pending one. The approval panel on
this screen links to the inbox; the decision itself lives there (Phase 5).
