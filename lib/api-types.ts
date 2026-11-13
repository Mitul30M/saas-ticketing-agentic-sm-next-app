// Single source for backend payload shapes.
// Copied from the backend's plans/frontend-api-guide.MD §8. If the backend and
// this file disagree, the backend wins and the guide is updated in the same
// backend change (guide §14). Do not invent fields here.

// ---------- enums ----------
export type TicketStatus =
  | "new"
  | "triaging"
  | "awaiting_approval"
  | "awaiting_human"
  | "resolved"
  | "failed";
export type AgentOutcome = "draft_ready" | "action_proposed" | "escalated" | "failed";
export type HandledBy = "unassigned" | "agent" | "human";
export type Category =
  | "invoice_question"
  | "refund_request"
  | "plan_change"
  | "login_account_access"
  | "api_integration"
  | "sync_issues"
  | "service_outage"
  | "security_incident"
  | "feature_request"
  | "other";
export type Priority = "low" | "medium" | "high" | "urgent";
export type Sentiment = "positive" | "neutral" | "negative";
export type Queue =
  | "billing"
  | "account"
  | "technical"
  | "security"
  | "incidents"
  | "product"
  | "general";
export type ApprovalKind = "refund" | "plan_change" | "send_reply";
export type ActionStatus = "pending_approval" | "approved" | "rejected" | "executed" | "failed";
export type Decision = "approve" | "reject" | "edit";
export type TraceKind = "node" | "tool" | "llm";
export type PlanEffective = "now" | "next_cycle";

// ---------- tickets ----------
export interface TicketListItem {
  id: string;
  subject: string;
  status: TicketStatus;
  queue: Queue | null;
  category: Category | null;
  priority: Priority | null;
  sentiment: Sentiment | null;
  escalated: boolean;
  handled_by: HandledBy;
  received_at: string; // ISO-8601
}

export interface TicketListResponse {
  items: TicketListItem[];
  page: number; // 1-based
  limit: number; // 1..100
}

export interface TriageReasons {
  category?: string;
  priority?: string;
  sentiment?: string;
}

export interface ProposedAction {
  kind: ApprovalKind;
  ref: string; // refund id | plan_change id | ticket id
  status: ActionStatus;
  amount_cents: number | null;
  invoice_id: string | null;
  evidence: Record<string, unknown> | null; // kind-dependent, see guide §4.4
  from_plan_id: string | null;
  to_plan_id: string | null;
  effective: PlanEffective | null;
}

export interface SentReply {
  body: string;
  approved_by: string;
  delivered_at: string | null;
}

export interface TicketDetail extends TicketListItem {
  body: string;
  triage_reasons: TriageReasons | null;
  kb_supported: boolean | null;
  draft_reply: string | null;
  draft_citations: string[] | null;
  escalation_reason: string | null;
  injection_suspected: boolean;
  flags: string[];
  agent_outcome: AgentOutcome | null;
  from_email: string | null;
  from_name: string | null;
  customer_id: string | null;
  proposed_actions: ProposedAction[];
  sent_reply: SentReply | null;
}

export interface TraceEvent {
  trace_id: string;
  node: string;
  kind: TraceKind;
  status: "ok" | "error";
  error: string | null;
  duration_ms: number | null;
  tokens_in: number | null;
  tokens_out: number | null;
  cost_usd: string | null; // Postgres numeric → string
  cache_hit: boolean | null;
  started_at: string;
}
export interface TraceResponse {
  items: TraceEvent[];
}

// ---------- approvals ----------
export interface PendingApproval {
  kind: ApprovalKind;
  ref: string;
  ticket_id: string;
  status: "pending_approval";
  amount_cents: number | null;
  invoice_id: string | null;
  evidence: Record<string, unknown> | null;
  subject: string;
  draft_reply: string | null;
  draft_citations: string[] | null;
  flags: string[];
  injection_suspected: boolean;
  from_plan_id: string | null;
  to_plan_id: string | null;
  effective: PlanEffective | null;
}
export interface PendingApprovalsResponse {
  items: PendingApproval[];
}

export interface DecideRequest {
  decision: Decision;
  note?: string | null;
  edited_text?: string | null;
}
export interface DecideResponse {
  approval_id: string;
  status: "accepted";
}

// ---------- submit ----------
export interface CreateTicketRequest {
  subject: string; // 1..200
  body: string; // 1..10000
  from_email: string; // 3..320
  from_name?: string | null; // <=200
}
export interface CreateTicketResponse {
  ticket_id: string;
  duplicate: boolean;
}

// ---------- run ----------
export interface RerunResponse {
  ticket_id: string;
  job_id: string;
}

// ---------- customers / kb ----------
export interface Customer {
  id: string;
  external_ref: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string;
  status: string; // account status, not ticket status
  language: string | null;
  plan_id: string | null;
}

export interface KbArticleSummary {
  id: string;
  title: string;
  updated: string;
}
export interface KbArticlesResponse {
  items: KbArticleSummary[];
}
export interface KbArticle extends KbArticleSummary {
  category: string | null;
  body: string;
}
export interface KbSearchHit {
  kb_id: string;
  chunk_idx: number;
  title: string;
  text: string;
  updated_at: string;
}
export interface KbSearchResponse {
  items: KbSearchHit[];
}

// ---------- metrics ----------
export interface MetricsSummary {
  tickets_by_status: Array<{ status: TicketStatus; count: number }>;
  outcomes: Array<{ outcome: AgentOutcome | "pending"; count: number }>;
  trace: {
    events: number;
    tokens_in: number;
    tokens_out: number;
    cost_usd: string;
    avg_latency_ms: string;
    p95_latency_ms: number;
    actual_cost_usd: number;
    shadow_cost_usd: number;
    shadow_price_model: string;
    llm_cache_hit_rate: number;
    tool_error_rate: number;
  };
  tickets_by_category: Array<{ category: Category | "unclassified"; count: number }>;
  tickets_by_queue: Array<{ queue: Queue | "unassigned"; count: number }>;
  escalations_by_reason: Array<{ reason: string; count: number }>;
  node_latency: Array<{
    node: string;
    events: number;
    avg_latency_ms: string;
    p95_latency_ms: number;
  }>;
  jobs: Array<{ status: "queued" | "running" | "done" | "failed"; count: number }>;
}

// ---------- health ----------
export interface HealthResponse {
  status: string;
}

// ---------- errors ----------
export interface ValidationError {
  type: string;
  loc: Array<string | number>;
  msg: string;
  input?: unknown;
  ctx?: Record<string, unknown>;
}
export type ErrorBody = { detail: string } | { detail: ValidationError[] };

export function isValidationError(body: ErrorBody): body is { detail: ValidationError[] } {
  return Array.isArray((body as { detail?: unknown }).detail);
}
