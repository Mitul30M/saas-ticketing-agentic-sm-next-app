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

export function RouteError({
  title,
  description,
  error,
  reset,
}: {
  title: string;
  description: string;
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <AlertTriangleIcon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>
          {description} Nothing was changed by this error.
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
