import { ArrowRightIcon } from "lucide-react";
import { MetaBadge } from "@/components/console/meta-badge";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Kbd } from "@/components/ui/kbd";
import type { ProposedAction } from "@/lib/api-types";
import { money } from "@/lib/format";
import { actionStatus, approvalKind, planEffectiveLabel } from "@/lib/status";
import { EvidenceList } from "./evidence-list";

const ORDER: Record<ProposedAction["status"], number> = {
  pending_approval: 0,
  failed: 1,
  approved: 2,
  executed: 3,
  rejected: 4,
};

function actionTitle(action: ProposedAction): string {
  if (action.kind === "refund") return `Refund ${money(action.amount_cents)}`;
  if (action.kind === "plan_change") {
    return `Change plan ${action.from_plan_id ?? "current"} → ${action.to_plan_id ?? "target"}`;
  }
  return "Send a reply";
}

export function ProposedActions({
  actions,
  onCitation,
}: {
  actions: ProposedAction[];
  onCitation: (kbId: string) => void;
}) {
  if (actions.length === 0) {
    return (
      <Card size="sm">
        <CardHeader>
          <CardTitle>Proposed actions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            The agent proposed no refund or plan change for this ticket.
          </p>
        </CardContent>
      </Card>
    );
  }

  const sorted = [...actions].sort(
    (a, b) => (ORDER[a.status] ?? 9) - (ORDER[b.status] ?? 9) || a.kind.localeCompare(b.kind)
  );

  return (
    <div className="flex flex-col gap-3">
      {sorted.map((action) => {
        const status = actionStatus(action.status);
        const kind = approvalKind(action.kind);
        return (
          <Card key={`${action.kind}-${action.ref}`} size="sm">
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center gap-1.5">
                <MetaBadge meta={kind} />
                <span>{actionTitle(action)}</span>
              </CardTitle>
              <CardAction>
                <MetaBadge meta={status} />
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-xs">
                {action.kind === "refund" && (
                  <>
                    <dt className="text-muted-foreground">Amount</dt>
                    <dd className="font-mono">{money(action.amount_cents)}</dd>
                    <dt className="text-muted-foreground">Invoice</dt>
                    <dd>
                      <Kbd className="font-mono">{action.invoice_id ?? "—"}</Kbd>
                    </dd>
                  </>
                )}
                {action.kind === "plan_change" && (
                  <>
                    <dt className="text-muted-foreground">From</dt>
                    <dd className="font-mono">{action.from_plan_id ?? "current"}</dd>
                    <dt className="text-muted-foreground">To</dt>
                    <dd className="flex items-center gap-1 font-mono">
                      <ArrowRightIcon aria-hidden className="size-3" />
                      {action.to_plan_id ?? "—"}
                    </dd>
                    <dt className="text-muted-foreground">Effective</dt>
                    <dd>{action.effective ? planEffectiveLabel[action.effective] : "—"}</dd>
                  </>
                )}
                <dt className="text-muted-foreground">Ref</dt>
                <dd className="break-all font-mono text-[0.6875rem]">{action.ref}</dd>
              </dl>

              <div className="border-t pt-3">
                <p className="mb-1.5 text-[0.625rem] uppercase tracking-wide text-muted-foreground">
                  Evidence
                </p>
                <EvidenceList evidence={action.evidence} onCitation={onCitation} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
