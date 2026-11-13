import { Skeleton } from "@/components/ui/skeleton";
import { TicketListSkeleton } from "@/components/tickets/ticket-list-skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-3 w-80" />
      </div>
      <TicketListSkeleton />
    </div>
  );
}
