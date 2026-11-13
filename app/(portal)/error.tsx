"use client";

import { RouteError } from "@/components/system/route-error";

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteError
      title="The support portal could not render"
      description="Your message was not sent."
      error={error}
      reset={reset}
    />
  );
}
