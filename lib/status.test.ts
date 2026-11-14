import { describe, expect, it } from "vitest";
import type { TicketStatus } from "@/lib/api-types";
import {
  actionStatus,
  approvalKind,
  category,
  escalationCopy,
  flagCopy,
  handledBy,
  isAmendedRefusalDraft,
  isTerminalStatus,
  outcome,
  priority,
  queue,
  rerunBlockReason,
  sentiment,
  ticketStatus,
} from "@/lib/status";

describe("status maps", () => {
  it("labels every ticket status and never hides the raw value", () => {
    expect(ticketStatus("awaiting_approval").label).toBe("Awaiting approval");
    expect(ticketStatus("failed").variant).toBe("destructive");
    expect(ticketStatus("unknown" as TicketStatus).label).toBe("unknown");
  });

  it("maps priorities, queues and sentiment", () => {
    expect(priority("urgent")?.variant).toBe("destructive");
    expect(priority(null)).toBeNull();
    expect(queue("billing")?.label).toBe("Billing");
    expect(queue(null)).toBeNull();
    expect(sentiment("negative")?.label).toBe("Negative");
  });

  it("maps outcomes and approval kinds", () => {
    expect(outcome("escalated")?.label).toBe("Escalated");
    expect(outcome(null)).toBeNull();
    expect(approvalKind("send_reply").label).toBe("Send reply");
    expect(actionStatus("executed").label).toBe("Executed");
    expect(handledBy("human").label).toBe("Human");
  });

  it("labels categories with a fallback for unclassified rows", () => {
    expect(category("invoice_question")).toBe("Invoice question");
    expect(category(null)).toBe("Unclassified");
  });
});

describe("escalation copy", () => {
  it("returns friendly copy for known codes", () => {
    expect(escalationCopy("LOW_CONFIDENCE")).toBe(
      "The knowledge base doesn't cover this confidently"
    );
    expect(escalationCopy("ownership_mismatch")).toContain("belong");
  });

  it("returns null for unknown codes so the caller shows the raw value", () => {
    expect(escalationCopy("SOMETHING_NEW")).toBeNull();
    expect(escalationCopy(null)).toBeNull();
  });

  it("copies flags but falls back to the raw flag name", () => {
    expect(flagCopy("instruction_override")).toContain("ignore");
    expect(flagCopy("mystery_flag")).toBe("mystery_flag");
  });
});

describe("terminal state", () => {
  it("stops polling only on resolved/failed", () => {
    expect(isTerminalStatus("resolved")).toBe(true);
    expect(isTerminalStatus("failed")).toBe(true);
    expect(isTerminalStatus("awaiting_human")).toBe(false);
    expect(isTerminalStatus("triaging")).toBe(false);
  });
});

describe("re-run guard", () => {
  it("allows a seeded `new` ticket with no job", () => {
    expect(rerunBlockReason("new")).toBeNull();
  });

  it("blocks while a run is active or a decision is pending", () => {
    expect(rerunBlockReason("triaging")).toContain("already running");
    expect(rerunBlockReason("awaiting_approval")).toContain("pending approval");
  });

  it("allows terminal and human-parked states", () => {
    expect(rerunBlockReason("resolved")).toBeNull();
    expect(rerunBlockReason("failed")).toBeNull();
    expect(rerunBlockReason("awaiting_human")).toBeNull();
  });
});

describe("amended refusal drafts", () => {
  const refused = {
    agent_outcome: "escalated",
    escalation_reason: "business_rule",
    draft_reply: "Refunds are available within 30 days [KB-006]. A specialist will follow up.",
  };

  it("is true for an escalated draft with a tool-level refusal reason", () => {
    expect(isAmendedRefusalDraft(refused)).toBe(true);
  });

  it("is false for LOW_CONFIDENCE", () => {
    expect(isAmendedRefusalDraft({ ...refused, escalation_reason: "LOW_CONFIDENCE" })).toBe(false);
  });

  it("is false when there is no draft", () => {
    expect(isAmendedRefusalDraft({ ...refused, draft_reply: null })).toBe(false);
  });

  it("is false when the agent proposed an action instead of escalating", () => {
    expect(isAmendedRefusalDraft({ ...refused, agent_outcome: "action_proposed" })).toBe(false);
  });

  it("is false when no escalation reason is present", () => {
    expect(isAmendedRefusalDraft({ ...refused, escalation_reason: null })).toBe(false);
  });
});
