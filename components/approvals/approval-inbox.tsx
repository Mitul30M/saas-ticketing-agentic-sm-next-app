"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangleIcon, InboxIcon, InfoIcon } from "lucide-react";
import { ApprovalCard } from "@/components/approvals/approval-card";
import { BackendBanner } from "@/components/system/backend-banner";
import { CitationSheet } from "@/components/tickets/citation-sheet";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { usePolling } from "@/hooks/use-polling";
import {
  APPROVAL_FILTERS,
  approvalCounts,
  approvalKey,
  filterApprovals,
  groupApprovals,
  groupDecisionSummary,
  isApprovalFilter,
  type ApprovalFilter,
} from "@/lib/approvals";
import type { PendingApprovalsResponse } from "@/lib/api-types";
import { apiFailure, clientGet } from "@/lib/client-api";
import { approvalKind } from "@/lib/status";

export function ApprovalInbox({ initial }: { initial: PendingApprovalsResponse }) {
  const router = useRouter();
  const [filter, setFilter] = useState<ApprovalFilter>("all");
  const [citation, setCitation] = useState<string | null>(null);

  const fetcher = useCallback(
    (signal: AbortSignal) =>
      clientGet<PendingApprovalsResponse>("approvals/pending", signal),
    []
  );

  const { data, error, failures, updatedAt, refresh } = usePolling(fetcher, {
    intervalMs: 8000,
    initialData: initial,
  });

  const items = (data ?? initial).items;
  const counts = approvalCounts(items);
  const filtered = filterApprovals(items, filter);
  const groups = groupApprovals(filtered);
  const ticketCount = groupApprovals(items).length;

  const failure = apiFailure(error);
  const backendDown = failure?.status === 401 || failure?.status === 503;
  const stale = failures >= 2;

  const onDecided = useCallback(() => {
    refresh();
    router.refresh();
  }, [refresh, router]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <ToggleGroup
          value={[filter]}
          onValueChange={(value) => {
            const next = value[0];
            if (next && isApprovalFilter(next)) setFilter(next);
          }}
          variant="outline"
          size="sm"
          className="flex-wrap"
          aria-label="Filter approvals by kind"
        >
          {APPROVAL_FILTERS.map((option) => (
            <ToggleGroupItem
              key={option.value}
              value={option.value}
              disabled={counts[option.value] === 0 && option.value !== "all"}
            >
              {option.label}
              <span className="ml-1 tabular-nums text-muted-foreground">
                {counts[option.value]}
              </span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <p className="text-xs text-muted-foreground">
          {counts.all} pending across {ticketCount} ticket{ticketCount === 1 ? "" : "s"}
        </p>
      </div>

      <div className="sr-only" aria-live="polite">
        {updatedAt ? <span key={updatedAt}>Approval list updated</span> : null}
      </div>

      {backendDown && failure && (
        <BackendBanner status={failure.status} detail={failure.message} />
      )}

      {failure && !backendDown && (
        <Alert variant="destructive">
          <AlertTriangleIcon />
          <AlertTitle>Could not refresh the approval queue</AlertTitle>
          <AlertDescription>{failure.message}</AlertDescription>
        </Alert>
      )}

      {!failure && error && (
        <Alert variant="destructive">
          <AlertTriangleIcon />
          <AlertTitle>Could not reach the console proxy</AlertTitle>
          <AlertDescription>Check the app, then refresh.</AlertDescription>
        </Alert>
      )}

      {stale && items.length > 0 && (
        <p role="status" className="text-xs text-destructive">
          Showing the last successful result; refreshes are failing.
        </p>
      )}

      {items.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <InboxIcon />
            </EmptyMedia>
            <EmptyTitle>Nothing is waiting for a human</EmptyTitle>
            <EmptyDescription>
              When the agent proposes a refund, a plan change or a reply, it appears here. Nothing
              is approved automatically.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : filtered.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <InboxIcon />
            </EmptyMedia>
            <EmptyTitle>No approvals of this kind</EmptyTitle>
            <EmptyDescription>
              There are pending actions, but none match the selected filter.
            </EmptyDescription>
            <EmptyContent>
              <Button type="button" variant="outline" size="sm" onClick={() => setFilter("all")}>
                Show all
              </Button>
            </EmptyContent>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-8">
          {groups.map((group) => {
            const summary = groupDecisionSummary(group.items);
            const actionLabels = summary.kinds
              .filter((kind) => kind !== "send_reply")
              .map((kind) => approvalKind(kind).label)
              .join(" and ");

            return (
              <section
                key={group.ticketId}
                id={`ticket-${group.ticketId}`}
                className="flex scroll-mt-20 flex-col gap-3"
                aria-label={`Pending approvals for ${group.subject}`}
              >
                <div className="flex items-center justify-between gap-2 border-b pb-2">
                  <h2 className="min-w-0 truncate text-sm font-medium">{group.subject}</h2>
                  <Badge variant="outline">
                    {group.items.length} pending
                  </Badge>
                </div>

                {summary.hasAction && summary.hasReply && (
                  <Alert>
                    <InfoIcon aria-hidden />
                    <AlertTitle>{summary.total} separate decisions</AlertTitle>
                    <AlertDescription>
                      {actionLabels} and Send reply are decided independently. If you reject the
                      action, edit or reject the reply too — it may tell the customer the action is
                      proposed.
                    </AlertDescription>
                  </Alert>
                )}

                {group.items.map((item) => (
                  <ApprovalCard
                    key={approvalKey(item)}
                    item={item}
                    onCitation={setCitation}
                    onDecided={onDecided}
                  />
                ))}
              </section>
            );
          })}
        </div>
      )}

      <CitationSheet kbId={citation} onClose={() => setCitation(null)} />
    </div>
  );
}
