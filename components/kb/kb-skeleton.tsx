import { Skeleton } from "@/components/ui/skeleton";

export function KbSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-20 w-full rounded-lg" />
      <div className="grid gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <div className="flex flex-col gap-3 rounded-lg border p-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-full" />
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full rounded-md" />
          ))}
        </div>
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    </div>
  );
}
