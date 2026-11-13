import Link from "next/link";
import { FileQuestionIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function TicketNotFound() {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileQuestionIcon />
        </EmptyMedia>
        <EmptyTitle>Ticket not found</EmptyTitle>
        <EmptyDescription>
          The id is unknown or malformed. It may belong to a different environment.
        </EmptyDescription>
        <EmptyContent>
          <Button variant="outline" size="sm" render={<Link href="/dashboard" />}>
            Back to tickets
          </Button>
        </EmptyContent>
      </EmptyHeader>
    </Empty>
  );
}
