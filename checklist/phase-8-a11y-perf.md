# Phase 8 — Accessibility + performance

Read: PLAN §9.4, §11; AGENTS.md §11.

## Checklist

- [ ] Keyboard-only path: list → detail → citation sheet → approve/edit/reject dialogs →
      focus restored on close.
- [ ] Every icon-only control has `aria-label`; no colour-only status; badges always have text.
- [ ] Dialog/sheet trap focus, restore focus, always have a Title (sr-only allowed).
- [ ] `aria-live="polite"` for poll-driven updates on list, detail, approvals.
- [ ] Real table semantics + caption on list; chart summaries for screen readers.
- [ ] Visible `focus-visible` rings everywhere; skip link to main content in console shell.
- [ ] `prefers-reduced-motion` respected for spinners/skeletons (no infinite motion when reduced).
- [ ] Network panel: no polling while tab hidden, no duplicate in-flight requests, abort on nav.
- [ ] Contrast check on badges/status in light + dark; fix any low-contrast token combos.
- [ ] Lighthouse a11y ≥ 95 on `/dashboard`, `/submit`, ticket detail (or documented equivalent
      manual checks if Lighthouse unavailable).

## Evidence / DoD

- Keyboard-only demo flow completes without a mouse.
- Hidden-tab test shows zero requests; visible tab resumes with exactly one request.

## Commit

`phase-8: harden keyboard navigation, live regions and polling hygiene`
