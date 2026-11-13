import { ArrowUpRightIcon, FlagIcon, ShieldQuestionIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Kbd } from "@/components/ui/kbd";
import type { TicketDetail } from "@/lib/api-types";
import { escalationCopy } from "@/lib/status";

export function EscalationCard({ ticket }: { ticket: TicketDetail }) {
  if (!ticket.escalation_reason) return null;
  const friendly = escalationCopy(ticket.escalation_reason);

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5">
          <FlagIcon aria-hidden className="size-3.5 text-muted-foreground" />
          Escalation
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <p className="flex items-start gap-1.5 text-xs">
          <ShieldQuestionIcon aria-hidden className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
          {friendly ?? "The agent parked this ticket with an unrecognised reason code."}
        </p>
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <span>Raw code</span>
          <Kbd className="font-mono">{ticket.escalation_reason}</Kbd>
          <Badge variant="outline">
            <ArrowUpRightIcon aria-hidden />
            Needs a human
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
