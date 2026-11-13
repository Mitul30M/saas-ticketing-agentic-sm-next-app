import { Skeleton } from "@/components/ui/skeleton";

export function ApprovalInboxSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-7 w-80" />
        <Skeleton className="h-3 w-32" />
      </div>
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex flex-col gap-3 rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-20 w-full rounded-md" />
          <Skeleton className="h-16 w-full rounded-md" />
          <div className="flex gap-2">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-7 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
