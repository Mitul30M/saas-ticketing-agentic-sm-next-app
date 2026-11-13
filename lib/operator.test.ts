import { describe, expect, it } from "vitest";
import { operatorInitials, safeNextPath, validateOperatorName } from "@/lib/operator";

describe("operator label validation", () => {
  it("trims and accepts a normal name", () => {
    expect(validateOperatorName("  Mia Chen  ")).toEqual({ ok: true, name: "Mia Chen" });
  });

  it("rejects empty, multi-line and oversized labels", () => {
    expect(validateOperatorName("   ").ok).toBe(false);
    expect(validateOperatorName("Mia\nChen").ok).toBe(false);
    expect(validateOperatorName("x".repeat(101)).ok).toBe(false);
    expect(validateOperatorName(42).ok).toBe(false);
  });
});

describe("safe next path", () => {
  it("only returns console paths", () => {
    expect(safeNextPath("/dashboard/approvals?tab=all")).toBe("/dashboard/approvals?tab=all");
    expect(safeNextPath("https://evil.example")).toBe("/dashboard");
    expect(safeNextPath("//evil.example")).toBe("/dashboard");
    expect(safeNextPath("/login")).toBe("/dashboard");
    expect(safeNextPath(null)).toBe("/dashboard");
  });
});

describe("operator initials", () => {
  it("takes up to two initials", () => {
    expect(operatorInitials("Mia Chen")).toBe("MC");
    expect(operatorInitials("mia")).toBe("M");
    expect(operatorInitials("  ")).toBe("?");
  });
});
