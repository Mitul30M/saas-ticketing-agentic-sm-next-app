import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BackendBanner } from "@/components/system/backend-banner";
import { TicketDetailSkeleton } from "@/components/tickets/ticket-detail-skeleton";
import { TicketDetailView } from "@/components/tickets/ticket-detail-view";
import type { Customer, TicketDetail, TraceResponse } from "@/lib/api-types";
import { detailMessage } from "@/lib/api-error";
import { ApiError, api } from "@/lib/nimbus";

export const metadata: Metadata = { title: "Ticket" };

export default function TicketPage(props: PageProps<"/dashboard/tickets/[id]">) {
  return (
    <Suspense fallback={<TicketDetailSkeleton />}>
      <TicketLoader params={props.params} />
    </Suspense>
  );
}

async function TicketLoader({
  params,
}: Pick<PageProps<"/dashboard/tickets/[id]">, "params">) {
  const { id } = await params;

  let ticket: TicketDetail | null = null;
  let trace: TraceResponse | null = null;
  let failure: { status: number; detail: string } | null = null;

  try {
    [ticket, trace] = await Promise.all([api.ticket(id), api.trace(id)]);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 404 || error.status === 422) notFound();
      failure = { status: error.status, detail: detailMessage(error.detail) };
    } else {
      throw error;
    }
  }

  if (failure) return <BackendBanner status={failure.status} detail={failure.detail} />;
  if (!ticket || !trace) {
    return <BackendBanner status={503} detail="The backend returned an empty ticket response." />;
  }

  let customer: Customer | null = null;
  if (ticket.customer_id) {
    try {
      customer = await api.customer(ticket.customer_id);
    } catch {
      // A missing/broken customer record must not hide the ticket itself.
      customer = null;
    }
  }

  return <TicketDetailView initialTicket={ticket} initialTrace={trace} customer={customer} />;
}
