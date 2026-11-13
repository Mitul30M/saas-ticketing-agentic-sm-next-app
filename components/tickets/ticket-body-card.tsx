import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TicketDetail } from "@/lib/api-types";

export function TicketBodyCard({ ticket }: { ticket: TicketDetail }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Customer message</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="max-h-96 overflow-y-auto whitespace-pre-wrap break-words pr-1 text-xs/relaxed leading-relaxed">
          {ticket.body}
        </p>
      </CardContent>
    </Card>
  );
}
