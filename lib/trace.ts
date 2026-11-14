import type { TraceEvent } from "@/lib/api-types";

export interface TraceGroup {
  traceId: string;
  events: TraceEvent[];
  startedAt: string;
  totalDurationMs: number;
  errorCount: number;
}

/** One run per `trace_id` (a re-run starts a new group). Order is insertion order. */
export function groupTrace(events: readonly TraceEvent[]): TraceGroup[] {
  const groups = new Map<string, TraceEvent[]>();
  for (const event of events) {
    const bucket = groups.get(event.trace_id);
    if (bucket) bucket.push(event);
    else groups.set(event.trace_id, [event]);
  }

  return [...groups.entries()].map(([traceId, groupEvents]) => {
    let total = 0;
    let errors = 0;
    for (const event of groupEvents) {
      total += event.duration_ms ?? 0;
      if (event.status === "error") errors += 1;
    }
    return {
      traceId,
      events: groupEvents,
      startedAt: groupEvents[0]?.started_at ?? "",
      totalDurationMs: total,
      errorCount: errors,
    };
  });
}

export function traceTokens(event: TraceEvent): string | null {
  if (event.tokens_in === null && event.tokens_out === null) return null;
  return `${event.tokens_in ?? 0} in / ${event.tokens_out ?? 0} out`;
}

/** True when the row is a tool failure with a sentence to show. */
export function hasToolErrorDetail(event: TraceEvent): boolean {
  return (
    event.kind === "tool" &&
    event.status === "error" &&
    typeof event.error_detail === "string" &&
    event.error_detail.trim().length > 0
  );
}

/** The latest failed row's sentence, or null. One run per trace_id → call per group. */
export function latestToolErrorDetail(events: readonly TraceEvent[]): string | null {
  for (let index = events.length - 1; index >= 0; index -= 1) {
    const event = events[index];
    if (
      event.status === "error" &&
      typeof event.error_detail === "string" &&
      event.error_detail.trim().length > 0
    ) {
      return event.error_detail;
    }
  }
  return null;
}
