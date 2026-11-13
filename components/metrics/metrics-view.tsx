"use client";

import { useCallback } from "react";
import { AlertTriangleIcon, RefreshCwIcon } from "lucide-react";
import {
  CostCard,
  EvalCard,
  JobsCard,
  KpiRow,
  OutcomesCard,
} from "@/components/metrics/metrics-cards";
import {
  EscalationChartCard,
  NodeLatencyChartCard,
  StatusChartCard,
} from "@/components/metrics/metrics-charts";
import { BackendBanner } from "@/components/system/backend-banner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { usePolling } from "@/hooks/use-polling";
import type { MetricsSummary } from "@/lib/api-types";
import { apiFailure, clientGet } from "@/lib/client-api";
import {
  escalationChartData,
  nodeLatencyData,
  statusChartData,
} from "@/lib/metrics";

export function MetricsView({ initial }: { initial: MetricsSummary }) {
  const fetcher = useCallback(
    (signal: AbortSignal) => clientGet<MetricsSummary>("metrics/summary", signal),
    []
  );

  const { data, error, failures, updatedAt, refresh } = usePolling(fetcher, {
    intervalMs: 20_000,
    initialData: initial,
  });

  const metrics = data ?? initial;
  const failure = apiFailure(error);
  const backendDown = failure?.status === 401 || failure?.status === 503;
  const stale = failures >= 2;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Runtime metrics only. Refreshes every 20 seconds while this tab is visible.
        </p>
        <Button variant="outline" size="sm" onClick={refresh} aria-label="Refresh metrics">
          <RefreshCwIcon data-icon="inline-start" />
          Refresh
        </Button>
      </div>

      <div className="sr-only" aria-live="polite">
        {updatedAt ? <span key={updatedAt}>Metrics updated</span> : null}
      </div>

      {backendDown && failure && (
        <BackendBanner status={failure.status} detail={failure.message} />
      )}

      {failure && !backendDown && (
        <Alert variant="destructive">
          <AlertTriangleIcon />
          <AlertTitle>Could not refresh the metrics</AlertTitle>
          <AlertDescription>{failure.message}</AlertDescription>
        </Alert>
      )}

      {!failure && error && (
        <Alert variant="destructive">
          <AlertTriangleIcon />
          <AlertTitle>Could not reach the console proxy</AlertTitle>
          <AlertDescription>Check the app, then refresh.</AlertDescription>
        </Alert>
      )}

      {stale && (
        <p role="status" className="text-xs text-destructive">
          Showing the last successful result; refreshes are failing.
        </p>
      )}

      <KpiRow metrics={metrics} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <StatusChartCard data={statusChartData(metrics)} />
        <OutcomesCard metrics={metrics} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <EscalationChartCard data={escalationChartData(metrics)} />
        <NodeLatencyChartCard
          data={nodeLatencyData(metrics)}
          p95={metrics.trace.p95_latency_ms}
          avg={metrics.trace.avg_latency_ms}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <CostCard metrics={metrics} />
        <JobsCard metrics={metrics} />
      </div>

      <EvalCard />
    </div>
  );
}
