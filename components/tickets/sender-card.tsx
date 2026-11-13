import { MailIcon, UserRoundIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Kbd } from "@/components/ui/kbd";
import type { Customer, TicketDetail } from "@/lib/api-types";

export function SenderCard({
  ticket,
  customer,
}: {
  ticket: TicketDetail;
  customer: Customer | null;
}) {
  const displayName =
    [customer?.first_name, customer?.last_name].filter(Boolean).join(" ") ||
    ticket.from_name ||
    "Unknown sender";

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Sender</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start gap-2">
          <UserRoundIcon aria-hidden className="mt-0.5 size-3.5 text-muted-foreground" />
          <div className="min-w-0">
            <p className="font-medium">{displayName}</p>
            <p className="flex items-center gap-1 break-all text-muted-foreground">
              <MailIcon aria-hidden className="size-3" />
              {ticket.from_email ?? "no transport sender"}
            </p>
          </div>
        </div>

        {customer ? (
          <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1.5 border-t pt-3 text-xs">
            <dt className="text-muted-foreground">Customer</dt>
            <dd className="flex items-center gap-2">
              <Kbd className="font-mono">{customer.external_ref ?? customer.id.slice(0, 8)}</Kbd>
              <span>{customer.status}</span>
            </dd>
            <dt className="text-muted-foreground">Plan</dt>
            <dd className="font-mono">{customer.plan_id ?? "—"}</dd>
            <dt className="text-muted-foreground">Language</dt>
            <dd>{customer.language ?? "—"}</dd>
          </dl>
        ) : (
          <p className="border-t pt-3 text-xs text-muted-foreground">
            {ticket.customer_id
              ? "The customer record could not be loaded."
              : "No customer matched this sender. The agent fails closed for unknown senders."}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
