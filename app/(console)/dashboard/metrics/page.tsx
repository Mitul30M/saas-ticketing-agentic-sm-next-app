import type { Metadata } from "next";
import { Suspense } from "react";
import { MetricsSkeleton } from "@/components/metrics/metrics-skeleton";
import { MetricsView } from "@/components/metrics/metrics-view";
import { BackendBanner } from "@/components/system/backend-banner";
import type { MetricsSummary } from "@/lib/api-types";
import { detailMessage } from "@/lib/api-error";
import { ApiError, api } from "@/lib/nimbus";

export const metadata: Metadata = { title: "Metrics" };

export default function MetricsPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-medium tracking-tight">Metrics</h1>
        <p className="text-xs text-muted-foreground">
          Live runtime aggregates from the backend. Cost is shown as logged, not as a saving.
        </p>
      </header>
      <Suspense fallback={<MetricsSkeleton />}>
        <MetricsLoader />
      </Suspense>
    </div>
  );
}

async function MetricsLoader() {
  let data: MetricsSummary | null = null;
  let failure: { status: number; detail: string } | null = null;

  try {
    data = await api.metrics();
  } catch (error) {
    if (error instanceof ApiError) {
      failure = { status: error.status, detail: detailMessage(error.detail) };
    } else {
      throw error;
    }
  }

  if (failure) return <BackendBanner status={failure.status} detail={failure.detail} />;
  if (!data) {
    return <BackendBanner status={503} detail="The backend returned an empty metrics response." />;
  }

  return <MetricsView initial={data} />;
}
