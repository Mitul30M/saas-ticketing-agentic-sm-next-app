import Link from "next/link";
import { CompassIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function ConsoleNotFound() {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CompassIcon />
        </EmptyMedia>
        <EmptyTitle>Console page not found</EmptyTitle>
        <EmptyDescription>The address does not match a console screen.</EmptyDescription>
        <EmptyContent>
          <Button variant="outline" size="sm" render={<Link href="/dashboard" />}>
            Back to tickets
          </Button>
        </EmptyContent>
      </EmptyHeader>
    </Empty>
  );
}
