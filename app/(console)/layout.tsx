import { Suspense, type ReactNode } from "react";
import { ApprovalsCount } from "@/components/console/approvals-count";
import { ConsoleShell } from "@/components/console/console-shell";
import { OperatorChip } from "@/components/console/operator-chip";
import { Skeleton } from "@/components/ui/skeleton";

// Route-group layouts are not part of the generated `LayoutRoutes` union
// (only "/" is), so the props stay explicit here.
export default function ConsoleLayout({ children }: { children: ReactNode }) {
  return (
    <ConsoleShell
      operatorSlot={
        <Suspense fallback={<Skeleton className="h-7 w-28" />}>
          <OperatorChip />
        </Suspense>
      }
      approvalsBadge={
        <Suspense fallback={null}>
          <ApprovalsCount />
        </Suspense>
      }
    >
      {children}
    </ConsoleShell>
  );
}
