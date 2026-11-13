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

export default function PortalNotFound() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16">
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CompassIcon />
          </EmptyMedia>
          <EmptyTitle>Page not found</EmptyTitle>
          <EmptyDescription>
            The support portal does not have a page at this address.
          </EmptyDescription>
          <EmptyContent>
            <Button variant="outline" size="sm" render={<Link href="/submit" />}>
              File a request
            </Button>
          </EmptyContent>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
