import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MetaBadge } from "@/components/console/meta-badge";
import type { TicketDetail } from "@/lib/api-types";
import { category, priority, queue, sentiment, type StatusMeta } from "@/lib/status";

interface Chip {
  key: string;
  label: string;
  meta: StatusMeta;
  reason?: string;
}

export function TriageCard({ ticket }: { ticket: TicketDetail }) {
  const reasons = ticket.triage_reasons ?? {};
  const priorityValue = priority(ticket.priority);
  const queueValue = queue(ticket.queue);
  const sentimentValue = sentiment(ticket.sentiment);

  const chips: Chip[] = [
    {
      key: "category",
      label: "Category",
      meta: { label: category(ticket.category), variant: "outline" },
      reason: reasons.category,
    },
    ...(priorityValue
      ? [{ key: "priority", label: "Priority", meta: priorityValue, reason: reasons.priority }]
      : []),
    ...(sentimentValue
      ? [{ key: "sentiment", label: "Sentiment", meta: sentimentValue, reason: reasons.sentiment }]
      : []),
    ...(queueValue ? [{ key: "queue", label: "Queue", meta: queueValue }] : []),
  ];

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Triage</CardTitle>
        <CardDescription>Labels the agent chose for this ticket.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {chips.map((chip) =>
          chip.reason ? (
            <Tooltip key={chip.key}>
              <TooltipTrigger
                render={
                  <span
                    tabIndex={0}
                    className="rounded-full focus-visible:ring-2 focus-visible:ring-ring/40"
                    aria-label={`${chip.label}: ${chip.reason}`}
                  />
                }
              >
                <MetaBadge meta={chip.meta} />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">{chip.reason}</TooltipContent>
            </Tooltip>
          ) : (
            <MetaBadge key={chip.key} meta={chip.meta} />
          )
        )}
      </CardContent>
    </Card>
  );
}
