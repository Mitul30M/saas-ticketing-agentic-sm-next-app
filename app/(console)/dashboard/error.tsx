"use client";

import { RouteError } from "@/components/system/route-error";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteError
      title="The ticket list could not be loaded"
      description="The backend request failed before the list could render."
      error={error}
      reset={reset}
    />
  );
}
