"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-dvh items-center justify-center bg-background p-6 text-foreground">
        <div className="flex w-full max-w-md flex-col gap-3 rounded-lg border p-6">
          <h1 className="text-base font-medium">The app could not start this page</h1>
          <p className="text-xs text-muted-foreground">
            Nothing was changed. The agent token is never shown in this message.
            {error.digest ? ` Reference: ${error.digest}.` : ""}
          </p>
          <button
            type="button"
            onClick={reset}
            className="w-fit rounded-md border px-2 py-1 text-xs hover:bg-muted"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
