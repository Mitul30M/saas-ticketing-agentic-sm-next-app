import { format, formatDistanceStrict } from "date-fns";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const DASH = "—";

/**
 * Money is always integer cents from the backend. Formatting happens here and
 * nowhere else so no screen can disagree about a price.
 */
export function money(cents: number | null | undefined): string {
  if (cents === null || cents === undefined || !Number.isFinite(cents)) return DASH;
  return currency.format(cents / 100);
}

/** Postgres `numeric` columns arrive as strings; normalise once, here. */
export function numeric(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" && value.trim() === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/** "12 minutes ago" — exact ISO belongs in a `title` tooltip, not the cell. */
export function relative(iso: string | null | undefined, now: Date = new Date()): string {
  if (!iso) return DASH;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return DASH;
  return formatDistanceStrict(date, now, { addSuffix: true });
}

export function duration(ms: number | null | undefined): string {
  if (ms === null || ms === undefined || !Number.isFinite(ms)) return DASH;
  if (ms < 1000) return `${Math.round(ms)} ms`;
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)} s`;
  const whole = Math.floor(seconds);
  const minutes = Math.floor(whole / 60);
  const remainder = whole % 60;
  return `${minutes} m ${String(remainder).padStart(2, "0")} s`;
}

export function shortId(id: string | null | undefined): string {
  if (!id) return DASH;
  return id.slice(0, 8);
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return DASH;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return DASH;
  return format(date, "d MMM yyyy");
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return DASH;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return DASH;
  return format(date, "d MMM yyyy, HH:mm");
}

/** Accepts a 0..1 rate and renders a percentage. */
export function percent(rate: number | null | undefined, digits = 1): string {
  if (rate === null || rate === undefined || !Number.isFinite(rate)) return DASH;
  return `${(rate * 100).toFixed(digits)}%`;
}

/** USD values that arrive as floats or Postgres numeric strings. */
export function usd(value: string | number | null | undefined, digits = 4): string {
  const parsed = numeric(value);
  if (parsed === null) return DASH;
  return `$${parsed.toFixed(digits)}`;
}

export function count(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return DASH;
  return new Intl.NumberFormat("en-US").format(value);
}
