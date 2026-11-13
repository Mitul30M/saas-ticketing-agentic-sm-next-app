import { SendIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SentReply } from "@/lib/api-types";
import { formatDateTime, relative } from "@/lib/format";

export function SentReplyCard({ sentReply }: { sentReply: SentReply }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5">
          <SendIcon aria-hidden className="size-3.5 text-muted-foreground" />
          Sent reply
        </CardTitle>
        <CardDescription>
          This is what the customer received, not the draft.
        </CardDescription>
        <CardAction>
          <Badge variant="outline">Delivered</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="whitespace-pre-wrap break-words text-xs/relaxed leading-relaxed">
          {sentReply.body}
        </p>
        <p className="border-t pt-3 text-xs text-muted-foreground" title={formatDateTime(sentReply.delivered_at)}>
          Sent {relative(sentReply.delivered_at)} by{" "}
          <span className="font-medium text-foreground">{sentReply.approved_by}</span>
        </p>
      </CardContent>
    </Card>
  );
}
