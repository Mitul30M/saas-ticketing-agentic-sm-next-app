import { Skeleton } from "@/components/ui/skeleton";

export function TicketListSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-8 w-full max-w-md" />
        <Skeleton className="h-7 w-40" />
      </div>
      <div className="overflow-hidden rounded-lg border">
        <div className="flex items-center gap-4 border-b bg-muted/40 px-3 py-2.5">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="ml-auto h-3 w-16" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
        </div>
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 border-b px-3 py-3 last:border-b-0">
            <Skeleton className="h-3.5 w-full max-w-64" />
            <Skeleton className="ml-auto h-5 w-24 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
