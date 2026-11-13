# Phase 5 — Approval inbox (`/dashboard/approvals`)

Read: API guide §4.7–4.8, §9.5; PLAN §4.4. Safety: human click only, evidence before action.

## Checklist

- [ ] Server first paint `GET /api/approvals/pending` inside `Suspense`; cards grouped by ticket id.
- [ ] Client-side kind filter chips: all / send_reply / refund / plan_change (no server filter).
- [ ] Card order: kind + subject + ticket link → action → evidence → flags → actions.
      - refund: currency amount + invoice id
      - plan_change: from → to + effective
      - send_reply: draft text with citation links
- [ ] Approve `disabled` until kind + action + amount/plan/draft + evidence are rendered.
      Never enabled during load or from cached empty data. `canApprove` derived explicitly.
- [ ] Approve click → disable card immediately + `Spinner`; POST `decide` with `X-Operator` from
      cookie and a fresh idempotency key per click; then refetch pending + ticket.
- [ ] Edit dialog: textarea prefilled with draft, `edit` + `edited_text` (≤ 4000), note optional.
- [ ] Reject dialog: optional `note` (≤ 2000), zero sends expected.
- [ ] 202 means recorded, not done — keep polling / refetching until state settles.
- [ ] 409 (`a final decision already exists` / `ticket is not waiting…` / `target no longer pending`)
      → refetch + "someone else decided this", no retry loop.
- [ ] 422 inline (edit without text, approve with text, edit on refund/plan) → alert.
- [ ] 400 → operator cookie lost → route to `/login`.
- [ ] 8 s polling while visible; pause hidden; abort on unmount.
- [ ] Double-click cannot produce two decisions (button disables + single in-flight guard).
- [ ] Empty state: "nothing waiting for a human".

## Evidence / DoD

- Matrix row 5 via inbox: approve reply → card disables → ticket `resolved` → `sent_reply` shown.
- Reject leaves zero sends. Evidence is visually present before the button enables.

## Commit

`phase-5: add evidence-gated approval inbox for replies, refunds and plan changes`
