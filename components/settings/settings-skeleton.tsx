import { Skeleton } from "@/components/ui/skeleton";

export function SettingsSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-56 w-full rounded-lg" />
      ))}
    </div>
  );
}
