"use client";

import { useRef } from "react";
import type { KeyboardEvent } from "react";
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  CircleIcon,
  ClockIcon,
  LoaderCircleIcon,
  UserRoundCheckIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MetaBadge } from "@/components/console/meta-badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TicketListItem, TicketStatus } from "@/lib/api-types";
import { formatDateTime, relative, shortId } from "@/lib/format";
import { category, priority, queue, sentiment, ticketStatus } from "@/lib/status";

const STATUS_ICON: Record<TicketStatus, LucideIcon> = {
  new: CircleIcon,
  triaging: LoaderCircleIcon,
  awaiting_approval: ClockIcon,
  awaiting_human: UserRoundCheckIcon,
  resolved: CheckCircle2Icon,
  failed: AlertTriangleIcon,
};

export function TicketTable({
  items,
  onOpen,
}: {
  items: TicketListItem[];
  onOpen: (id: string) => void;
}) {
  const rows = useRef<Array<HTMLTableRowElement | null>>([]);

  function handleKey(event: KeyboardEvent<HTMLTableRowElement>, index: number, id: string) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen(id);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      rows.current[index + 1]?.focus();
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      rows.current[index - 1]?.focus();
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      rows.current[0]?.focus();
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      rows.current[items.length - 1]?.focus();
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableCaption className="sr-only">
          Tickets matching the current filters. Use arrow keys to move between rows and Enter to
          open one.
        </TableCaption>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead>Subject</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden md:table-cell">Queue</TableHead>
            <TableHead className="hidden lg:table-cell">Category</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead className="hidden lg:table-cell">Sentiment</TableHead>
            <TableHead>Received</TableHead>
            <TableHead>Flags</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((ticket, index) => {
            const status = ticketStatus(ticket.status);
            const queueValue = queue(ticket.queue);
            const priorityValue = priority(ticket.priority);
            const sentimentValue = sentiment(ticket.sentiment);

            return (
              <TableRow
                key={ticket.id}
                ref={(node) => {
                  rows.current[index] = node;
                }}
                tabIndex={0}
                className="cursor-pointer focus-visible:bg-muted/60 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/40 focus-visible:outline-none"
                onClick={() => onOpen(ticket.id)}
                onKeyDown={(event) => handleKey(event, index, ticket.id)}
                aria-label={`Open ticket ${shortId(ticket.id)}`}
              >
                <TableCell className="max-w-80 whitespace-normal">
                  <span className="line-clamp-1 font-medium">{ticket.subject}</span>
                  <span className="font-mono text-[0.625rem] text-muted-foreground">
                    {shortId(ticket.id)}
                  </span>
                </TableCell>
                <TableCell>
                  <MetaBadge meta={status} icon={STATUS_ICON[ticket.status]} />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {queueValue ? (
                    <MetaBadge meta={queueValue} />
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {category(ticket.category)}
                </TableCell>
                <TableCell>
                  {priorityValue ? (
                    <MetaBadge meta={priorityValue} />
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {sentimentValue ? (
                    <MetaBadge meta={sentimentValue} />
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell
                  className="text-muted-foreground"
                  title={formatDateTime(ticket.received_at)}
                >
                  {relative(ticket.received_at)}
                </TableCell>
                <TableCell>
                  {ticket.escalated ? (
                    <MetaBadge
                      meta={{ label: "Needs human", variant: "secondary" }}
                      icon={AlertTriangleIcon}
                    />
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
