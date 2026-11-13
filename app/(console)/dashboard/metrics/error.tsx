"use client";

import { RouteError } from "@/components/system/route-error";

export default function MetricsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteError
      title="Metrics could not be loaded"
      description="The metrics aggregate request failed."
      error={error}
      reset={reset}
    />
  );
}
