"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { EscalationChartDatum, NodeLatencyDatum, StatusChartDatum } from "@/lib/metrics";
import { numeric } from "@/lib/format";

const STATUS_CONFIG = {
  count: { label: "Tickets", color: "var(--chart-2)" },
} satisfies ChartConfig;

const ESCALATION_CONFIG = {
  count: { label: "Tickets", color: "var(--chart-3)" },
} satisfies ChartConfig;

const LATENCY_CONFIG = {
  avg: { label: "Average", color: "var(--chart-1)" },
  p95: { label: "p95", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function StatusChartCard({ data }: { data: StatusChartDatum[] }) {
  return (
    <Card size="sm" className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Tickets by status</CardTitle>
        <CardDescription>Every ticket the backend knows about, by current state.</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-xs text-muted-foreground">No tickets have been recorded yet.</p>
        ) : (
          <figure className="flex flex-col gap-2">
            <ChartContainer config={STATUS_CONFIG} className="aspect-auto h-52 w-full">
              <BarChart data={data} layout="vertical" margin={{ left: 4, right: 12 }}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" dataKey="count" allowDecimals={false} tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={110}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={4} isAnimationActive={false} />
              </BarChart>
            </ChartContainer>
            <figcaption className="sr-only">
              {data.map((row) => `${row.label}: ${row.count}`).join(". ")}
            </figcaption>
          </figure>
        )}
      </CardContent>
    </Card>
  );
}

export function EscalationChartCard({ data }: { data: EscalationChartDatum[] }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Escalations by reason</CardTitle>
        <CardDescription>
          &ldquo;Not escalated&rdquo; is the API&apos;s <code className="font-mono">none</code>{" "}
          pseudovalue. Unknown codes are shown raw.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-xs text-muted-foreground">No escalation data yet.</p>
        ) : (
          <figure className="flex flex-col gap-2">
            <ChartContainer config={ESCALATION_CONFIG} className="aspect-auto h-56 w-full">
              <BarChart data={data} layout="vertical" margin={{ left: 4, right: 12 }}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" dataKey="count" allowDecimals={false} tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={140}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={4} isAnimationActive={false} />
              </BarChart>
            </ChartContainer>
            <figcaption className="sr-only">
              {data.map((row) => `${row.label}: ${row.count}`).join(". ")}
            </figcaption>
          </figure>
        )}
      </CardContent>
    </Card>
  );
}

export function NodeLatencyChartCard({
  data,
  p95,
  avg,
}: {
  data: NodeLatencyDatum[];
  p95: number;
  avg: string;
}) {
  const safeP95 = Number.isFinite(p95) ? p95 : 0;
  const safeAvg = numeric(avg) ?? 0;

  return (
    <Card size="sm" className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Latency by node</CardTitle>
        <CardDescription>
          Overall p95 {Math.round(safeP95)} ms · average {safeAvg.toFixed(1)} ms. Postgres numeric
          strings are normalised before charting.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-xs text-muted-foreground">No node latency recorded yet.</p>
        ) : (
          <figure className="flex flex-col gap-2">
            <ChartContainer config={LATENCY_CONFIG} className="aspect-auto h-64 w-full">
              <BarChart data={data} layout="vertical" margin={{ left: 4, right: 12 }}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} unit=" ms" />
                <YAxis
                  type="category"
                  dataKey="node"
                  width={100}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="avg" fill="var(--color-avg)" radius={4} isAnimationActive={false} />
                <Bar dataKey="p95" fill="var(--color-p95)" radius={4} isAnimationActive={false} />
              </BarChart>
            </ChartContainer>
            <figcaption className="sr-only">
              {data
                .map((row) => `${row.node}: average ${row.avg.toFixed(1)} ms, p95 ${row.p95.toFixed(1)} ms`)
                .join(". ")}
            </figcaption>
          </figure>
        )}
      </CardContent>
    </Card>
  );
}
