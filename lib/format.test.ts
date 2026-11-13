import { describe, expect, it } from "vitest";
import {
  count,
  duration,
  formatDate,
  formatDateTime,
  money,
  numeric,
  percent,
  relative,
  shortId,
  usd,
} from "@/lib/format";

describe("money", () => {
  it("formats integer cents as USD", () => {
    expect(money(500)).toBe("$5.00");
    expect(money(0)).toBe("$0.00");
    expect(money(123456)).toBe("$1,234.56");
  });

  it("never renders NaN or $NaN", () => {
    expect(money(null)).toBe("—");
    expect(money(undefined)).toBe("—");
    expect(money(Number.NaN)).toBe("—");
  });
});

describe("numeric", () => {
  it("normalises Postgres numeric strings", () => {
    expect(numeric("16.0476190476190476")).toBeCloseTo(16.0476, 4);
    expect(numeric("0")).toBe(0);
    expect(numeric(42)).toBe(42);
  });

  it("returns null for empty or invalid values", () => {
    expect(numeric(null)).toBeNull();
    expect(numeric(undefined)).toBeNull();
    expect(numeric("")).toBeNull();
    expect(numeric("   ")).toBeNull();
    expect(numeric("nope")).toBeNull();
  });
});

describe("relative", () => {
  const now = new Date("2026-11-13T06:42:00Z");

  it("renders a strict relative time", () => {
    expect(relative("2026-11-13T06:30:00Z", now)).toBe("12 minutes ago");
  });

  it("handles bad input", () => {
    expect(relative(null, now)).toBe("—");
    expect(relative("not-a-date", now)).toBe("—");
  });
});

describe("duration", () => {
  it("uses ms, seconds and minutes", () => {
    expect(duration(1)).toBe("1 ms");
    expect(duration(820)).toBe("820 ms");
    expect(duration(4600)).toBe("4.6 s");
    expect(duration(64_000)).toBe("1 m 04 s");
  });

  it("handles missing values", () => {
    expect(duration(null)).toBe("—");
  });
});

describe("identifiers and dates", () => {
  it("shortens ids without inventing one", () => {
    expect(shortId("8d0c7e09-01f6-4a69-8ce1-7f49284a83d4")).toBe("8d0c7e09");
    expect(shortId(null)).toBe("—");
  });

  it("formats dates in a stable shape", () => {
    expect(formatDate("2026-03-01")).toBe("1 Mar 2026");
    expect(formatDateTime("2026-11-13T06:37:12Z")).toMatch(/^13 Nov 2026, \d{2}:\d{2}$/);
    expect(formatDate("bad")).toBe("—");
  });
});

describe("rates and counts", () => {
  it("turns a 0..1 rate into a percentage", () => {
    expect(percent(0.315789)).toBe("31.6%");
    expect(percent(0)).toBe("0.0%");
    expect(percent(null)).toBe("—");
  });

  it("formats USD floats and numeric strings", () => {
    expect(usd(0.1234)).toBe("$0.1234");
    expect(usd("0")).toBe("$0.0000");
    expect(usd(null)).toBe("—");
  });

  it("groups counts", () => {
    expect(count(1432)).toBe("1,432");
    expect(count(null)).toBe("—");
  });
});
