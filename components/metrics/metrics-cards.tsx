import { BadgeCheckIcon, CircleDollarSignIcon, FlaskConicalIcon, ListChecksIcon } from "lucide-react";
import { MetaBadge } from "@/components/console/meta-badge";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Kbd } from "@/components/ui/kbd";
import type { MetricsSummary } from "@/lib/api-types";
import { count, percent, usd } from "@/lib/format";
import {
  escalatedCount,
  isStubMode,
  jobCounts,
  pipelineCount,
  statusCount,
} from "@/lib/metrics";
import { outcome } from "@/lib/status";

export function KpiRow({ metrics }: { metrics: MetricsSummary }) {
  const cards = [
    {
      label: "In the pipeline",
      value: pipelineCount(metrics),
      hint: "new + triaging",
    },
    {
      label: "Awaiting approval",
      value: statusCount(metrics, "awaiting_approval"),
      hint: "a human can act now",
    },
    {
      label: "Needs a human",
      value: statusCount(metrics, "awaiting_human"),
      hint: `${count(escalatedCount(metrics))} escalated`,
    },
    {
      label: "Resolved",
      value: statusCount(metrics, "resolved"),
      hint: `${count(statusCount(metrics, "failed"))} failed`,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} size="sm">
          <CardHeader>
            <CardDescription>{card.label}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-0.5">
            <p className="text-2xl font-medium tabular-nums">{count(card.value)}</p>
            <p className="text-[0.625rem] text-muted-foreground">{card.hint}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function OutcomesCard({ metrics }: { metrics: MetricsSummary }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Agent outcomes</CardTitle>
        <CardDescription>The result label, independent of ticket status.</CardDescription>
      </CardHeader>
      <CardContent>
        {metrics.outcomes.length === 0 ? (
          <p className="text-xs text-muted-foreground">No outcomes recorded yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {metrics.outcomes.map((row) => {
              const meta =
                row.outcome === "pending"
                  ? { label: "Pending", variant: "outline" as const }
                  : outcome(row.outcome);
              return (
                <li key={row.outcome} className="flex items-center justify-between gap-2">
                  {meta ? <MetaBadge meta={meta} /> : <span>{row.outcome}</span>}
                  <span className="font-mono text-xs tabular-nums">{count(row.count)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function CostCard({ metrics }: { metrics: MetricsSummary }) {
  const stub = isStubMode(metrics);

  return (
    <Card size="sm" className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5">
          <CircleDollarSignIcon aria-hidden className="size-3.5 text-muted-foreground" />
          Cost and model usage
        </CardTitle>
        <CardDescription>
          {stub
            ? "stub mode: cost data is zero until a real model is configured."
            : `Shadow cost prices the same tokens at ${metrics.trace.shadow_price_model}.`}
        </CardDescription>
        {stub && (
          <CardAction>
            <Badge variant="outline">stub mode</Badge>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md border bg-muted/30 p-3">
            <p className="text-[0.625rem] uppercase tracking-wide text-muted-foreground">
              Actual cost
            </p>
            <p className="font-mono text-lg">{usd(metrics.trace.actual_cost_usd)}</p>
          </div>
          <div className="rounded-md border bg-muted/30 p-3">
            <p className="text-[0.625rem] uppercase tracking-wide text-muted-foreground">
              Shadow cost
            </p>
            <p className="font-mono text-lg">{usd(metrics.trace.shadow_cost_usd)}</p>
            <p className="text-[0.625rem] text-muted-foreground">
              {metrics.trace.shadow_price_model}
            </p>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-4">
          <div className="flex flex-col gap-0.5">
            <dt className="text-muted-foreground">Tokens in</dt>
            <dd className="font-mono tabular-nums">{count(metrics.trace.tokens_in)}</dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-muted-foreground">Tokens out</dt>
            <dd className="font-mono tabular-nums">{count(metrics.trace.tokens_out)}</dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-muted-foreground">LLM cache hit</dt>
            <dd className="font-mono tabular-nums">{percent(metrics.trace.llm_cache_hit_rate)}</dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-muted-foreground">Tool error rate</dt>
            <dd className="font-mono tabular-nums">{percent(metrics.trace.tool_error_rate)}</dd>
          </div>
        </dl>

        {stub && (
          <p className="text-xs text-muted-foreground">
            The zeros are expected plumbing output, not a saving. Configure a real model in the
            backend before quoting cost.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function JobsCard({ metrics }: { metrics: MetricsSummary }) {
  const jobs = jobCounts(metrics);

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5">
          <ListChecksIcon aria-hidden className="size-3.5 text-muted-foreground" />
          Jobs
        </CardTitle>
        <CardDescription>Worker queue state for agent runs.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-2">
          {(["queued", "running", "done", "failed"] as const).map((status) => (
            <li key={status} className="flex items-center justify-between gap-2 text-xs">
              <span className="capitalize">{status}</span>
              <span className="flex items-center gap-2">
                {status === "failed" && jobs.failed > 0 && (
                  <Badge variant="destructive">attention</Badge>
                )}
                <span className="font-mono tabular-nums">{count(jobs[status])}</span>
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function EvalCard({ className }: { className?: string }) {
  return (
    <Card size="sm" className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5">
          <FlaskConicalIcon aria-hidden className="size-3.5 text-muted-foreground" />
          Evaluation lives in the backend repo
        </CardTitle>
        <CardDescription>
          Model quality is measured offline. It is not exposed over HTTP, so this page does not
          invent eval numbers.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 text-xs text-muted-foreground">
        <p>
          The published table is <Kbd className="font-mono">docs/EVAL_RESULTS.md</Kbd> in the
          backend repository; raw runs live under <Kbd className="font-mono">eval/</Kbd>.
        </p>
        <p className="flex items-center gap-1.5">
          <BadgeCheckIcon aria-hidden className="size-3.5" />
          Runtime metrics on this page come from the live API only.
        </p>
      </CardContent>
    </Card>
  );
}
