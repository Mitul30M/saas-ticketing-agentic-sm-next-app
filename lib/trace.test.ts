import { describe, expect, it } from "vitest";
import type { TraceEvent } from "@/lib/api-types";
import { groupTrace, traceTokens } from "@/lib/trace";

function event(overrides: Partial<TraceEvent>): TraceEvent {
  return {
    trace_id: "run-1",
    node: "triage",
    kind: "llm",
    status: "ok",
    error: null,
    duration_ms: 10,
    tokens_in: 5,
    tokens_out: 7,
    cost_usd: "0",
    cache_hit: false,
    started_at: "2026-11-13T06:37:13Z",
    ...overrides,
  };
}

describe("groupTrace", () => {
  it("groups by trace id and keeps insertion order", () => {
    const groups = groupTrace([
      event({ node: "triage" }),
      event({ node: "kb_search", kind: "tool", duration_ms: 20, tokens_in: null }),
      event({ trace_id: "run-2", node: "triage" }),
    ]);
    expect(groups).toHaveLength(2);
    expect(groups[0].traceId).toBe("run-1");
    expect(groups[0].events.map((item) => item.node)).toEqual(["triage", "kb_search"]);
    expect(groups[0].totalDurationMs).toBe(30);
  });

  it("counts errors and tolerates empty traces", () => {
    const groups = groupTrace([event({ status: "error", error: "timeout" })]);
    expect(groups[0].errorCount).toBe(1);
    expect(groupTrace([])).toEqual([]);
  });
});

describe("traceTokens", () => {
  it("renders token counts only for LLM rows", () => {
    expect(traceTokens(event({}))).toBe("5 in / 7 out");
    expect(traceTokens(event({ tokens_in: null, tokens_out: null }))).toBeNull();
  });
});
