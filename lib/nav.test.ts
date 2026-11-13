import { describe, expect, it } from "vitest";
import { consoleSectionLabel, isNavActive } from "@/lib/nav";

describe("navigation", () => {
  it("marks the tickets item active on the list and detail", () => {
    expect(isNavActive("/dashboard", true, "/dashboard")).toBe(true);
    expect(isNavActive("/dashboard", true, "/dashboard/tickets/abc")).toBe(true);
    expect(isNavActive("/dashboard", true, "/dashboard/approvals")).toBe(false);
  });

  it("uses prefix matching for nested sections", () => {
    expect(isNavActive("/dashboard/approvals", false, "/dashboard/approvals")).toBe(true);
    expect(isNavActive("/dashboard/approvals", false, "/dashboard/approvals/x")).toBe(true);
    expect(isNavActive("/dashboard/metrics", false, "/dashboard/kb")).toBe(false);
  });

  it("labels the breadcrumb without inventing a ticket subject", () => {
    expect(consoleSectionLabel("/dashboard")).toBe("Tickets");
    expect(consoleSectionLabel("/dashboard/tickets/abc")).toBe("Ticket detail");
    expect(consoleSectionLabel("/dashboard/settings")).toBe("Settings");
    expect(consoleSectionLabel("/dashboard/unknown")).toBe("Tickets");
  });
});
