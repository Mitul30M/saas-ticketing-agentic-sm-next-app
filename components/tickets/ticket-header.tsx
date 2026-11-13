import { CalendarClockIcon, HashIcon } from "lucide-react";
import { MetaBadge } from "@/components/console/meta-badge";
import { Badge } from "@/components/ui/badge";
import type { TicketDetail } from "@/lib/api-types";
import { formatDateTime, relative, shortId } from "@/lib/format";
import { outcome, priority, queue, ticketStatus } from "@/lib/status";
import { RerunButton } from "./rerun-button";

export function TicketHeader({
  ticket,
  onRefresh,
}: {
  ticket: TicketDetail;
  onRefresh: () => void;
}) {
  const status = ticketStatus(ticket.status);
  const priorityValue = priority(ticket.priority);
  const queueValue = queue(ticket.queue);
  const outcomeValue = outcome(ticket.agent_outcome);

  return (
    <header className="flex flex-col gap-4 border-b pb-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <MetaBadge meta={status} />
            {priorityValue && <MetaBadge meta={priorityValue} />}
            {queueValue && <MetaBadge meta={queueValue} />}
            {outcomeValue && <MetaBadge meta={outcomeValue} />}
            {ticket.escalated && (
              <Badge variant="secondary">Escalated to a human</Badge>
            )}
          </div>
          <h1 className="max-w-3xl text-lg font-medium tracking-tight break-words">
            {ticket.subject}
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1" title={formatDateTime(ticket.received_at)}>
              <CalendarClockIcon aria-hidden className="size-3.5" />
              {relative(ticket.received_at)}
            </span>
            <span className="inline-flex items-center gap-1 font-mono">
              <HashIcon aria-hidden className="size-3.5" />
              {shortId(ticket.id)}
            </span>
            <span>{ticket.handled_by === "unassigned" ? "Unassigned" : `Handled by ${ticket.handled_by}`}</span>
          </div>
        </div>
        <RerunButton ticketId={ticket.id} status={ticket.status} onRefresh={onRefresh} />
      </div>
    </header>
  );
}
