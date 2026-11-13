import { describe, expect, it } from "vitest";
import { detailMessage, fieldErrorsFromDetail, normalizeDetail } from "@/lib/api-error";

describe("error normalisation", () => {
  it("reads a string detail", () => {
    expect(normalizeDetail({ detail: "ticket not found" })).toBe("ticket not found");
    expect(detailMessage("a final decision already exists")).toBe("a final decision already exists");
  });

  it("reads a Pydantic detail array and maps it to fields", () => {
    const body = {
      detail: [
        { type: "string_too_short", loc: ["body", "subject"], msg: "String should have at least 1 character" },
        { type: "value_error", loc: ["body", "from_email"], msg: "Invalid email" },
      ],
    };
    const detail = normalizeDetail(body);
    expect(Array.isArray(detail)).toBe(true);
    expect(detailMessage(detail)).toContain("at least 1 character");
    expect(fieldErrorsFromDetail(detail)).toEqual({
      subject: "String should have at least 1 character",
      from_email: "Invalid email",
    });
  });

  it("does not throw on unknown bodies", () => {
    expect(normalizeDetail(null)).toBe("Request failed");
    expect(normalizeDetail("plain")).toBe("Request failed");
  });
});
