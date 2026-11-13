# Phase 6 — Metrics (`/dashboard/metrics`)

Read: API guide §4.13, §9.6; PLAN §4.5. Rule: no invented numbers, stub mode labelled.

## Checklist

- [ ] Server first paint `GET /metrics/summary` inside `Suspense`; manual refresh; 20 s polling
      while visible (visibility pause).
- [ ] KPI row: tickets by status, outcomes, jobs (counts only).
- [ ] Escalation reasons bar: `none` → "not escalated"; unknown reasons shown raw.
- [ ] Latency: `p95_latency_ms` overall + `node_latency` bar chart using `Number(avg_latency_ms)`.
- [ ] Cost card: `actual_cost_usd` vs `shadow_cost_usd`, `shadow_price_model`, tokens in/out,
      cache-hit rate, tool-error rate.
- [ ] Stub mode (`trace.tokens_in === 0`): label "stub mode: cost data is zero until a real model
      is configured". Never "$0.00 saved".
- [ ] Eval card links to backend `docs/EVAL_RESULTS.md` as text only — no fake eval numbers.
- [ ] Empty/loading/error states; charts have accessible summary text; no `NaN` anywhere.

## Evidence / DoD

- Matrix row 8: tiles + charts render; stub warning shown when tokens are 0; no NaN.

## Commit

`phase-6: add runtime metrics with stub-aware cost reporting`
