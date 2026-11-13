import { describe, expect, it } from "vitest";
import type { MetricsSummary } from "@/lib/api-types";
import {
  escalatedCount,
  escalationChartData,
  isStubMode,
  jobCounts,
  nodeLatencyData,
  pipelineCount,
  statusCount,
  statusChartData,
  totalCount,
} from "@/lib/metrics";

function metrics(overrides: Partial<MetricsSummary> = {}): MetricsSummary {
  return {
    tickets_by_status: [
      { status: "awaiting_approval", count: 1 },
      { status: "new", count: 2 },
      { status: "resolved", count: 4 },
    ],
    outcomes: [
      { outcome: "action_proposed", count: 4 },
      { outcome: "pending", count: 3 },
    ],
    trace: {
      events: 75,
      tokens_in: 0,
      tokens_out: 0,
      cost_usd: "0",
      avg_latency_ms: "16.0476190476190476",
      p95_latency_ms: 66.99999999999997,
      actual_cost_usd: 0,
      shadow_cost_usd: 0,
      shadow_price_model: "gpt-4o-mini",
      llm_cache_hit_rate: 0.3157894736842105,
      tool_error_rate: 0.16,
    },
    tickets_by_category: [],
    tickets_by_queue: [
      { queue: "billing", count: 9 },
      { queue: "general", count: 2 },
    ],
    escalations_by_reason: [
      { reason: "none", count: 10 },
      { reason: "DRAFT_REJECTED", count: 4 },
    ],
    node_latency: [
      { node: "kb_search", events: 13, avg_latency_ms: "69.0000000000000000", p95_latency_ms: 204.4 },
      { node: "triage", events: 13, avg_latency_ms: "1.5", p95_latency_ms: 3 },
    ],
    jobs: [
      { status: "done", count: 14 },
      { status: "failed", count: 2 },
    ],
    ...overrides,
  };
}

describe("metric counts", () => {
  it("sums and looks up statuses without inventing rows", () => {
    expect(totalCount(metrics().tickets_by_status)).toBe(7);
    expect(statusCount(metrics(), "new")).toBe(2);
    expect(statusCount(metrics(), "failed")).toBe(0);
    expect(pipelineCount(metrics())).toBe(2);
    expect(escalatedCount(metrics())).toBe(4);
  });

  it("fills missing job statuses with zero", () => {
    expect(jobCounts(metrics())).toEqual({ queued: 0, running: 0, done: 14, failed: 2 });
  });
});

describe("stub mode", () => {
  it("detects zero token usage", () => {
    expect(isStubMode(metrics())).toBe(true);
  });

  it("is false once tokens were spent", () => {
    const real = metrics();
    real.trace.tokens_in = 100;
    expect(isStubMode(real)).toBe(false);
  });
});

describe("chart data", () => {
  it("sorts statuses by count and labels them", () => {
    expect(statusChartData(metrics())[0]).toMatchObject({ status: "resolved", label: "Resolved" });
  });

  it("labels the `none` escalation pseudovalue", () => {
    const data = escalationChartData(metrics());
    expect(data[0]).toMatchObject({ reason: "none", label: "Not escalated" });
    expect(data[0].count).toBe(10);
  });

  it("normalises Postgres numeric strings and never yields NaN", () => {
    const data = nodeLatencyData(metrics());
    expect(data[0]).toMatchObject({ node: "kb_search", avg: 69, p95: 204.4 });
    for (const row of data) {
      expect(Number.isNaN(row.avg)).toBe(false);
      expect(Number.isNaN(row.p95)).toBe(false);
    }
  });

  it("turns invalid numerics into zero instead of NaN", () => {
    const broken = metrics({
      node_latency: [
        { node: "bad", events: 1, avg_latency_ms: "not-a-number", p95_latency_ms: Number.NaN },
      ],
    });
    expect(nodeLatencyData(broken)).toEqual([{ node: "bad", avg: 0, p95: 0, events: 1 }]);
  });
});
