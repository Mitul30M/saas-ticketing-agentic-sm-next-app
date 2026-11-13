"use client";

import { RouteError } from "@/components/system/route-error";

export default function ApprovalsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteError
      title="The approval queue could not be loaded"
      description="No decision was recorded by this error."
      error={error}
      reset={reset}
    />
  );
}
