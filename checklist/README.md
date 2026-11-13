# Build checklist — Nimbus agent console

Source of truth: `plans/PLAN.md` (scope + phases), `AGENTS.md` (how to work),
`plans/frontend-api-guide.MD` (route contract), `plans/backend-guide.MD` (backend behaviour).
This folder only **tracks execution**; it never overrides those documents.

## Order

| Order | File | PLAN phase | Commit prefix |
|---|---|---|---|
| 1 | `phase-0-groundwork.md` | Phase 0 | `phase-0: ...` |
| 2 | `phase-1-auth-proxy.md` | Phase 1 | `phase-1: ...` |
| 3 | `phase-2-portal.md` | Phase 2 | `phase-2: ...` |
| 4 | `phase-3-console-list.md` | Phase 3 | `phase-3: ...` |
| 5 | `phase-4-ticket-detail.md` | Phase 4 | `phase-4: ...` |
| 6 | `phase-5-approvals.md` | Phase 5 | `phase-5: ...` |
| 7 | `phase-6-metrics.md` | Phase 6 | `phase-6: ...` |
| 8 | `phase-7-kb-settings.md` | Phase 7 | `phase-7: ...` |
| 9 | `phase-8-a11y-perf.md` | Phase 8 | `phase-8: ...` |
| 10 | `phase-9-docs-demo.md` | Phase 9 | `phase-9: ...` |

## Working protocol (per phase)

1. Read the phase file top-to-bottom before writing code.
2. Read the relevant Next 16 doc in `node_modules/next/dist/docs/` for every version-sensitive
   pattern (routing, caching, proxy, route handlers). The shipped docs win.
3. Load the shadcn skill before composing screens or touching `components/ui/**`.
4. Implement one checklist item at a time. A checkbox is ticked only when the evidence exists.
5. Run `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build`; `pnpm vitest run` when helpers change.
6. **`git add .` only.** Never `git commit` / `git push`. Report the suggested message.
7. Move to the next phase only when the DoD line is satisfied.

## Hard rules carried through every phase

- `AGENT_TOKEN` server-only; never `NEXT_PUBLIC_*`, never in client props or errors.
- Backend repo is read-only. API calls only; no writes to its working tree.
- Every backend call goes through `app/api/console/[...path]/route.ts` or `app/api/submit/route.ts`.
- Allow-list excludes `admin/*`; unknown paths 404 at the proxy.
- Approve is a human click after action + amount/plan/draft + evidence render.
- Ticket text is plain text. No `dangerouslySetInnerHTML`, no Markdown for ticket content.
- `sent_reply` is the truth; the draft is a proposal.
- Flags/injection raise a banner, never remove the approver's ability to act.
- Tokens only from `app/globals.css`; no raw colours, no Radix, no second UI library.
- Backend has no `total`, no SSE, no auth accounts — the UI must not invent them.
