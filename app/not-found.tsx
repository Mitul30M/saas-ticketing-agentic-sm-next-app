"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { CompassIcon } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <Empty className="max-w-md border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CompassIcon />
          </EmptyMedia>
          <EmptyTitle>Page not found</EmptyTitle>
          <EmptyDescription>
            The address does not exist in this app. It may be a stale link or a different
            environment.
          </EmptyDescription>
          <EmptyContent>
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="outline" size="sm" render={<Link href="/submit" />}>
                Customer portal
              </Button>
              <Button variant="outline" size="sm" render={<Link href="/dashboard" />}>
                Agent console
              </Button>
            </div>
          </EmptyContent>
        </EmptyHeader>
      </Empty>
    </main>
  );
}
