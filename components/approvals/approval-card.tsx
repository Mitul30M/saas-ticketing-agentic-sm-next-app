"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  CheckIcon,
  LockIcon,
} from "lucide-react";
import { MetaBadge } from "@/components/console/meta-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Kbd } from "@/components/ui/kbd";
import { Spinner } from "@/components/ui/spinner";
import type { DecideRequest, DecideResponse, PendingApproval } from "@/lib/api-types";
import { approveGate } from "@/lib/approvals";
import { apiFailure, clientPost } from "@/lib/client-api";
import { money, shortId } from "@/lib/format";
import { approvalKind, planEffectiveLabel } from "@/lib/status";
import { DraftText } from "@/components/tickets/draft-text";
import { EvidenceList } from "@/components/tickets/evidence-list";
import { InjectionBanner } from "@/components/tickets/injection-banner";
import { EditReplyDialog } from "./edit-reply-dialog";
import { RejectDecisionDialog } from "./reject-dialog";
import type { DecisionSubmit, SubmitResult } from "./types";

type ActiveAction = "approve" | "edit" | "reject" | null;

function ActionBlock({
  item,
  onCitation,
}: {
  item: PendingApproval;
  onCitation: (kbId: string) => void;
}) {
  if (item.kind === "refund") {
    return (
      <div className="rounded-md border bg-muted/30 p-3">
        <p className="text-[0.625rem] uppercase tracking-wide text-muted-foreground">
          Refund amount
        </p>
        <p className="font-mono text-lg font-medium">{money(item.amount_cents)}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Invoice <Kbd className="ml-1 font-mono">{item.invoice_id ?? "—"}</Kbd>
        </p>
      </div>
    );
  }

  if (item.kind === "plan_change") {
    return (
      <div className="rounded-md border bg-muted/30 p-3">
        <p className="text-[0.625rem] uppercase tracking-wide text-muted-foreground">
          Plan change
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 font-mono text-sm">
          <span>{item.from_plan_id ?? "current"}</span>
          <ArrowRightIcon aria-hidden className="size-3.5 text-muted-foreground" />
          <span className="font-medium">{item.to_plan_id ?? "—"}</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Effective: {item.effective ? planEffectiveLabel[item.effective] : "—"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[0.625rem] uppercase tracking-wide text-muted-foreground">
        Proposed reply
      </p>
      <div className="rounded-md border bg-muted/30 p-3">
        {item.draft_reply ? (
          <DraftText text={item.draft_reply} onCitation={onCitation} />
        ) : (
          <p className="text-xs text-muted-foreground">No draft text was returned.</p>
        )}
      </div>
    </div>
  );
}

export function ApprovalCard({
  item,
  onCitation,
  onDecided,
}: {
  item: PendingApproval;
  onCitation: (kbId: string) => void;
  onDecided: () => void;
}) {
  const router = useRouter();
  const [active, setActive] = useState<ActiveAction>(null);
  const [decided, setDecided] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gate = approveGate(item);
  const pending = active !== null;
  const disabled = pending || decided;

  const submit: DecisionSubmit = useCallback(
    async (body: DecideRequest): Promise<SubmitResult> => {
      if (disabled) return { ok: false, message: "This card is no longer actionable." };

      setActive(
        body.decision === "approve" ? "approve" : body.decision === "edit" ? "edit" : "reject"
      );
      setError(null);
      try {
        await clientPost<DecideResponse>(
          `approvals/${item.kind}/${item.ref}/decide`,
          body,
          crypto.randomUUID()
        );
        setDecided(true);
        onDecided();
        return { ok: true };
      } catch (cause) {
        const failure = apiFailure(cause);
        if (failure?.status === 400) {
          router.push("/login");
          return { ok: false, message: "Your operator session was lost. Sign in again." };
        }
        if (failure?.status === 409) {
          const message = "Someone else decided this first. The list has been refreshed.";
          setError(message);
          setDecided(true);
          onDecided();
          return { ok: false, message };
        }
        const message = failure?.message ?? "The decision could not be recorded.";
        setError(message);
        return { ok: false, message };
      } finally {
        setActive(null);
      }
    },
    [disabled, item.kind, item.ref, onDecided, router]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-1.5">
          <MetaBadge meta={approvalKind(item.kind)} />
          <Link
            href={`/dashboard/tickets/${item.ticket_id}`}
            className="min-w-0 truncate hover:underline"
          >
            {item.subject}
          </Link>
        </CardTitle>
        <CardDescription className="font-mono">
          ticket {shortId(item.ticket_id)}
        </CardDescription>
        <CardAction>
          <Badge variant="outline">Pending</Badge>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <ActionBlock item={item} onCitation={onCitation} />

        <div className="border-t pt-3">
          <p className="mb-1.5 text-[0.625rem] uppercase tracking-wide text-muted-foreground">
            Evidence
          </p>
          <EvidenceList evidence={item.evidence} onCitation={onCitation} />
        </div>

        <InjectionBanner suspected={item.injection_suspected} flags={item.flags} />

        {!gate.allowed && (
          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <LockIcon aria-hidden className="mt-0.5 size-3.5 shrink-0" />
            {gate.reason} Approve stays disabled until it is available.
          </p>
        )}
      </CardContent>

      <CardFooter className="flex-col items-stretch gap-2 border-t">
        {decided && (
          <Alert>
            <CheckIcon />
            <AlertTitle>Decision recorded</AlertTitle>
            <AlertDescription>
              The worker applies it shortly. This card stays disabled while the queue settles.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTriangleIcon />
            <AlertTitle>Decision not recorded</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={() => void submit({ decision: "approve" })}
            disabled={!gate.allowed || disabled}
          >
            {active === "approve" ? <Spinner data-icon="inline-start" /> : <CheckIcon data-icon="inline-start" />}
            Approve
          </Button>

          {item.kind === "send_reply" && (
            <EditReplyDialog
              item={item}
              onSubmit={submit}
              pending={active === "edit"}
              disabled={disabled}
            />
          )}

          <RejectDecisionDialog
            onSubmit={submit}
            pending={active === "reject"}
            disabled={disabled}
          />
        </div>
      </CardFooter>
    </Card>
  );
}
