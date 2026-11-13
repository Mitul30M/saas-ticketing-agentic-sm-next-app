# Nimbus agent console

The UI half of **Agentic Support Ticket Triage with Approval Gate**. A customer files a ticket; a
LangGraph agent triages it, retrieves grounded knowledge-base evidence and **proposes** a reply or an
action; a human approves, edits or rejects it. Nothing is sent or executed without that human click.

This repository is the Next.js frontend only. The FastAPI backend, agent, worker and database live in
the sibling repository:

```
../saas-ticketing-agentic-sm-backend
```

The backend repository is **read-only** for this app. This app talks to it over HTTP through
server-side route handlers; no backend or database code lives here.

## Screens

| Route | Audience | Purpose |
|---|---|---|
| `/submit` | Customer | File a ticket; idempotent, duplicate-aware success state |
| `/login` | Operator | Set the audit-label cookie (not authentication) |
| `/dashboard` | Operator | Ticket list with URL-driven tabs, search, queue filter and pagination |
| `/dashboard/tickets/[id]` | Operator | Triage, draft with clickable citations, evidence, trace timeline, re-run |
| `/dashboard/approvals` | Operator | The approval inbox: approve / edit / reject with evidence on screen |
| `/dashboard/metrics` | Operator | Runtime status, outcomes, latency, cost, jobs |
| `/dashboard/kb` | Operator | Browse and full-text search the knowledge base |
| `/dashboard/settings` | Operator | Backend host, token presence, health, operator label, known limits |

A screenshot set is intentionally not committed; `docs/DEMO_SCRIPT.md` is the reproducible walkthrough.

## Trust boundary

```
browser ──(no token, ever)──► Next.js server ──(Bearer AGENT_TOKEN)──► FastAPI
                                   │  + X-Operator from the httpOnly cookie
                                   └─ explicit allow-list, no admin/*
```

- `AGENT_TOKEN` is server-only and is read only by `lib/nimbus.ts` and the route handlers.
- `/api/submit` is public and forwards only `POST /api/tickets`.
- `/api/console/[...path]` requires the operator cookie, enforces the allow-list in
  `lib/proxy-allowlist.ts`, adds `X-Operator`, passes `Idempotency-Key` through, and always uses
  `cache: "no-store"`.
- `proxy.ts` (Next 16's renamed middleware) only checks that the cookie exists. The label is an audit
  value, not a verified identity.

## Run it

### 1. Backend (sibling repo)

The owner runs migrations/seed/ingest there once:

```bash
# from ../saas-ticketing-agentic-sm-backend
docker compose up -d --build db api worker
curl -sS http://localhost:8000/healthz        # {"status":"ok"}
```

The frontend agent must not run `make seed` or write to that repository. Its `README.md`, `docs/VERIFY.md`
and `plans/frontend-api-guide.MD` are the operational source of truth.

### 2. Frontend

```bash
pnpm install
cp .env.local.example .env.local   # then fill in the values
pnpm dev                           # http://localhost:3000
```

`.env.local`:

| Variable | Example | Notes |
|---|---|---|
| `NIMBUS_API_URL` | `http://localhost:8000` | Server-side only. No trailing slash required. |
| `AGENT_TOKEN` | `demo-token` | Shared bearer token. Never `NEXT_PUBLIC_*`. |

If `AGENT_TOKEN` is missing, every console request returns a typed `503` and the UI shows a
"backend not configured" banner with a link to Settings.

### Commands

```bash
pnpm dev              # local development
pnpm lint             # eslint
pnpm typecheck        # tsc --noEmit
pnpm build            # production build (catches RSC/caching mistakes)
pnpm test             # vitest: pure helpers only
```

## Run with Docker

`Dockerfile` builds a production image and `../saas-ticketing-agentic-sm-backend/docker-compose.yml`
mounts it as the optional `web` service (a compose **profile**, so the backend still runs without
this repo). From the backend repo:

```bash
AGENT_TOKEN=demo-token docker compose --profile web up -d --build
# or: AGENT_TOKEN=demo-token make up-web
```

Then seed the backend once (`make migrate seed ingest-kb` in that repo) and open
<http://localhost:3000>.

Standalone image (bring your own backend URL):

```bash
docker build -t nimbus-console .
docker run --rm -p 3000:3000 \
  -e NIMBUS_API_URL=http://host.docker.internal:8000 \
  -e AGENT_TOKEN=demo-token \
  nimbus-console
```

Two build facts worth knowing: `NIMBUS_API_URL` and `AGENT_TOKEN` are **runtime** env (nothing is
baked, there are no `NEXT_PUBLIC_*` values), and the image does not need the API during `next build`
— request-time data sits behind Suspense boundaries, so `docker build` works with the backend down.

## How the data layer works

- `app/` is routing only. Feature components live in `components/<domain>/`; generated shadcn
  primitives stay in `components/ui/`.
- Server Components fetch the first paint through `lib/nimbus.ts` inside a `Suspense` boundary.
  `cacheComponents` and `partialPrefetching` are enabled in `next.config.ts`.
- Mutations go through the two route handlers, never from the browser directly.
- Live updates use `hooks/use-polling.ts`: immediate run, interval, visibility pause, abort on
  unmount and a stable loop (config lives in refs). List 5 s, approvals 8 s, detail 2 s while
  `new`/`triaging` else 10 s, metrics 20 s. Terminal tickets stop polling; manual refresh still works.
- Types in `lib/api-types.ts` mirror the backend API guide §8. Money is integer cents; Postgres
  `numeric` strings are normalised in `lib/format.ts` and `lib/metrics.ts`.

## Safety invariants in this UI

1. Approve is a human click only. No auto-approve, batch approve or timer.
2. The Approve control stays disabled until the action, amount/plan/draft and evidence are rendered
   (`lib/approvals.ts` gate). Missing evidence disables it and explains why.
3. Ticket text is plain text. No `dangerouslySetInnerHTML` for ticket/KB content; KB Markdown uses
   `react-markdown` without `rehype-raw`.
4. Decisions are never silently retried; 409 means someone else acted and the queue is refetched.
5. `sent_reply` is what the customer received; the draft is labelled as a proposal.
6. Injection flags raise a banner but never remove the approver's ability to act.

## Known limits (stated, not hidden)

- **Demo authentication.** Anyone can type any operator name. The backend has no accounts or roles;
  the label lands in `approvals.decided_by`, `outbox.approved_by` and `audit_log.actor`.
- **Polling, not SSE.** The backend exposes no event stream. Intervals are visibility-aware and stop
  at terminal states.
- **No total count.** `GET /api/tickets` returns `{items, page, limit}` only, so pagination is
  previous/next.
- **No approvals-history or outbox-list endpoint.** Detail shows action statuses and the latest
  `sent_reply`.
- **No ticket mutation API.** The console can re-run and decide; it cannot assign, close or reopen.
- **Eval results are offline.** The metrics page names `docs/EVAL_RESULTS.md` in the backend repo; it
  does not invent numbers.
- **Admin routes are excluded** from the proxy allow-list even when the backend mounts them.
- **Stub/limited model output.** Cost and draft quality depend on the backend's `LLM_PROVIDER`. In
  stub mode the cost card says so instead of claiming a saving.

## Verification

- `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm test` pass.
- Manual matrix results, including the backend-down check, are recorded in
  [`docs/MANUAL_MATRIX.md`](docs/MANUAL_MATRIX.md).
- The build checklist lives in [`checklist/`](checklist/README.md).

## Backend references

- Route contract: [`../saas-ticketing-agentic-sm-backend/plans/frontend-api-guide.MD`](../saas-ticketing-agentic-sm-backend/plans/frontend-api-guide.MD)
- Operational runbook: [`../saas-ticketing-agentic-sm-backend/docs/VERIFY.md`](../saas-ticketing-agentic-sm-backend/docs/VERIFY.md)
- Published eval: [`../saas-ticketing-agentic-sm-backend/docs/EVAL_RESULTS.md`](../saas-ticketing-agentic-sm-backend/docs/EVAL_RESULTS.md)
- Backend primer: [`../saas-ticketing-agentic-sm-backend/plans/backend-guide.MD`](../saas-ticketing-agentic-sm-backend/plans/backend-guide.MD)
