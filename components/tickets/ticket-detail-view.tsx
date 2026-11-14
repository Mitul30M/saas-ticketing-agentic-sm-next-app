"use client";

import { useCallback, useState } from "react";
import { AlertTriangleIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BackendBanner } from "@/components/system/backend-banner";
import { usePolling } from "@/hooks/use-polling";
import type { Customer, TicketDetail, TraceResponse } from "@/lib/api-types";
import { apiFailure, clientGet } from "@/lib/client-api";
import { isTerminalStatus } from "@/lib/status";
import { latestToolErrorDetail } from "@/lib/trace";
import { ApprovalGatePanel } from "./approval-gate-panel";
import { CitationSheet } from "./citation-sheet";
import { DraftPanel } from "./draft-panel";
import { EscalationCard } from "./escalation-card";
import { InjectionBanner } from "./injection-banner";
import { ProposedActions } from "./proposed-actions";
import { SenderCard } from "./sender-card";
import { SentReplyCard } from "./sent-reply-card";
import { TicketBodyCard } from "./ticket-body-card";
import { TicketHeader } from "./ticket-header";
import { TraceTimeline } from "./trace-timeline";
import { TriageCard } from "./triage-card";

interface TicketSnapshot {
  ticket: TicketDetail;
  trace: TraceResponse;
}

export function TicketDetailView({
  initialTicket,
  initialTrace,
  customer,
}: {
  initialTicket: TicketDetail;
  initialTrace: TraceResponse;
  customer: Customer | null;
}) {
  const [citation, setCitation] = useState<string | null>(null);
  const ticketId = initialTicket.id;

  const fetcher = useCallback(
    async (signal: AbortSignal): Promise<TicketSnapshot> => {
      const [ticket, trace] = await Promise.all([
        clientGet<TicketDetail>(`tickets/${ticketId}`, signal),
        clientGet<TraceResponse>(`tickets/${ticketId}/trace`, signal),
      ]);
      return { ticket, trace };
    },
    [ticketId]
  );

  const polling = usePolling<TicketSnapshot>(fetcher, {
    intervalMs: (snapshot) =>
      snapshot && (snapshot.ticket.status === "new" || snapshot.ticket.status === "triaging")
        ? 2000
        : 10_000,
    enabled: (snapshot) => !snapshot || !isTerminalStatus(snapshot.ticket.status),
    initialData: { ticket: initialTicket, trace: initialTrace },
  });

  const snapshot = polling.data ?? { ticket: initialTicket, trace: initialTrace };
  const { ticket } = snapshot;
  const toolDetail = latestToolErrorDetail(snapshot.trace.items);
  const failure = apiFailure(polling.error);
  const backendDown = failure?.status === 401 || failure?.status === 503;
  const stale = polling.failures >= 2;

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-6">
        <TicketHeader ticket={ticket} onRefresh={polling.refresh} />

        <div className="sr-only" aria-live="polite">
          {polling.updatedAt ? <span key={polling.updatedAt}>Ticket updated</span> : null}
        </div>

        {backendDown && failure && (
          <BackendBanner status={failure.status} detail={failure.message} />
        )}

        {failure && !backendDown && (
          <Alert variant="destructive">
            <AlertTriangleIcon />
            <AlertTitle>Could not refresh this ticket</AlertTitle>
            <AlertDescription>{failure.message}</AlertDescription>
          </Alert>
        )}

        {!failure && polling.error && (
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

        {isTerminalStatus(ticket.status) && (
          <p className="text-xs text-muted-foreground">
            This ticket is {ticket.status === "resolved" ? "resolved" : "failed"}. Polling is
            paused; use refresh or the re-run button to check again.
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="flex flex-col gap-4 lg:col-span-5">
            <TicketBodyCard ticket={ticket} />
            <SenderCard ticket={ticket} customer={customer} />
          </div>

          <div className="flex flex-col gap-4 lg:col-span-4">
            <TriageCard ticket={ticket} />
            <InjectionBanner
              suspected={ticket.injection_suspected}
              flags={ticket.flags}
            />
            <EscalationCard ticket={ticket} toolDetail={toolDetail} />
            <DraftPanel ticket={ticket} onCitation={setCitation} />
            <ProposedActions actions={ticket.proposed_actions} onCitation={setCitation} />
          </div>

          <div className="flex flex-col gap-4 lg:col-span-3">
            <ApprovalGatePanel ticket={ticket} />
            {ticket.sent_reply && <SentReplyCard sentReply={ticket.sent_reply} />}
          </div>
        </div>

        <TraceTimeline events={snapshot.trace.items} />
        <CitationSheet kbId={citation} onClose={() => setCitation(null)} />
      </div>
    </TooltipProvider>
  );
}
