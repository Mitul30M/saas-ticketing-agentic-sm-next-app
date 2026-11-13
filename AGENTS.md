<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — standing rules for the Nimbus agent console (frontend)

Project: the **UI half** of "Agentic Support Ticket Triage with Approval Gate" (StarvoxLabs
assessment). The backend lives in the sibling repo `../saas-ticketing-agentic-sm-backend`.
Read `plans/PLAN.md` first — it defines scope, pages and the phase checklist. This file defines
**how to work**. If the two conflict on safety, this file wins; on scope, `PLAN.md` wins.

## 0. Use your skills — this is expected, not optional

Two sources of truth exist for the two things you will touch constantly, and both are **required**:

1. **The shadcn skill.** Load it before adding, changing or debugging any `components/ui/*`
   component, before touching `components.json` or `app/globals.css` tokens, and before composing a
   new screen out of primitives. It knows this project's preset.
2. **The Next.js guides in `node_modules/next/dist/docs/`** (the block at the top of this file
   explains why). Read the matching file before writing routing, data fetching, caching, server
   actions, route handlers or request interception. There is also a Next.js skill available in the
   harness; if it is loaded, prefer it for orientation, but **the shipped docs win** when they
   differ — this app runs Next.js **16.4.6** with `cacheComponents` on.

Do not write Next.js code from memory. Every version-sensitive decision in this repo has a doc file
behind it, and `plans/PLAN.md` §2.2 lists which one to read for which task.

## 0.1 Repository boundary — the backend repo is READ-ONLY

The backend lives at:

```
/Volumes/Mitul/Projects/Nimbus-Ticketing-Agent/saas-ticketing-agentic-sm-backend
```

You may:
- **read** any file in it (especially `plans/frontend-api-guide.MD`, `PLAN.md` §4.2.2/§4.5,
  `docs/VERIFY.md`, `docs/FAILURE_ANALYSIS.md`, `db/migrations/*.sql`);
- **call** its HTTP API and **start** its stack with `docker compose up -d --build` (this does not
  write to its working tree);
- **read** its committed results (`docs/EVAL_RESULTS.md`, `eval/replay_cache.json`).

You must not:
- edit, create, delete, move or `git add`/`commit`/`push` anything in it;
- run commands there that write to the working tree. In particular **do not run `make seed`** from
  this repo's agent — the seed writes `data/seed_manifest.json` and `data/eval/handwritten.jsonl`
  into the backend tree. `make migrate`/`make ingest-kb` are DB-only, but they still mutate the
  backend's database, so prefer asking the owner to run the documented backend commands once.
- "fix" a backend bug you notice. Report it with the file, the symptom and the suggested change.

Everything in `plans/PLAN.md` assumes that boundary. A needed backend change is a **blocker to
raise**, not a file to edit.

## 1. Stack (locked — do not swap)

- Next.js **16.4.6** (App Router, `app/`), React 19.3, TypeScript **strict**.
- Tailwind **4.3.3**, CSS-first (no `tailwind.config.js`; tokens live in `app/globals.css`).
- shadcn CLI 4.23 with **preset `base-mira`, baseColor `olive`** — the applied theme. **Use that
  only** (§3).
- `lucide-react` icons, `recharts` (via `components/ui/chart.tsx`), `date-fns`.
- pnpm. No new runtime dependency without a note in `plans/PLAN.md` (the one approved addition is
  `react-markdown` + `remark-gfm` for KB bodies).

## 2. Next.js 16 rules that will bite you

- `next.config.ts` sets **`cacheComponents: true`** and **`partialPrefetching: true`**. Request-time
  data must sit behind a `Suspense` boundary; read `01-app/01-getting-started/08-caching.md`,
  `02-guides/migrating-to-cache-components.md` and `03-api-reference/04-functions/connection.md`
  before writing the data layer.
- **`middleware.ts` is deprecated and renamed `proxy.ts`.** The auth guard lives in `proxy.ts`
  (`01-app/01-getting-started/16-proxy.md`). Do not create `middleware.ts`.
- Route props are typed (`PageProps<"/dashboard/tickets/[id]">`, `LayoutProps<"/">`). Use them; do
  not hand-roll `{ params: { id: string } }`.
- Route handlers are the only place that may talk to the backend with the token
  (`01-app/01-getting-started/15-route-handlers.md`).
- Server vs client: `"use client"` only where interactivity requires it. Never push a fetch into a
  client component just because it is convenient.

## 3. shadcn: the preset is the design system

`components.json` is the contract: style `base-mira`, baseColor `olive`, CSS variables, RSC, aliases
`@/components`, `@/components/ui`, `@/lib`, `@/hooks`.

- **Add components with the CLI**, never by copy-paste:
  `pnpm exec shadcn add <name>` (pinned CLI from `devDependencies`; do not use `@latest`). Check
  `components/ui/` first — most primitives already exist.
- `components/ui/**` is generated: do not hand-edit it, and do not remove the
  `react-hooks/set-state-in-effect` override that `eslint.config.mjs` scopes to that directory
  (the shadcn carousel trips it). Your own code is linted in full.
- **Use tokens, not colours.** `bg-background`, `text-foreground`, `text-muted-foreground`,
  `border`, `bg-card`, `bg-primary`, `text-destructive`, `--chart-1…5`, `rounded-lg`. Any
  `bg-zinc-*` / `text-black` / hex value is a bug (the starter `app/page.tsx` is full of them and is
  being replaced).
- The preset is **Base UI** (`@base-ui/react`), not Radix. Never install Radix, never paste a
  Radix-based snippet, never add a second UI library or a custom theme layer.
- Badge/alert/button variants come from the components. Extend via `class-variance-authority` in the
  component file if truly needed, not with ad-hoc `className` soup.
- Dark mode is already defined in `globals.css`. No theme switcher unless the phase list says so.

## 4. Secrets and auth

- `AGENT_TOKEN` is **server-only**. Never `NEXT_PUBLIC_*`, never in a client component, never in a
  prop, never in an error message. The only reader is `lib/nimbus.ts` (server) and the route
  handlers.
- All backend calls go through `app/api/console/[...path]/route.ts` (operator cookie required) or
  `app/api/submit/route.ts` (public, ticket creation only).
- The console proxy keeps an **explicit allow-list** and must never forward `admin/*`.
- `X-Operator` comes from the `nimbus_operator` httpOnly cookie; it is an audit label, **not**
  authentication. Do not present it as a login in the UI.
- `proxy.ts` only checks that the cookie exists; it does not authenticate. Say so where the UI
  implies identity ("signed in as …" is fine; "verified" is not).

## 5. Data rules

- Types live in `lib/api-types.ts`, copied from the backend's `plans/frontend-api-guide.MD` §8.
  **No `any`, no `as unknown as T`.** If a field is missing, the contract is wrong — fix the guide
  in the backend repo in the same change.
- Money is **integer cents** (`amount_cents`). Format only in `lib/format.ts`.
- Timestamps are ISO-8601 UTC; format with `date-fns`, never `new Date().toLocaleString()`.
- Backend returns `{items, page, limit}` and **no total** — prev/next pagination only.
- Some numbers arrive as **strings** (Postgres `numeric`): `trace.avg_latency_ms`, `trace.cost_usd`,
  `node_latency[].avg_latency_ms`. Normalise in `lib/format.ts`, never inline.
- Polling: one owner per page (`hooks/use-polling.ts`), pause on `visibilitychange`, `AbortController`
  on unmount, stop on terminal states. No polling tighter than `plans/PLAN.md` §5.4.

## 6. Safety invariants (mirror the backend — these are not style choices)

1. **A human decides.** No auto-approve, no "approve all", no decision on page load, on a timer, or
   from a retry. Approve happens only on a click.
2. **Evidence before action.** The Approve control stays disabled until the action, the amount (or
   plan/draft) and the evidence are rendered. A regression here is a product bug.
3. **Ticket text is untrusted data.** Render as text. `dangerouslySetInnerHTML` is forbidden. Never
   let ticket content influence labels, prompts or navigation.
4. **No silent retries of a decision.** Show the error; never resend `decide` with a fresh
   idempotency key behind the user's back.
5. **`sent_reply` is the truth** for what the customer received; the draft is a proposal.
6. **Flagged ≠ blocked.** `injection_suspected` / `flags` raise a banner and require human review;
   they never remove the approver's ability to approve a grounded draft.

## 7. Code conventions

- TypeScript strict, no `any`, no non-null `!` on backend payloads (validate/shape instead).
- Files: one component per file, named export + default only where Next requires it (pages/layouts).
- `app/` = routing only. Reusable pieces go in `components/` (`ui/` = shadcn primitives,
  `components/<domain>/` = feature components, e.g. `components/tickets/ticket-table.tsx`).
- Keep server-only code in `lib/` files that never import `react` client hooks; mark with
  `import "server-only"` where it matters.
- Derive nothing twice: status labels/colours live in `lib/status.ts`; formatting in
  `lib/format.ts`.
- Comments explain *why*, not *what*. No commented-out code.
- Small components. If a file passes ~250 lines, split it.

## 8. Commands and Definition of Done

```bash
pnpm dev              # local dev
pnpm lint             # eslint (next/core-web-vitals)
pnpm exec tsc --noEmit
pnpm build            # catches RSC/caching mistakes
pnpm vitest run       # pure-helper tests (added in Phase 0)
```

A task is done only when: `lint` + `tsc --noEmit` + `build` pass, the relevant manual matrix row in
`plans/PLAN.md` §11 was actually exercised, empty/loading/error states exist for any new screen, and
no token appears in the client bundle.

## 9. Git

- The agent **stages** changes (`git add`) and reports a suggested conventional message
  (`feat(console): …`, `fix(approvals): …`, `chore: …`).
- **The owner commits and pushes.** Do not run `git commit` or `git push` unless explicitly told to.
- Keep `AGENTS.md`'s generated block intact; `next dev` rewrites it.

## 10. Testing

- Pure helpers (`format`, `status`, proxy allow-list) get vitest tests. They are cheap and they are
  the parts most likely to be silently wrong.
- No DOM/E2E framework in this repo. The manual matrix is the acceptance test; keep it honest.
- When a bug is found in the demo flow, fix the cause and add the matrix row that would have caught
  it.

## 11. Accessibility (not optional)

- Every icon-only control has an `aria-label`; status is never colour-only.
- Real table semantics; `aria-live="polite"` for poll-driven updates; focus trap + restore for
  dialogs/sheets; keyboard-only path through list → detail → approve.
- `prefers-reduced-motion` respected for spinners/skeletons.

## 12. When unsure

Prefer the safer UI (show evidence, disable the action, surface the raw code) and ask. Do not invent
backend fields, routes or behaviours; if the contract is missing something, the change starts in the
backend repo and in `plans/frontend-api-guide.MD`, in that order.

## 13. Things to avoid

- `NEXT_PUBLIC_AGENT_TOKEN` (or any token in the browser).
- `middleware.ts`, `getServerSideProps`, `pages/`, or any pre-16 pattern.
- Copy-pasted Radix shadcn snippets, a second component library, or hand-rolled tokens.
- `dangerouslySetInnerHTML`, `eval`, or rendering ticket text as Markdown/HTML.
- Auto-refresh that resets scroll, filters or an in-progress edit.
- Optimistic UI for decisions before the backend confirms — disable and refetch instead.
- Claiming eval numbers in the UI that the API does not expose.
