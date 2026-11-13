"use client";

import { RouteError } from "@/components/system/route-error";

export default function ConsoleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteError
      title="The console could not render this page"
      description="The server component or its data request failed."
      error={error}
      reset={reset}
    />
  );
}
