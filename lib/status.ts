import type {
  ActionStatus,
  AgentOutcome,
  ApprovalKind,
  Category,
  HandledBy,
  PlanEffective,
  Priority,
  Queue,
  Sentiment,
  TicketStatus,
} from "@/lib/api-types";

// Matches the preset badge variants. Keeping the union here lets this file stay
// pure (no React imports) and testable under vitest.
export type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "ghost" | "link";

export interface StatusMeta {
  label: string;
  variant: BadgeVariant;
}

export const ticketStatusMeta: Record<TicketStatus, StatusMeta> = {
  new: { label: "New", variant: "outline" },
  triaging: { label: "Triaging", variant: "secondary" },
  awaiting_approval: { label: "Awaiting approval", variant: "default" },
  awaiting_human: { label: "Needs a human", variant: "secondary" },
  resolved: { label: "Resolved", variant: "outline" },
  failed: { label: "Failed", variant: "destructive" },
};

export const priorityMeta: Record<Priority, StatusMeta> = {
  low: { label: "Low", variant: "outline" },
  medium: { label: "Medium", variant: "secondary" },
  high: { label: "High", variant: "default" },
  urgent: { label: "Urgent", variant: "destructive" },
};

export const queueMeta: Record<Queue, StatusMeta> = {
  billing: { label: "Billing", variant: "outline" },
  account: { label: "Account", variant: "outline" },
  technical: { label: "Technical", variant: "outline" },
  security: { label: "Security", variant: "outline" },
  incidents: { label: "Incidents", variant: "outline" },
  product: { label: "Product", variant: "outline" },
  general: { label: "General", variant: "outline" },
};

export const sentimentMeta: Record<Sentiment, StatusMeta> = {
  positive: { label: "Positive", variant: "outline" },
  neutral: { label: "Neutral", variant: "secondary" },
  negative: { label: "Negative", variant: "outline" },
};

export const outcomeMeta: Record<AgentOutcome, StatusMeta> = {
  draft_ready: { label: "Draft ready", variant: "outline" },
  action_proposed: { label: "Action proposed", variant: "default" },
  escalated: { label: "Escalated", variant: "secondary" },
  failed: { label: "Failed", variant: "destructive" },
};

export const handledByMeta: Record<HandledBy, StatusMeta> = {
  unassigned: { label: "Unassigned", variant: "secondary" },
  agent: { label: "Agent", variant: "outline" },
  human: { label: "Human", variant: "default" },
};

export const approvalKindMeta: Record<ApprovalKind, StatusMeta> = {
  send_reply: { label: "Send reply", variant: "outline" },
  refund: { label: "Refund", variant: "default" },
  plan_change: { label: "Plan change", variant: "secondary" },
};

export const actionStatusMeta: Record<ActionStatus, StatusMeta> = {
  pending_approval: { label: "Pending", variant: "default" },
  approved: { label: "Approved", variant: "outline" },
  rejected: { label: "Rejected", variant: "secondary" },
  executed: { label: "Executed", variant: "outline" },
  failed: { label: "Failed", variant: "destructive" },
};

export const categoryLabel: Record<Category, string> = {
  invoice_question: "Invoice question",
  refund_request: "Refund request",
  plan_change: "Plan change",
  login_account_access: "Login / access",
  api_integration: "API integration",
  sync_issues: "Sync issues",
  service_outage: "Service outage",
  security_incident: "Security incident",
  feature_request: "Feature request",
  other: "Other",
};

export const planEffectiveLabel: Record<PlanEffective, string> = {
  now: "Immediately",
  next_cycle: "Next billing cycle",
};

export function ticketStatus(status: TicketStatus): StatusMeta {
  return ticketStatusMeta[status] ?? { label: status, variant: "outline" };
}

export function priority(value: Priority | null): StatusMeta | null {
  return value ? (priorityMeta[value] ?? { label: value, variant: "outline" }) : null;
}

export function queue(value: Queue | null): StatusMeta | null {
  return value ? (queueMeta[value] ?? { label: value, variant: "outline" }) : null;
}

export function sentiment(value: Sentiment | null): StatusMeta | null {
  return value ? (sentimentMeta[value] ?? { label: value, variant: "outline" }) : null;
}

export function outcome(value: AgentOutcome | null): StatusMeta | null {
  return value ? (outcomeMeta[value] ?? { label: value, variant: "outline" }) : null;
}

export function handledBy(value: HandledBy): StatusMeta {
  return handledByMeta[value] ?? { label: value, variant: "outline" };
}

export function approvalKind(value: ApprovalKind): StatusMeta {
  return approvalKindMeta[value] ?? { label: value, variant: "outline" };
}

export function actionStatus(value: ActionStatus): StatusMeta {
  return actionStatusMeta[value] ?? { label: value, variant: "outline" };
}

export function category(value: Category | null): string {
  if (!value) return "Unclassified";
  return categoryLabel[value] ?? value;
}

/** `resolved`/`failed` are terminal for polling and for the re-run affordance. */
export function isTerminalStatus(status: TicketStatus): boolean {
  return status === "resolved" || status === "failed";
}

const ESCALATION_COPY: Record<string, string> = {
  LOW_CONFIDENCE: "The knowledge base doesn't cover this confidently",
  BAD_TICKET: "No verifiable sender or empty body",
  NEEDS_HUMAN_JUDGEMENT: "Needs a person to decide",
  DRAFT_REJECTED: "A human rejected the draft",
  DRAFT_CITATION_INVALID: "The draft cited something outside the KB",
  DRAFT_PROMISE_DENIED: "The draft promised an action the agent may not take",
  CONFLICTING_SOURCES: "Sources disagree",
  STEP_LIMIT: "Stopped at the step limit",
  INTERNAL_ERROR: "The run failed; the ticket is parked",
  JOB_FAILED: "The run failed; the ticket is parked",
  TOOL_FAILURE: "A tool failed during the run",
  TOOL_ERROR: "A tool failed during the run",
  AGENT_ESCALATED: "The agent parked this for a person",
  TICKET_NOT_FOUND: "The ticket could not be found",
  ownership_mismatch: "The record doesn't belong to this customer",
  business_rule: "A business rule blocked the action",
  duplicate: "An open request already exists",
  timeout: "A tool timed out",
  not_found: "A required record was not found",
  invalid_input: "The agent received invalid input",
  internal: "An internal error stopped the run",
};

/**
 * Friendly sentence for a known code; null for an unknown code so the caller
 * renders the raw value in a code chip. Unknown values are never hidden.
 */
export function escalationCopy(reason: string | null | undefined): string | null {
  if (!reason) return null;
  return ESCALATION_COPY[reason] ?? null;
}

const FLAG_COPY: Record<string, string> = {
  instruction_override: "Asked to ignore prior instructions",
  system_prompt_marker: "Contained a fake system prompt marker",
  role_injection: "Tried to reassign the assistant's role",
  identity_claim: "Claimed a privileged identity",
  tool_probe: "Probed for internal tools",
  edited_citation_invalid: "An edited reply cited outside the KB",
  edited_promise_language: "An edited reply promised an action",
};

export function flagCopy(flag: string): string {
  return FLAG_COPY[flag] ?? flag;
}
