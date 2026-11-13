# Phase 9 — Docs + demo

Read: PLAN §14, §15; backend `docs/VERIFY.md`.

## Checklist

- [ ] `README.md`: what it is, architecture/trust boundary, env vars, run commands, screen map,
      known limits (demo auth, polling not SSE, no total count, no approvals history, no ticket
      mutations, eval lives in backend).
- [ ] `docs/DEMO_SCRIPT.md`: 3–5 minute path — submit → list → detail (citations, trace) →
      approvals (evidence → approve) → safe paths (not-in-KB, injection) → metrics.
- [ ] Cross-links to backend `docs/VERIFY.md`, `docs/EVAL_RESULTS.md`, `plans/backend-guide.MD`.
- [ ] `.env.local.example` finalised; no secrets committed.
- [ ] Final verification: `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build`, `pnpm vitest run`.
- [ ] Manual matrix rows 1–9 exercised against the running backend (or documented as blocked by
      backend availability, with the exact reason).
- [ ] `grep -r "demo-token" .next/static` → nothing; no `NEXT_PUBLIC_AGENT_TOKEN`; no
      `dangerouslySetInnerHTML`; no `middleware.ts`; no `pages/`.

## Evidence / DoD

- Clean clone + `pnpm install` + `.env.local` + `pnpm dev` reproduces the demo.
- Every matrix row has an actual result recorded (pass / blocked + why).

## Commit

`phase-9: document the console, demo path and known limits`
