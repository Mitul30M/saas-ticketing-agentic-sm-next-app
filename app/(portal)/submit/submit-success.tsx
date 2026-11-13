"use client";

import { CheckCircle2Icon, InfoIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Kbd } from "@/components/ui/kbd";

export function SubmitSuccess({
  ticketId,
  duplicate,
  onReset,
}: {
  ticketId: string;
  duplicate: boolean;
  onReset: () => void;
}) {
  return (
    <Card className="w-full" aria-live="polite">
      <CardHeader>
        <div className="mb-1 flex size-9 items-center justify-center rounded-full bg-secondary text-foreground">
          <CheckCircle2Icon aria-hidden className="size-4" />
        </div>
        <CardTitle className="text-base">
          {duplicate ? "We already have this message" : "Request received"}
        </CardTitle>
        <CardDescription>
          {duplicate
            ? "The same message arrived recently, so we kept one ticket instead of creating a second."
            : "A support agent will review it. You don't need to send it again."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="rounded-lg border bg-muted/40 p-3">
          <p className="text-[0.625rem] font-medium uppercase tracking-wide text-muted-foreground">
            Ticket reference
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Kbd className="font-mono text-xs">{ticketId}</Kbd>
            <span className="text-xs text-muted-foreground">
              Keep this if you need to follow up.
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <InfoIcon aria-hidden className="size-3.5" />
            Nothing has been sent or changed yet.
          </p>
          <Button type="button" variant="outline" onClick={onReset}>
            <PlusIcon data-icon="inline-start" />
            File another request
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
