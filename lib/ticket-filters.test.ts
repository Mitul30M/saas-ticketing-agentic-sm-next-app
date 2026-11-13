import { describe, expect, it } from "vitest";
import {
  filtersKey,
  hasActiveFilters,
  parseTicketFilters,
  ticketApiParams,
  ticketSearch,
} from "@/lib/ticket-filters";

describe("parseTicketFilters", () => {
  it("uses defaults for an empty URL", () => {
    expect(parseTicketFilters({})).toEqual({
      tab: "all",
      q: "",
      queue: null,
      page: 1,
      limit: 20,
    });
  });

  it("parses a full URL", () => {
    const filters = parseTicketFilters({
      tab: "needs_human",
      q: "  refund  ",
      queue: "billing",
      page: "2",
    });
    expect(filters.tab).toBe("needs_human");
    expect(filters.q).toBe("refund");
    expect(filters.queue).toBe("billing");
    expect(filters.page).toBe(2);
  });

  it("falls back instead of forwarding junk to the backend", () => {
    expect(parseTicketFilters({ tab: "nope", queue: "nope", page: "-4" })).toEqual({
      tab: "all",
      q: "",
      queue: null,
      page: 1,
      limit: 20,
    });
    expect(parseTicketFilters({ page: "abc" }).page).toBe(1);
  });

  it("takes the first value when a query repeats", () => {
    expect(parseTicketFilters({ q: ["first", "second"] }).q).toBe("first");
  });
});

describe("backend params", () => {
  it("maps tabs to status/escalated only", () => {
    expect(ticketApiParams(parseTicketFilters({ tab: "awaiting_approval" }))).toMatchObject({
      status: "awaiting_approval",
      page: 1,
      limit: 20,
    });
    const human = ticketApiParams(parseTicketFilters({ tab: "needs_human" }));
    expect(human.escalated).toBe(true);
    expect(human.status).toBeUndefined();
  });

  it("does not send empty strings", () => {
    const params = ticketApiParams(parseTicketFilters({ tab: "all" }));
    expect(params.q).toBeUndefined();
    expect(params.queue).toBeUndefined();
  });

  it("serialises a query string without undefined values", () => {
    const search = ticketSearch(parseTicketFilters({ tab: "resolved", q: "refund", page: "3" }));
    const parsed = new URLSearchParams(search);
    expect(parsed.get("status")).toBe("resolved");
    expect(parsed.get("q")).toBe("refund");
    expect(parsed.get("page")).toBe("3");
    expect(search).not.toContain("undefined");
  });
});

describe("filter identity", () => {
  it("changes the key when any filter changes", () => {
    const base = parseTicketFilters({});
    expect(filtersKey(base)).not.toBe(filtersKey(parseTicketFilters({ page: "2" })));
    expect(filtersKey(base)).not.toBe(filtersKey(parseTicketFilters({ q: "x" })));
  });

  it("knows when filters are active", () => {
    expect(hasActiveFilters(parseTicketFilters({}))).toBe(false);
    expect(hasActiveFilters(parseTicketFilters({ tab: "failed" }))).toBe(true);
    expect(hasActiveFilters(parseTicketFilters({ q: "x" }))).toBe(true);
  });
});
