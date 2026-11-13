# Phase 9 — Docs + demo

Read: PLAN §14, §15; backend `docs/VERIFY.md`.

## Checklist

- [x] `README.md`: what it is, architecture/trust boundary, env vars, run commands, screen map,
      known limits (demo auth, polling not SSE, no total count, no approvals history, no ticket
      mutations, eval lives in backend).
- [x] `docs/DEMO_SCRIPT.md`: 3–5 minute path — submit → list → detail (citations, trace) →
      approvals (evidence → approve) → safe paths (not-in-KB, injection) → metrics.
- [x] Cross-links to backend `docs/VERIFY.md`, `docs/EVAL_RESULTS.md`, `plans/backend-guide.MD`.
- [x] `.env.local.example` finalised; no secrets committed.
- [x] Final verification: `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build`, `pnpm vitest run`.
- [x] Manual matrix rows 1–9 exercised against the running backend (or documented as blocked by
      backend availability, with the exact reason).
- [x] `grep -r "demo-token" .next/static` → nothing; no `NEXT_PUBLIC_AGENT_TOKEN`; no
      `dangerouslySetInnerHTML`; no `middleware.ts`; no `pages/`.

## Evidence / DoD

- Clean clone + `pnpm install` + `.env.local` + `pnpm dev` reproduces the demo.
- Every matrix row has an actual result recorded (pass / blocked + why).

## Commit

`phase-9: document the console, demo path and known limits`

## Runtime note (2026-11-13)

`pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build` and `pnpm test` pass. Manual matrix rows 1–9 are
recorded in `docs/MANUAL_MATRIX.md`; row 9 was exercised by stopping the API container and reloading
`/dashboard` (friendly 503 banner, Settings `unavailable`, `/submit` still 200), then restarting it.
Security greps: no token in `.next/static`, no `NEXT_PUBLIC_AGENT_TOKEN`, no `dangerouslySetInnerHTML`
outside the generated chart style, no `middleware.ts`, no `pages/`, no `getServerSideProps`.
Lighthouse was unavailable (no Chrome); Phase 8 records the manual equivalent.
