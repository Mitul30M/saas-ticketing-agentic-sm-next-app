import { describe, expect, it } from "vitest";
import { validateSubmit, type SubmitValues } from "@/lib/submit-validation";

const valid: SubmitValues = {
  from_name: "Aaron Martinez",
  from_email: "aaron.martinez.50@example.nimbus.test",
  subject: "Refund policy question",
  body: "Please explain the refund policy and the 30-day window.",
};

describe("submit validation", () => {
  it("accepts a valid message", () => {
    expect(validateSubmit(valid)).toEqual({});
  });

  it("requires an email, subject and body", () => {
    const errors = validateSubmit({ ...valid, from_email: "", subject: "  ", body: "\n" });
    expect(errors.from_email).toBeDefined();
    expect(errors.subject).toBeDefined();
    expect(errors.body).toBeDefined();
  });

  it("rejects malformed email addresses", () => {
    for (const email of ["nope", "a@b", "a b@example.com", "@example.com"]) {
      expect(validateSubmit({ ...valid, from_email: email }).from_email).toBeDefined();
    }
  });

  it("enforces the backend length limits", () => {
    expect(validateSubmit({ ...valid, from_name: "x".repeat(201) }).from_name).toBeDefined();
    expect(validateSubmit({ ...valid, subject: "x".repeat(201) }).subject).toBeDefined();
    expect(validateSubmit({ ...valid, body: "x".repeat(10_001) }).body).toBeDefined();
    expect(validateSubmit({ ...valid, from_email: `${"x".repeat(320)}@a.co` }).from_email).toBeDefined();
  });
});
