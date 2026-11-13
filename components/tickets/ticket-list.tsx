"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AlertTriangleIcon, InboxIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { BackendBanner } from "@/components/system/backend-banner";
import { TicketFiltersBar } from "@/components/tickets/ticket-filters";
import { TicketPagination } from "@/components/tickets/ticket-pagination";
import { TicketTable } from "@/components/tickets/ticket-table";
import { usePolling } from "@/hooks/use-polling";
import type { TicketListResponse } from "@/lib/api-types";
import { apiFailure, clientGet } from "@/lib/client-api";
import {
  hasActiveFilters,
  ticketSearch,
  type TabKey,
  type TicketFilters,
} from "@/lib/ticket-filters";

export function TicketList({
  initial,
  filters,
}: {
  initial: TicketListResponse;
  filters: TicketFilters;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const fetcher = useCallback(
    (signal: AbortSignal) =>
      clientGet<TicketListResponse>(`tickets?${ticketSearch(filters)}`, signal),
    [filters]
  );

  const { data, error, failures, updatedAt, refresh } = usePolling(fetcher, {
    intervalMs: 5000,
    initialData: initial,
  });

  const view = data ?? initial;
  const items = view.items;
  const failure = apiFailure(error);
  const backendDown = failure?.status === 401 || failure?.status === 503;
  const stale = failures >= 2;

  const navigate = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(window.location.search);
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") params.delete(key);
        else params.set(key, value);
      }
      const search = params.toString();
      router.replace(`${pathname}${search ? `?${search}` : ""}`, { scroll: false });
    },
    [pathname, router]
  );

  const onTabChange = useCallback(
    (tab: TabKey) => navigate({ tab: tab === "all" ? null : tab, page: null }),
    [navigate]
  );
  const onQueueChange = useCallback(
    (value: string) => navigate({ queue: value === "all" ? null : value, page: null }),
    [navigate]
  );
  const onSearchChange = useCallback(
    (value: string) => navigate({ q: value.trim() || null, page: null }),
    [navigate]
  );
  const onClear = useCallback(() => {
    navigate({ tab: null, q: null, queue: null, page: null });
  }, [navigate]);
  const openTicket = useCallback(
    (id: string) => router.push(`/dashboard/tickets/${id}`),
    [router]
  );

  const noMatches = hasActiveFilters(filters);
  const beyondFirstPage = filters.page > 1;
  const hasNext = items.length >= filters.limit;

  return (
    <div className="flex flex-col gap-4">
      <TicketFiltersBar
        filters={filters}
        onTabChange={onTabChange}
        onQueueChange={onQueueChange}
        onSearchChange={onSearchChange}
        onClear={onClear}
        onRefresh={refresh}
      />

      <div className="sr-only" aria-live="polite">
        {updatedAt ? <span key={updatedAt}>Ticket list updated</span> : null}
      </div>

      {backendDown && failure && (
        <BackendBanner status={failure.status} detail={failure.message} />
      )}

      {failure && !backendDown && (
        <Alert variant="destructive">
          <AlertTriangleIcon />
          <AlertTitle>Could not refresh the ticket list</AlertTitle>
          <AlertDescription>{failure.message}</AlertDescription>
        </Alert>
      )}

      {!failure && error && (
        <Alert variant="destructive">
          <AlertTriangleIcon />
          <AlertTitle>Could not reach the console proxy</AlertTitle>
          <AlertDescription>
            Check that the Next.js app is running, then refresh.
          </AlertDescription>
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
            <EmptyTitle>
              {noMatches
                ? "No tickets match these filters"
                : beyondFirstPage
                  ? "No tickets on this page"
                  : "No tickets yet"}
            </EmptyTitle>
            <EmptyDescription>
              {noMatches
                ? "Try a different status, queue or search term."
                : beyondFirstPage
                  ? "The previous page was the last one with results."
                  : "New customer requests will appear here as they arrive."}
            </EmptyDescription>
            <EmptyContent>
              {noMatches ? (
                <Button type="button" variant="outline" size="sm" onClick={onClear}>
                  Clear filters
                </Button>
              ) : beyondFirstPage ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => navigate({ page: null })}
                >
                  Back to page 1
                </Button>
              ) : null}
            </EmptyContent>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <TicketTable items={items} onOpen={openTicket} />
          <TicketPagination
            page={filters.page}
            hasNext={hasNext}
            onPrevious={() => navigate({ page: String(Math.max(filters.page - 1, 1)) })}
            onNext={() => navigate({ page: String(filters.page + 1) })}
          />
        </>
      )}
    </div>
  );
}
