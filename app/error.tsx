"use client";

import { RouteError } from "@/components/system/route-error";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-md">
        <RouteError
          title="Something went wrong"
          description="The page failed to render."
          error={error}
          reset={reset}
        />
      </div>
    </main>
  );
}
