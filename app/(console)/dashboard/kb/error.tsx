"use client";

import { RouteError } from "@/components/system/route-error";

export default function KbError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteError
      title="The knowledge base could not be loaded"
      description="The article index request failed."
      error={error}
      reset={reset}
    />
  );
}
