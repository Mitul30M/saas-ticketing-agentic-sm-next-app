import { Skeleton } from "@/components/ui/skeleton";

export default function LoginLoading() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted/30 p-4">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Skeleton className="mx-auto h-7 w-48" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    </main>
  );
}
