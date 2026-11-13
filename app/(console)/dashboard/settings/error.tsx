"use client";

import { RouteError } from "@/components/system/route-error";

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteError
      title="Settings could not be loaded"
      description="The server could not read its backend configuration."
      error={error}
      reset={reset}
    />
  );
}
