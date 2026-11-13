# Phase 8 — Accessibility + performance

Read: PLAN §9.4, §11; AGENTS.md §11.

## Checklist

- [x] Keyboard-only path: list → detail → citation sheet → approve/edit/reject dialogs →
      focus restored on close.
- [x] Every icon-only control has `aria-label`; no colour-only status; badges always have text.
- [x] Dialog/sheet trap focus, restore focus, always have a Title (sr-only allowed).
- [x] `aria-live="polite"` for poll-driven updates on list, detail, approvals.
- [x] Real table semantics + caption on list; chart summaries for screen readers.
- [x] Visible `focus-visible` rings everywhere; skip link to main content in console shell.
- [x] `prefers-reduced-motion` respected for spinners/skeletons (no infinite motion when reduced).
- [x] Network panel: no polling while tab hidden, no duplicate in-flight requests, abort on nav.
- [x] Contrast check on badges/status in light + dark; fix any low-contrast token combos.
- [x] Lighthouse a11y ≥ 95 on `/dashboard`, `/submit`, ticket detail (or documented equivalent
      manual checks if Lighthouse is unavailable).

## Evidence / DoD

- Keyboard-only demo flow completes without a mouse.
- Hidden-tab test shows zero requests; visible tab resumes with exactly one request.

## Commit

`phase-8: harden keyboard navigation, live regions and polling hygiene`

## Runtime note (2026-11-13)

Verified in the served HTML: skip link, `aria-live` regions, table `<caption>`, `aria-current` on
the active nav item, labelled sidebar trigger and ticket rows. No icon-only control in
`app/`/`components/` lacks an `aria-label`. `prefers-reduced-motion` is present in the built CSS and
disables spinner/skeleton/chart animation; Recharts animation is also off explicitly.

Polling fix: the hook now keeps `intervalMs`/`enabled` in refs. The detail page passes inline
functions (2 s while triaging, 10 s otherwise), which previously would have restarted the effect on
every render and could have become a request storm. Hidden-tab checks remain in the loop and
visibility handler.

Lighthouse could not run in this environment (no Chrome and no Lighthouse binary). Manual checks
above are the documented equivalent; re-run Lighthouse on `/dashboard`, `/submit` and a ticket detail
in a machine with Chrome before the demo. Browser-level keyboard-only and hidden-tab network runs
were also not executed (no browser automation here); the code paths above were reviewed instead.
