import { describe, expect, it } from "vitest";
import type { TicketStatus } from "@/lib/api-types";
import {
  actionStatus,
  approvalKind,
  category,
  escalationCopy,
  flagCopy,
  handledBy,
  isTerminalStatus,
  outcome,
  priority,
  queue,
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
