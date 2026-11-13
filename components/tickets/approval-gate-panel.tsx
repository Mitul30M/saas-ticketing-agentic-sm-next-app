import Link from "next/link";
import { CheckCheckIcon, ClockIcon } from "lucide-react";
import { MetaBadge } from "@/components/console/meta-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { TicketDetail } from "@/lib/api-types";
import { actionStatus, approvalKind } from "@/lib/status";

export function ApprovalGatePanel({ ticket }: { ticket: TicketDetail }) {
  const pendingActions = ticket.proposed_actions.filter(
    (action) => action.status === "pending_approval"
  );
  const replyPending =
    ticket.status === "awaiting_approval" && Boolean(ticket.draft_reply) && !ticket.sent_reply;
  const history = ticket.proposed_actions.filter(
    (action) => action.status !== "pending_approval"
  );
  const pending = pendingActions.length > 0 || replyPending;

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5">
          <CheckCheckIcon aria-hidden className="size-3.5 text-muted-foreground" />
          Approval gate
        </CardTitle>
        <CardDescription>Nothing is executed or sent without a human click.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {pending ? (
          <>
            <ul className="flex flex-col gap-2">
              {replyPending && (
                <li className="flex items-center justify-between gap-2 rounded-md border bg-muted/30 px-2 py-1.5">
                  <MetaBadge meta={approvalKind("send_reply")} />
                  <span className="flex items-center gap-1 text-[0.625rem] text-muted-foreground">
                    <ClockIcon aria-hidden className="size-3" />
                    awaiting a human
                  </span>
                </li>
              )}
              {pendingActions.map((action) => (
                <li
                  key={`${action.kind}-${action.ref}`}
                  className="flex items-center justify-between gap-2 rounded-md border bg-muted/30 px-2 py-1.5"
                >
                  <MetaBadge meta={approvalKind(action.kind)} />
                  <span className="flex items-center gap-1 text-[0.625rem] text-muted-foreground">
                    <ClockIcon aria-hidden className="size-3" />
                    awaiting a human
                  </span>
                </li>
              ))}
            </ul>
            <Button
              variant="outline"
              size="sm"
              render={<Link href={`/dashboard/approvals#ticket-${ticket.id}`} />}
            >
              Review action and evidence
            </Button>
          </>
        ) : (
          <p className="text-xs text-muted-foreground">
            Nothing is waiting for a decision on this ticket.
          </p>
        )}

        {history.length > 0 && (
          <div className="border-t pt-3">
            <p className="mb-1.5 text-[0.625rem] uppercase tracking-wide text-muted-foreground">
              Decision history
            </p>
            <ul className="flex flex-col gap-1.5">
              {history.map((action) => (
                <li
                  key={`${action.kind}-${action.ref}`}
                  className="flex items-center justify-between gap-2 text-xs"
                >
                  <span>{approvalKind(action.kind).label}</span>
                  <MetaBadge meta={actionStatus(action.status)} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
