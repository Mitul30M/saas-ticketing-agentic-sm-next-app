# Backend guide — what the UI is talking to

> **Audience:** whoever designs and builds this Next.js app.
> **Purpose:** the backend's shape, behaviour and limits, so the UI models it honestly. The route
> contract itself is `<backend-repo>/plans/frontend-api-guide.MD`; this file is the "why and how".
> **Backend repo (READ-ONLY — do not modify):**
> ```
> /Volumes/Mitul/Projects/Nimbus-Ticketing-Agent/saas-ticketing-agentic-sm-backend
> ```
> Read it, call its API, start its stack. Do not edit, stage, commit or run file-writing commands
> there; if the UI needs a backend change, raise it with the owner and do it in a backend-repo
> session.

---

## 1. What it is, in one paragraph

A support-ticket agent for a fictional SaaS ("Nimbus"). Customers submit tickets; a background
worker runs a LangGraph agent that triages the ticket (category, priority, sentiment + reasons),
retrieves knowledge-base articles, checks that the retrieved evidence actually supports an answer,
drafts a **cited** reply, and **proposes** refunds or plan changes. It can never execute anything:
proposals are rows in `pending_approval`. A human decision over HTTP moves them forward through a
deterministic executor. Postgres holds business data, the KB vectors, the LangGraph checkpoints,
traces, jobs and an append-only audit log.

**The prime directive:** *the LLM proposes, deterministic code disposes.* Every safety property
lives in code and database constraints, never in a prompt.

---

## 2. Topology

```
browser ──► Next.js (this repo) ──► FastAPI :8000 ──► Postgres :5433
                                        │
                                        └─ jobs table ◄── worker (app/worker.py)
                                                             runs the graph, pauses at the gate
```

- The API **never** runs the agent inline. `POST /api/tickets` writes the row + a `jobs` row and
  returns in milliseconds.
- The worker claims jobs with `FOR UPDATE SKIP LOCKED`, so several workers are safe.
- Approving a reply is also a job (`resume_agent`): the paused graph is resumed with the decision.
- Everything the UI shows is a read of Postgres, except the trace and metrics aggregates.

---

## 3. The agent graph (what "triaging" actually does)

```
intake_validate → injection_screen → triage → plan → tool_executor → retrieve
   → grounding_check → draft_reply → propose_actions → approval_gate (interrupt)
   → [human decides] → record_decision → finalize
                 ↘ escalate → finalize        (any gate can divert here)
                 ↘ failure_handler → finalize (any node exception, step limit, retries exhausted)
```

| Node | What it decides | What the UI sees |
|---|---|---|
| `intake_validate` | body present, transport sender present | `BAD_TICKET`, no triage |
| `injection_screen` | pattern flags (override, role-play, fake SYSTEM, tool probe, identity claim) | `injection_suspected`, `flags` |
| `triage` | category, priority, sentiment + one-sentence reasons; queue is mapped in code | chips + `triage_reasons` |
| `plan` | refund / plan_change / reply branch, from the category | `expected_tools` in eval, not exposed |
| `tool_executor` | looks up customer/invoice/subscription; parses amount/target plan | tool rows in the trace |
| `retrieve` | hybrid BM25 + vector + RRF | `kb_search` trace row |
| `grounding_check` | gate 1 score, gate 0 uncovered category, gate 2 support check, gate 3 conflicts | `kb_supported`, `LOW_CONFIDENCE` |
| `draft_reply` | cites `[KB-xxx]`; rejects invented citations and promise language | `draft_reply`, `draft_citations` |
| `propose_actions` | inserts `pending_approval` rows | `proposed_actions` |
| `approval_gate` | `interrupt()` — pauses, persists | `status=awaiting_approval` |
| `escalate` | parks for a human with a reason code | `status=awaiting_human`, `escalation_reason` |

**Step limit:** an explicit `step_count` plus LangGraph's `recursion_limit`. Exhausting it lands in
`failure_handler` → `STEP_LIMIT`, never a crash.

---

## 4. Tools (all validated, all traced)

| Tool | Kind | Enforces |
|---|---|---|
| `lookup_customer` | read | identity from `tickets.from_email` **only**; duplicate email ⇒ ambiguous ⇒ fail closed |
| `get_invoice` | read | invoice must belong to the ticket sender |
| `get_subscription` | read | same ownership rule |
| `kb_search` | read | hybrid retrieval over KB chunks |
| `propose_refund` | **propose-only** | amount ≤ paid − already refunded; inside the 30-day window (vs `AS_OF`); invoice paid; one open refund per invoice; server-derived idempotency key |
| `propose_plan_change` | **propose-only** | target plan exists; not already on it; one open change per customer |
| `escalate_to_human` | control | sets the queue from the category |

A proposal is an **INSERT with `status='pending_approval'`**. There is no tool that can approve,
execute or send. That is why the UI's Approve button is the *only* path to an action.

Every tool returns `{ok, data | error{code, message, retryable}}` and never raises into the graph.
Codes: `invalid_input`, `not_found`, `ownership_mismatch`, `business_rule`, `duplicate`, `timeout`,
`internal`.

---

## 5. Grounding: why a draft exists or doesn't

A reply is drafted only if **all** hold:
1. best retrieval score ≥ τ (`GROUNDING_THRESHOLD`, calibrated on the dev split);
2. the category is not one the KB deliberately does not cover
   (`security_incident`, `feature_request` escalate in code, before the model is asked);
3. the support check maps every would-be claim to a retrieved `kb_id` and answers `supported=true`;
4. no contradicting sources (newest `updated` wins; still conflicting ⇒ escalate);
5. every `[KB-xxx]` in the draft is in the retrieved set, and the draft promises nothing
   (no "I have refunded", "your refund will be processed", …).

Otherwise the ticket escalates with a reason. **"Needs human" is a designed outcome, not an error** —
roughly one in five answerable tickets abstains even with a good model, and that is the safe
direction.

For the UI: a draft is a *proposal*, `kb_supported` may be `null` (grounding never ran), and
`escalation_reason` is an open string (unknown codes must still be shown).

---

## 6. State machines

**Ticket**

```
new → triaging → awaiting_approval → awaiting_human
                   │        │              │
                   └────────┴──────────────┴──► resolved
     triaging / awaiting_* ──────────────────► failed
resolved | failed | awaiting_human ──(POST /run)──► triaging
```

**Action (refund / plan change)**

```
pending_approval ──approve──► approved ──► executed
        └──────────reject───► rejected          (failed exists for executor errors)
```

Database triggers make `approved` impossible without an `approvals` row + `approved_by`, and
`executed` impossible without `executed_at`. The UI cannot shortcut this, and must not imply it did.

**Job:** `queued → running → done | failed`, with attempts and a lock timeout. A terminal failure
parks the ticket (`JOB_FAILED`).

---

## 7. Idempotency (and what it means for the UI)

Three layers:
1. **HTTP** — `Idempotency-Key` required on every mutating route. Same key + same body replays the
   stored response for 24 h; same key + different body is `422`; same key while in flight is `409`
   with `Retry-After`. Keys are scoped per `(key, endpoint)`.
2. **Business** — server-derived keys for refunds (`srv-…`), one open refund per invoice, one open
   plan change per customer, one final decision per action, one `outbox` row per approval. Replays
   are no-ops.
3. **LLM** — a content-addressed cache, so identical prompts are free and deterministic.

UI rules: generate a key **once per user intent** and reuse it on retry; never auto-retry a decision
with a new key; treat `409` as "someone else acted" and refetch.

---

## 8. Data model

Full column-level schema: `plans/PLAN.md` §6. Summary of the tables the UI reads:

| Table | Role |
|---|---|
| `tickets` | the queue: status, triage labels + reasons, draft, flags, escalation, sender |
| `refund_requests`, `plan_change_requests` | proposals with `evidence` and lifecycle status |
| `approvals` | the human decision (audit), one per action/draft |
| `outbox` | the simulated send (one row per approved reply) |
| `customers`, `plans`, `subscriptions`, `invoices`, `payments` | business context shown on detail |
| `trace_events` | per-node/tool/LLM timeline with tokens, duration, cache hit, error |
| `jobs` | queue state (useful for "is it still running?") |
| `kb_articles`, `kb_chunks` | KB browser + search |
| `audit_log` | append-only trail (not exposed over HTTP) |

Money is integer cents. Timestamps are `timestamptz` → ISO-8601 UTC in JSON. `evidence` is jsonb and
kind-dependent — render it as a definition list, never assume keys beyond `kb_ids`.

---

## 9. Async semantics (design the UI around this)

| Call | Returns | Then |
|---|---|---|
| `POST /api/tickets` | `201` + `ticket_id` | the ticket is `new`; **poll** until it leaves `new`/`triaging` (2 s) |
| `POST /api/tickets/{id}/run` | `202` + `job_id` | poll; the ticket returns to `triaging` |
| `POST …/decide` (send_reply) | `202` + `approval_id` | the **worker** resumes the graph and writes `outbox`; poll until `resolved` |
| `POST …/decide` (refund / plan_change) | `202` | the executor runs inline; the row is already `executed` when the response lands |

Consequences: never assert on the response body alone; `202` means *recorded*; a stale card is a
normal race; `409` is expected under two operators.

---

## 10. Auth, errors, limits

- **Auth:** one shared bearer token for every dashboard route (`AGENT_TOKEN`); unset ⇒ `503`.
  `X-Operator` is a free-text audit label, not authentication. No accounts, no roles, no per-user
  permissions.
- **Public:** `POST /api/tickets`, `/healthz`, `/docs`, `/openapi.json`.
- **Errors:** `{detail: string}` or `{detail: [{loc, msg, type}]}`. Both shapes exist; handle both.
- **Limits:** 64 KiB request cap (`413`), 10-min sender-scoped dedupe window, 30-day refund window,
  8k-token refusals from the model provider are *not* a UI concern but explain slow/failed runs.

---

## 11. Reason codes and flags (render friendly first, raw code second)

Escalation reasons: `BAD_TICKET`, `TICKET_NOT_FOUND`, `LOW_CONFIDENCE`, `CONFLICTING_SOURCES`,
`DRAFT_CITATION_INVALID`, `DRAFT_PROMISE_DENIED`, `DRAFT_REJECTED`, `NEEDS_HUMAN_JUDGEMENT`,
`STEP_LIMIT`, `TOOL_FAILURE`/`TOOL_ERROR`, `INTERNAL_ERROR`, `JOB_FAILED`, `AGENT_ESCALATED`, plus
lowercase tool codes (`ownership_mismatch`, `business_rule`, `duplicate`, `timeout`, …).

Flags: `instruction_override`, `system_prompt_marker`, `role_injection`, `identity_claim`,
`tool_probe`, and draft-level `edited_citation_invalid`, `edited_promise_language`.

`flags` is `[]` for a clean ticket. A flag raises a banner and forces human review; it never removes
the approver's ability to act.

---

## 12. Observability the UI can show

`GET /api/tickets/{id}/trace` — one row per node/tool/LLM/retry, with `duration_ms`, tokens,
`cost_usd` (string), `cache_hit`, `status`, `error`. This is the "what did the agent do" story and
the best evidence that the system is not a black box.

`GET /api/metrics/summary` — statuses, outcomes, escalations by reason, per-node latency, tool error
rate, LLM cache hit rate, actual vs shadow cost, job counts.

Not exposed: eval results, audit log, outbox list, approvals history, per-run grouping beyond
`trace_id`.

---

## 13. Evaluation (exists, offline)

`make eval` replays a captured real-model run against a 43-ticket hand-labelled set; `make eval-live`
captures a new one; `make eval-ablation` is the retrieval study; `make dev-triage` measures triage on
the dev split. Results are files in the backend repo (`docs/EVAL_RESULTS.md` is the committed
summary). **None of it is served over HTTP** — the metrics page must link to it, not invent it.

Headline (published capture, `openai/gpt-oss-120b`): triage category 0.976, tool-choice F1 0.961,
grounded replies 15/19 (15/15 when it drafted), escalation recall 0.889, **0 unapproved executions /
sends**. Two documented false answers (an account compromise routed to billing — fixed in code — and
generic advice for a not-in-KB product pair — open label policy).

---

## 14. Demo data (what you can show without inventing anything)

Seeded: 100+ customers across 4 plans, ~370 invoices, 16 hand-written edge tickets, 30 KB articles.
Deliberate scenarios: unknown sender, duplicate email, fully refunded invoice, partially refunded,
outside the 30-day window, amount over the remaining balance, failed payment, past-due subscription,
suspended account, annual plan, an invoice owned by a *different* customer, injection text, an
off-topic ask, and an ambiguous no-context ticket.

Known demo identity: `aaron.martinez.50@example.nimbus.test` (Aaron Martinez, `PLAN-STARTER`).

---

## 15. Running it locally (backend repo)

> **Run these from a backend-repo session, or ask the owner.** `make seed` writes
> `data/seed_manifest.json` and `data/eval/handwritten.jsonl` into that working tree, and the
> migrations/ingest mutate its database. The frontend agent may start the stack with
> `docker compose up -d --build` (no repo writes) and then only talk HTTP.

```bash
docker compose up -d --build db api worker     # or: AGENT_TOKEN=demo-token docker compose up -d
make migrate && make seed && make ingest-kb    # owner / backend session only
curl -sS localhost:8000/healthz
```

`LLM_PROVIDER=stub` (default) is deterministic plumbing: triage is always `invoice_question` and
drafts are canned text — good for UI work, **not** a demo of model quality. `LLM_PROVIDER=groq` with
`LLM_API_KEY` gives real drafts; free tiers cap at ~200k tokens/day and 8k/minute, so a handful of
tickets, not a load test.

`docs/VERIFY.md` in the backend repo is the operational runbook (every edge case with curl).

---

## 16. What the UI must never assume

- That `201`/`202` means the work is finished.
- That a pending action will still be pending when the user clicks (another operator may decide).
- That a draft will be sent as written (a human may edit it; `sent_reply` is the truth).
- That "not in KB" means "error" (it is a designed escalation).
- That the agent can be asked to do something by putting instructions in a ticket (it cannot).
- That any route outside the allow-list exists (`admin/*` may be unmounted).
- That the token can live in the browser.

---

## 17. Where to read more (backend repo)

| File | Why |
|---|---|
| `plans/frontend-api-guide.MD` | the route contract, field tables, TypeScript types |
| `PLAN.md` §4.2.2 | the schema, in DDL |
| `PLAN.md` §4.5 | grounding and abstention rules |
| `docs/VERIFY.md` | runbook: every route and edge case with captured output |
| `docs/FAILURE_ANALYSIS.md` | F1–F15: what actually fails and why (honest material for the UI copy) |
| `docs/EVAL_RESULTS.md` | the published evaluation table |
| `app/agent/graph.py`, `app/agent/nodes/*.py` | the graph, node by node |
| `db/migrations/*.sql` | the constraints that make the approval gate real |
