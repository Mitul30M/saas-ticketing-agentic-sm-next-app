import { Skeleton } from "@/components/ui/skeleton";

export function TicketDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 border-b pb-5">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-6 w-full max-w-md" />
        <Skeleton className="h-3 w-56" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="flex flex-col gap-4 lg:col-span-5">
          <Skeleton className="h-56 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
        <div className="flex flex-col gap-4 lg:col-span-4">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
        <div className="flex flex-col gap-4 lg:col-span-3">
          <Skeleton className="h-36 w-full rounded-lg" />
          <Skeleton className="h-28 w-full rounded-lg" />
        </div>
      </div>
      <Skeleton className="h-40 w-full rounded-lg" />
    </div>
  );
}
