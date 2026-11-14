import { AlertTriangleIcon, BoxesIcon, SparklesIcon, WrenchIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceLine,
  TraceTitle,
} from "@/components/ui/trace";
import type { TraceEvent, TraceKind } from "@/lib/api-types";
import { duration, formatDateTime, shortId, usd } from "@/lib/format";
import { groupTrace, traceTokens } from "@/lib/trace";
import { cn } from "@/lib/utils";

const KIND_ICON: Record<TraceKind, LucideIcon> = {
  node: BoxesIcon,
  tool: WrenchIcon,
  llm: SparklesIcon,
};

function EventRow({ event }: { event: TraceEvent }) {
  const Icon = event.status === "error" ? AlertTriangleIcon : KIND_ICON[event.kind] ?? BoxesIcon;
  const tokens = traceTokens(event);

  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-2">
      <span
        className={cn(
          "mt-0.5 flex size-4 items-center justify-center rounded-sm bg-muted text-muted-foreground",
          event.status === "error" && "bg-destructive/10 text-destructive"
        )}
      >
        <Icon aria-hidden className="size-3" />
      </span>
      <div className="min-w-0">
        <p className={cn("truncate font-medium", event.status === "error" && "text-destructive")}>
          {event.node}
        </p>
        <p className="truncate text-[0.625rem] text-muted-foreground">
          {event.kind} · {formatDateTime(event.started_at)}
          {event.error ? ` · ${event.error}` : ""}
        </p>
        {event.error_detail && (
          <p className="mt-0.5 break-words text-[0.625rem] text-destructive/90">
            {event.error_detail}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2 text-[0.625rem] tabular-nums text-muted-foreground">
        <span>{duration(event.duration_ms)}</span>
        {tokens && <span className="hidden sm:inline">{tokens}</span>}
        {event.cost_usd !== null && <span>{usd(event.cost_usd, 4)}</span>}
        {event.cache_hit && <Badge variant="outline">cache</Badge>}
      </div>
    </div>
  );
}

export function TraceTimeline({ events }: { events: TraceEvent[] }) {
  const groups = groupTrace(events);

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Trace</CardTitle>
        <CardDescription>
          What the agent actually did, grouped by run. One run per re-run.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {groups.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No trace events yet. The worker may still be starting this run.
          </p>
        ) : (
          <Trace>
            {groups.map((group, index) => (
              <TraceCollapsible key={group.traceId} defaultOpen={index === 0}>
                <TraceCollapsibleTrigger className="w-full">
                  <TraceLine className="w-full">
                    <TraceTitle>Run {shortId(group.traceId)}</TraceTitle>
                    <TraceDescription>
                      {group.events.length} events · {duration(group.totalDurationMs)}
                      {group.errorCount > 0 ? ` · ${group.errorCount} error` : ""}
                    </TraceDescription>
                  </TraceLine>
                </TraceCollapsibleTrigger>
                <TraceCollapsibleContent>
                  <div className="flex flex-col gap-2.5">
                    {group.events.map((event, eventIndex) => (
                      <EventRow key={`${group.traceId}-${eventIndex}-${event.node}`} event={event} />
                    ))}
                  </div>
                </TraceCollapsibleContent>
              </TraceCollapsible>
            ))}
          </Trace>
        )}
      </CardContent>
    </Card>
  );
}
