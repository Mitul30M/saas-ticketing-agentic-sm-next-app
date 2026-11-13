import { describe, expect, it } from "vitest";
import type { PendingApproval } from "@/lib/api-types";
import {
  approvalCounts,
  approvalKey,
  approveGate,
  filterApprovals,
  groupApprovals,
  isApprovalFilter,
} from "@/lib/approvals";

function approval(overrides: Partial<PendingApproval>): PendingApproval {
  return {
    kind: "send_reply",
    ref: "ticket-1",
    ticket_id: "ticket-1",
    status: "pending_approval",
    amount_cents: null,
    invoice_id: null,
    evidence: { citations: ["KB-006"], flags: [] },
    subject: "Refund policy question",
    draft_reply: "Refunds are available within 30 days [KB-006].",
    draft_citations: ["KB-006"],
    flags: [],
    injection_suspected: false,
    from_plan_id: null,
    to_plan_id: null,
    effective: null,
    ...overrides,
  };
}

describe("approval filters", () => {
  const items = [
    approval({ kind: "send_reply" }),
    approval({ kind: "refund", ref: "r1", ticket_id: "t2" }),
    approval({ kind: "refund", ref: "r2", ticket_id: "t3" }),
  ];

  it("filters client-side by kind", () => {
    expect(filterApprovals(items, "all")).toHaveLength(3);
    expect(filterApprovals(items, "refund")).toHaveLength(2);
    expect(filterApprovals(items, "plan_change")).toHaveLength(0);
  });

  it("counts each kind", () => {
    expect(approvalCounts(items)).toEqual({ all: 3, send_reply: 1, refund: 2, plan_change: 0 });
  });

  it("validates filter values", () => {
    expect(isApprovalFilter("refund")).toBe(true);
    expect(isApprovalFilter("nope")).toBe(false);
  });
});

describe("groupApprovals", () => {
  it("groups items by ticket in first-seen order", () => {
    const groups = groupApprovals([
      approval({ kind: "refund", ref: "r1", ticket_id: "t2" }),
      approval({ kind: "send_reply", ticket_id: "t1" }),
      approval({ kind: "plan_change", ref: "p1", ticket_id: "t2" }),
    ]);
    expect(groups.map((group) => group.ticketId)).toEqual(["t2", "t1"]);
    expect(groups[0].items).toHaveLength(2);
    expect(approvalKey(groups[0].items[0])).toBe("refund:r1");
  });
});

describe("approveGate", () => {
  it("allows a complete grounded reply", () => {
    expect(approveGate(approval({}))).toEqual({ allowed: true, reason: null });
  });

  it("allows a complete refund and plan change", () => {
    expect(
      approveGate(approval({ kind: "refund", amount_cents: 500, invoice_id: "INV-0050-M1" }))
    ).toEqual({ allowed: true, reason: null });
    expect(approveGate(approval({ kind: "plan_change", to_plan_id: "PLAN-PRO" }))).toEqual({
      allowed: true,
      reason: null,
    });
  });

  it("blocks when evidence is missing", () => {
    const gate = approveGate(approval({ evidence: null }));
    expect(gate.allowed).toBe(false);
    expect(gate.reason).toContain("evidence");
    expect(approveGate(approval({ evidence: {} })).allowed).toBe(false);
  });

  it("blocks a refund without an amount or invoice", () => {
    expect(approveGate(approval({ kind: "refund", invoice_id: "INV-1" })).allowed).toBe(false);
    expect(approveGate(approval({ kind: "refund", amount_cents: 500 })).allowed).toBe(false);
  });

  it("blocks a plan change without a target plan", () => {
    expect(approveGate(approval({ kind: "plan_change" })).allowed).toBe(false);
  });

  it("blocks an empty reply draft", () => {
    expect(approveGate(approval({ draft_reply: "   " })).allowed).toBe(false);
    expect(approveGate(approval({ draft_reply: null })).allowed).toBe(false);
  });
});
