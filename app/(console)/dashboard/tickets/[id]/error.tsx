"use client";

import { AlertTriangleIcon, RotateCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function TicketError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <AlertTriangleIcon />
        </EmptyMedia>
        <EmptyTitle>This ticket could not be loaded</EmptyTitle>
        <EmptyDescription>
          The console proxy returned an unexpected error. Nothing was changed.
          {error.digest ? ` Reference: ${error.digest}.` : ""}
        </EmptyDescription>
        <EmptyContent>
          <Button variant="outline" size="sm" onClick={reset}>
            <RotateCwIcon data-icon="inline-start" />
            Try again
          </Button>
        </EmptyContent>
      </EmptyHeader>
    </Empty>
  );
}
