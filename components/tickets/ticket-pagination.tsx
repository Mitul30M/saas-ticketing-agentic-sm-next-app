"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";

export function TicketPagination({
  page,
  hasNext,
  onPrevious,
  onNext,
}: {
  page: number;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <Pagination className="justify-between">
      <PaginationContent>
        <PaginationItem>
          <Button variant="outline" size="sm" onClick={onPrevious} disabled={page <= 1}>
            <ChevronLeftIcon data-icon="inline-start" />
            Previous
          </Button>
        </PaginationItem>
        <PaginationItem>
          <span className="px-2 text-xs text-muted-foreground" aria-current="page">
            Page {page}
          </span>
        </PaginationItem>
        <PaginationItem>
          <Button variant="outline" size="sm" onClick={onNext} disabled={!hasNext}>
            Next
            <ChevronRightIcon data-icon="inline-end" />
          </Button>
        </PaginationItem>
      </PaginationContent>
      <p className="hidden text-xs text-muted-foreground sm:block">
        The backend returns pages without a total count.
      </p>
    </Pagination>
  );
}
