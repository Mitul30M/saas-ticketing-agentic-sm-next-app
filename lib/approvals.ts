import type { PendingApproval } from "@/lib/api-types";

export const APPROVAL_FILTERS = [
  { value: "all", label: "All" },
  { value: "send_reply", label: "Send reply" },
  { value: "refund", label: "Refund" },
  { value: "plan_change", label: "Plan change" },
] as const;

export type ApprovalFilter = (typeof APPROVAL_FILTERS)[number]["value"];

export function isApprovalFilter(value: string): value is ApprovalFilter {
  return APPROVAL_FILTERS.some((filter) => filter.value === value);
}

export function filterApprovals(
  items: readonly PendingApproval[],
  filter: ApprovalFilter
): PendingApproval[] {
  return filter === "all" ? [...items] : items.filter((item) => item.kind === filter);
}

export function approvalCounts(
  items: readonly PendingApproval[]
): Record<ApprovalFilter, number> {
  const counts: Record<ApprovalFilter, number> = {
    all: items.length,
    send_reply: 0,
    refund: 0,
    plan_change: 0,
  };
  for (const item of items) counts[item.kind] += 1;
  return counts;
}

export interface ApprovalGroup {
  ticketId: string;
  subject: string;
  items: PendingApproval[];
}

/** Grouped by ticket, preserving the backend's ticket order. */
export function groupApprovals(items: readonly PendingApproval[]): ApprovalGroup[] {
  const groups = new Map<string, ApprovalGroup>();
  for (const item of items) {
    const existing = groups.get(item.ticket_id);
    if (existing) existing.items.push(item);
    else
      groups.set(item.ticket_id, {
        ticketId: item.ticket_id,
        subject: item.subject,
        items: [item],
      });
  }
  return [...groups.values()];
}

export function approvalKey(item: PendingApproval): string {
  return `${item.kind}:${item.ref}`;
}

export interface ApproveGate {
  allowed: boolean;
  reason: string | null;
}

/**
 * The product's core rule: Approve stays disabled until the action details and
 * the evidence are actually renderable. A missing field is a bug, not a reason
 * to guess — the button stays off and the reason is shown.
 */
export function approveGate(item: PendingApproval): ApproveGate {
  if (item.status !== "pending_approval") {
    return { allowed: false, reason: "This action is no longer pending." };
  }

  const hasEvidence =
    item.evidence !== null &&
    typeof item.evidence === "object" &&
    Object.keys(item.evidence).length > 0;
  if (!hasEvidence) {
    return { allowed: false, reason: "No evidence was attached to this action." };
  }

  if (item.kind === "refund") {
    if (item.amount_cents === null) return { allowed: false, reason: "The refund amount is missing." };
    if (!item.invoice_id) return { allowed: false, reason: "The invoice id is missing." };
    return { allowed: true, reason: null };
  }

  if (item.kind === "plan_change") {
    if (!item.to_plan_id) return { allowed: false, reason: "The target plan is missing." };
    return { allowed: true, reason: null };
  }

  if (!item.draft_reply || item.draft_reply.trim().length === 0) {
    return { allowed: false, reason: "The reply draft is missing." };
  }
  return { allowed: true, reason: null };
}
