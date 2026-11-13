import { Skeleton } from "@/components/ui/skeleton";

export default function ConsoleLoading() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-7 w-40" />
      <Skeleton className="h-3 w-72" />
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
}
