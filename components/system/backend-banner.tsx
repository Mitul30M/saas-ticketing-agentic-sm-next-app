import Link from "next/link";
import { AlertTriangleIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RetryButton } from "@/components/system/retry-button";

export function BackendBanner({ status, detail }: { status: number; detail: string }) {
  const title =
    status === 401
      ? "The backend rejected the agent token"
      : status === 503
        ? "The agent backend is unavailable"
        : "The backend returned an error";

  return (
    <Alert variant="destructive">
      <AlertTriangleIcon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <p>{detail || "No detail was returned."}</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <RetryButton />
          <Link href="/dashboard/settings" className="text-xs underline underline-offset-4">
            Check backend settings
          </Link>
        </div>
      </AlertDescription>
    </Alert>
  );
}
