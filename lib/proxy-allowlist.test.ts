import { describe, expect, it } from "vitest";
import { isConsolePathAllowed } from "@/lib/proxy-allowlist";

const TICKET = "3faaf17b-d58b-458b-9373-6f43f160b0de";
const ACTION = "378ff6bc-b661-4555-a193-296227acf414";
const CUSTOMER = "5d4f8020-5b54-5bf3-9027-dc7eb713b886";

describe("console allow-list", () => {
  it("allows the read surface", () => {
    expect(isConsolePathAllowed(["tickets"], "GET")).toBe(true);
    expect(isConsolePathAllowed(["tickets", TICKET], "GET")).toBe(true);
    expect(isConsolePathAllowed(["tickets", TICKET, "trace"], "GET")).toBe(true);
    expect(isConsolePathAllowed(["approvals", "pending"], "GET")).toBe(true);
    expect(isConsolePathAllowed(["customers", CUSTOMER], "GET")).toBe(true);
    expect(isConsolePathAllowed(["kb", "articles"], "GET")).toBe(true);
    expect(isConsolePathAllowed(["kb", "articles", "KB-006"], "GET")).toBe(true);
    expect(isConsolePathAllowed(["kb", "search"], "GET")).toBe(true);
    expect(isConsolePathAllowed(["metrics", "summary"], "GET")).toBe(true);
  });

  it("allows the two mutating routes with the right verbs", () => {
    expect(isConsolePathAllowed(["tickets", TICKET, "run"], "POST")).toBe(true);
    for (const kind of ["refund", "plan_change", "send_reply"]) {
      expect(isConsolePathAllowed(["approvals", kind, ACTION, "decide"], "POST")).toBe(true);
    }
  });

  it("rejects admin routes even with a token", () => {
    expect(isConsolePathAllowed(["admin", "seed"], "POST")).toBe(false);
    expect(isConsolePathAllowed(["admin", "ingest-kb"], "POST")).toBe(false);
    expect(isConsolePathAllowed(["ADMIN", "seed"], "POST")).toBe(false);
  });

  it("rejects writes the UI does not own", () => {
    expect(isConsolePathAllowed(["tickets"], "POST")).toBe(false);
    expect(isConsolePathAllowed(["tickets", TICKET], "DELETE")).toBe(false);
    expect(isConsolePathAllowed(["tickets", TICKET, "run"], "GET")).toBe(false);
    expect(isConsolePathAllowed(["approvals", "pending"], "POST")).toBe(false);
    expect(isConsolePathAllowed(["approvals", "refund", ACTION], "POST")).toBe(false);
  });

  it("rejects malformed or unexpected paths", () => {
    expect(isConsolePathAllowed([], "GET")).toBe(false);
    expect(isConsolePathAllowed([""], "GET")).toBe(false);
    expect(isConsolePathAllowed(["tickets", "..", "admin"], "GET")).toBe(false);
    expect(isConsolePathAllowed(["tickets", "not-a-uuid"], "GET")).toBe(false);
    expect(isConsolePathAllowed(["kb", "articles", "KB-006", "extra"], "GET")).toBe(false);
    expect(isConsolePathAllowed(["approvals", "nonsense", ACTION, "decide"], "POST")).toBe(false);
    expect(isConsolePathAllowed(["tickets", TICKET, "trace", "extra"], "GET")).toBe(false);
    expect(isConsolePathAllowed(["unknown"], "GET")).toBe(false);
  });
});
