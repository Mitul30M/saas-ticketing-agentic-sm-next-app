import Link from "next/link";
import { FileWarningIcon, InfoIcon, QuoteIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { TicketDetail } from "@/lib/api-types";
import { isAmendedRefusalDraft } from "@/lib/status";
import { DraftText } from "./draft-text";

export function DraftPanel({
  ticket,
  onCitation,
}: {
  ticket: TicketDetail;
  onCitation: (kbId: string) => void;
}) {
  const citations = ticket.draft_citations ?? [];
  const replyPending = ticket.status === "awaiting_approval" && Boolean(ticket.draft_reply);
  const amendedRefusal = isAmendedRefusalDraft(ticket);
  const draftBadge = amendedRefusal
    ? "Draft amended — action declined"
    : ticket.sent_reply
      ? "Draft — superseded"
      : "Not sent";

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5">
          <QuoteIcon aria-hidden className="size-3.5 text-muted-foreground" />
          Agent draft
        </CardTitle>
        <CardDescription>
          A proposal only. The customer has not received this text.
        </CardDescription>
        <CardAction>
          <Badge variant="outline">{draftBadge}</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {ticket.kb_supported === false && ticket.draft_reply && (
          <Alert variant="destructive">
            <FileWarningIcon />
            <AlertTitle>Not grounded in the knowledge base</AlertTitle>
            <AlertDescription>
              This draft exists even though grounding failed. Read it before acting.
            </AlertDescription>
          </Alert>
        )}

        {amendedRefusal && (
          <Alert>
            <InfoIcon />
            <AlertTitle>No proposal was created</AlertTitle>
            <AlertDescription>
              This draft was written before the action was attempted and then amended. Nothing is
              waiting for approval, and the customer has not received it.
            </AlertDescription>
          </Alert>
        )}

        {ticket.draft_reply ? (
          <DraftText text={ticket.draft_reply} onCitation={onCitation} />
        ) : (
          <p className="text-xs text-muted-foreground">
            No draft. The agent did not find enough grounded evidence to propose a reply.
          </p>
        )}

        {citations.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 border-t pt-3">
            <span className="text-[0.625rem] uppercase tracking-wide text-muted-foreground">
              Citations
            </span>
            {citations.map((citation) => (
              <Button
                key={citation}
                type="button"
                variant="outline"
                size="xs"
                className="font-mono"
                onClick={() => onCitation(citation)}
                aria-label={`Open citation ${citation}`}
              >
                {citation}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
      {replyPending && (
        <CardFooter className="border-t">
          <Button variant="outline" size="sm" render={<Link href={`/dashboard/approvals#ticket-${ticket.id}`} />}>
            Open the approval inbox
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
