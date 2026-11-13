import { Skeleton } from "@/components/ui/skeleton";

export default function PortalLoading() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-3 w-80" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <Skeleton className="h-[30rem] w-full rounded-lg" />
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}
