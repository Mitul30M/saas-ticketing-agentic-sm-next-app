import type { MetricsSummary, TicketStatus } from "@/lib/api-types";
import { numeric } from "@/lib/format";
import { ticketStatus } from "@/lib/status";

export interface StatusChartDatum {
  status: TicketStatus;
  label: string;
  count: number;
}

export interface EscalationChartDatum {
  reason: string;
  label: string;
  count: number;
}

export interface NodeLatencyDatum {
  node: string;
  avg: number;
  p95: number;
  events: number;
}

export function totalCount(rows: readonly { count: number }[]): number {
  return rows.reduce((total, row) => total + (Number.isFinite(row.count) ? row.count : 0), 0);
}

export function statusCount(metrics: MetricsSummary, status: TicketStatus): number {
  return metrics.tickets_by_status.find((row) => row.status === status)?.count ?? 0;
}

export function pipelineCount(metrics: MetricsSummary): number {
  return statusCount(metrics, "new") + statusCount(metrics, "triaging");
}

/** Stub mode is explicit in the API: no tokens were spent, so cost is not a result. */
export function isStubMode(metrics: MetricsSummary): boolean {
  return metrics.trace.tokens_in === 0 && metrics.trace.tokens_out === 0;
}

export function statusChartData(metrics: MetricsSummary): StatusChartDatum[] {
  return metrics.tickets_by_status
    .map((row) => ({
      status: row.status,
      label: ticketStatus(row.status).label,
      count: row.count,
    }))
    .sort((a, b) => b.count - a.count);
}

export function escalationChartData(metrics: MetricsSummary): EscalationChartDatum[] {
  return metrics.escalations_by_reason
    .map((row) => ({
      reason: row.reason,
      label: row.reason === "none" ? "Not escalated" : row.reason,
      count: row.count,
    }))
    .sort((a, b) => b.count - a.count);
}

/** Excludes the `none` pseudovalue: those tickets were not escalated. */
export function escalatedCount(metrics: MetricsSummary): number {
  return metrics.escalations_by_reason
    .filter((row) => row.reason !== "none")
    .reduce((total, row) => total + row.count, 0);
}

export function nodeLatencyData(metrics: MetricsSummary): NodeLatencyDatum[] {
  return metrics.node_latency
    .map((row) => ({
      node: row.node,
      avg: numeric(row.avg_latency_ms) ?? 0,
      p95: Number.isFinite(row.p95_latency_ms) ? row.p95_latency_ms : 0,
      events: row.events,
    }))
    .sort((a, b) => b.avg - a.avg);
}

export function jobCounts(
  metrics: MetricsSummary
): Record<"queued" | "running" | "done" | "failed", number> {
  const counts = { queued: 0, running: 0, done: 0, failed: 0 };
  for (const row of metrics.jobs) counts[row.status] += row.count;
  return counts;
}

export function queueChartData(metrics: MetricsSummary): Array<{ queue: string; count: number }> {
  return [...metrics.tickets_by_queue].sort((a, b) => b.count - a.count);
}
