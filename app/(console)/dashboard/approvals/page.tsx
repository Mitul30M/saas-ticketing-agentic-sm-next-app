import type { Metadata } from "next";
import { Suspense } from "react";
import { ApprovalInbox } from "@/components/approvals/approval-inbox";
import { ApprovalInboxSkeleton } from "@/components/approvals/approval-inbox-skeleton";
import { BackendBanner } from "@/components/system/backend-banner";
import type { PendingApprovalsResponse } from "@/lib/api-types";
import { detailMessage } from "@/lib/api-error";
import { ApiError, api } from "@/lib/nimbus";

export const metadata: Metadata = { title: "Approvals" };

export default function ApprovalsPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-medium tracking-tight">Approvals</h1>
        <p className="text-xs text-muted-foreground">
          Every action is a human decision. Read the action, the amount and the evidence before
          approving; the button stays disabled until they are on screen.
        </p>
      </header>
      <Suspense fallback={<ApprovalInboxSkeleton />}>
        <ApprovalsLoader />
      </Suspense>
    </div>
  );
}

async function ApprovalsLoader() {
  let data: PendingApprovalsResponse | null = null;
  let failure: { status: number; detail: string } | null = null;

  try {
    data = await api.pending();
  } catch (error) {
    if (error instanceof ApiError) {
      failure = { status: error.status, detail: detailMessage(error.detail) };
    } else {
      throw error;
    }
  }

  if (failure) return <BackendBanner status={failure.status} detail={failure.detail} />;
  if (!data) {
    return <BackendBanner status={503} detail="The backend returned an empty approval response." />;
  }

  return <ApprovalInbox initial={data} />;
}
