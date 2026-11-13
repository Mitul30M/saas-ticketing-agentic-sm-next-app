# Phase 6 — Metrics (`/dashboard/metrics`)

Read: API guide §4.13, §9.6; PLAN §4.5. Rule: no invented numbers, stub mode labelled.

## Checklist

- [x] Server first paint `GET /metrics/summary` inside `Suspense`; manual refresh; 20 s polling
      while visible (visibility pause).
- [x] KPI row: tickets by status, outcomes, jobs (counts only).
- [x] Escalation reasons bar: `none` → "not escalated"; unknown reasons shown raw.
- [x] Latency: `p95_latency_ms` overall + `node_latency` bar chart using `Number(avg_latency_ms)`.
- [x] Cost card: `actual_cost_usd` vs `shadow_cost_usd`, `shadow_price_model`, tokens in/out,
      cache-hit rate, tool-error rate.
- [x] Stub mode (`trace.tokens_in === 0`): label "stub mode: cost data is zero until a real model
      is configured". Never "$0.00 saved".
- [x] Eval card links to backend `docs/EVAL_RESULTS.md` as text only — no fake eval numbers.
- [x] Empty/loading/error states; charts have accessible summary text; no `NaN` anywhere.

## Evidence / DoD

- Matrix row 8: tiles + charts render; stub warning shown when tokens are 0; no NaN.

## Commit

`phase-6: add runtime metrics with stub-aware cost reporting`

## Runtime note (2026-11-13)

Verified against the running backend: KPI counts, status/escalation/node-latency data and
actual-vs-shadow cost render with no `NaN`. The environment now has non-zero token counts, so the
stub warning is correctly absent; `isStubMode` is unit-tested for the zero-token case. The eval card
names the backend path as text and does not assert a number.
