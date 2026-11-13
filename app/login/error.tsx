"use client";

import { RouteError } from "@/components/system/route-error";

export default function LoginError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <RouteError
          title="Sign-in could not render"
          description="No session was created."
          error={error}
          reset={reset}
        />
      </div>
    </main>
  );
}
