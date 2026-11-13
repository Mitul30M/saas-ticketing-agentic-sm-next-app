import type { Metadata } from "next";
import { Suspense } from "react";
import type { TicketListResponse } from "@/lib/api-types";
import { BackendBanner } from "@/components/system/backend-banner";
import { TicketList } from "@/components/tickets/ticket-list";
import { TicketListSkeleton } from "@/components/tickets/ticket-list-skeleton";
import { detailMessage } from "@/lib/api-error";
import { ApiError, api } from "@/lib/nimbus";
import {
  filtersKey,
  parseTicketFilters,
  ticketApiParams,
} from "@/lib/ticket-filters";

export const metadata: Metadata = { title: "Tickets" };

export default function DashboardPage(props: PageProps<"/dashboard">) {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-medium tracking-tight">Tickets</h1>
        <p className="text-xs text-muted-foreground">
          Read-only view of the agent&apos;s queue. Refreshes every 5 seconds while this tab is
          visible.
        </p>
      </header>
      <Suspense fallback={<TicketListSkeleton />}>
        <TicketListLoader searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

async function TicketListLoader({
  searchParams,
}: Pick<PageProps<"/dashboard">, "searchParams">) {
  const params = await searchParams;
  const filters = parseTicketFilters(params);

  let data: TicketListResponse | null = null;
  let failure: { status: number; detail: string } | null = null;

  try {
    data = await api.listTickets(ticketApiParams(filters));
  } catch (error) {
    if (error instanceof ApiError) {
      failure = { status: error.status, detail: detailMessage(error.detail) };
    } else {
      throw error;
    }
  }

  if (failure) return <BackendBanner status={failure.status} detail={failure.detail} />;
  if (!data) return <BackendBanner status={503} detail="The backend returned an empty response." />;

  return <TicketList key={filtersKey(filters)} initial={data} filters={filters} />;
}
